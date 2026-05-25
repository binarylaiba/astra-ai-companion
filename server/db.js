import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: String,
  isUser: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'User' },
  preferences: {
    theme: { type: String, default: 'space' }
  },
  chatHistory: [messageSchema]
});

export const User = mongoose.model('User', userSchema);

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not found in .env. Running in Mock Memory Mode.");
      return false;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("💾 MongoDB Connected Successfully.");
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    return false;
  }
};
