import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schema for messages
const fileAttachmentSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  content: String // Raw text or base64 content
});

const messageSchema = new mongoose.Schema({
  text: String,
  isUser: Boolean,
  timestamp: { type: Date, default: Date.now },
  files: [fileAttachmentSchema],
  regenerated: { type: Boolean, default: false }
});

// Schema for independent Chats collection
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  folder: { type: String, default: '' }, // Folder name, empty string for root
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

// Schema for independent Memory logs collection
const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['preference', 'topic', 'goal', 'note', 'general'],
    default: 'general'
  },
  createdAt: { type: Date, default: Date.now }
});

// Schema for Uploads collection
const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  content: { type: String, required: true }, // Extracted text or preview
  createdAt: { type: Date, default: Date.now }
});

// Schema for Settings collection
const settingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, default: 'User' },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  preferences: {
    theme: { type: String, default: 'space' },
    accentColor: { type: String, default: 'cyan' },
    fontSize: { type: String, default: 'medium' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Password compare helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export const Chat = mongoose.model('Chat', chatSchema);
export const Memory = mongoose.model('Memory', memorySchema);
export const Upload = mongoose.model('Upload', uploadSchema);
export const Setting = mongoose.model('Setting', settingSchema);

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not found in .env. Running in Mock Memory Mode.");
      return false;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("💾 MongoDB Connected Successfully.");
    
    // Run DB migrations in background to move any legacy embedded guest chats
    runDbMigration().catch(err => {
      console.error("❌ Legacy DB Migration Error:", err);
    });

    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    return false;
  }
};

// Automigration for legacy embedded database structure
async function runDbMigration() {
  const user = await User.findOne({ name: 'User' });
  if (!user) return;

  // Check if user has legacy raw chats/memories object keys
  const rawUser = user.toObject();
  
  if (rawUser.chats && rawUser.chats.length > 0) {
    console.log(`🧹 Migrating ${rawUser.chats.length} legacy embedded chats to Chats collection...`);
    for (const c of rawUser.chats) {
      const exists = await Chat.findById(c._id);
      if (!exists) {
        await Chat.create({
          _id: c._id,
          userId: user._id,
          title: c.title,
          folder: c.folder,
          pinned: c.pinned,
          archived: c.archived,
          favorite: c.favorite,
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date(),
          messages: c.messages || []
        });
      }
    }
    // Remove field
    await User.updateOne({ _id: user._id }, { $unset: { chats: "" } });
    console.log("✅ Embedded chats migrated and cleaned.");
  }

  if (rawUser.memories && rawUser.memories.length > 0) {
    console.log(`🧹 Migrating ${rawUser.memories.length} legacy embedded memories to Memories collection...`);
    for (const m of rawUser.memories) {
      const exists = await Memory.findById(m._id);
      if (!exists) {
        await Memory.create({
          _id: m._id,
          userId: user._id,
          content: m.content,
          category: m.category || 'general',
          createdAt: m.createdAt || new Date()
        });
      }
    }
    // Remove field
    await User.updateOne({ _id: user._id }, { $unset: { memories: "" } });
    console.log("✅ Embedded memories migrated and cleaned.");
  }
}
