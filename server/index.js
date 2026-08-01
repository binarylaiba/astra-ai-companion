import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, User, Chat, Memory, Upload, Setting } from './db.js';
import { createRequire } from 'module';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
// Support large JSON bodies for base64 file payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'astra_stellar_navigation_key';

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_init' });

// Connect to DB
const isDbConnected = await connectDB();

// Mock database fallback if MongoDB is not connected
const mockDb = {
  user: {
    _id: 'mock-guest-id',
    name: 'Guest User',
    preferences: {
      theme: 'space',
      accentColor: 'cyan',
      fontSize: 'medium'
    }
  },
  users: [], // Store registered mock users
  chats: [], // Store mock chats
  memories: [], // Store mock memories
  uploads: [], // Store mock uploads
  settings: [] // Store mock settings
};

// --- Authentication Middleware ---

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, name, username, email }
        return next();
      } catch (jwtErr) {
        console.warn("⚠️ Invalid JWT token. Falling back to guest mode.");
      }
    }

    // Default Guest user fallback
    let guestUser;
    let guestId = 'mock-guest-id';

    if (isDbConnected) {
      guestUser = await User.findOne({ name: 'User' });
      if (!guestUser) {
        guestUser = new User({ name: 'User' });
        await guestUser.save();
      }
      guestId = guestUser._id.toString();
    } else {
      guestUser = mockDb.user;
    }

    req.user = {
      id: guestId,
      name: guestUser.name,
      isGuest: true,
      preferences: guestUser.preferences
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication system error" });
  }
}

// Helper to fetch user preferences
async function getUserPreferences(userId) {
  if (isDbConnected && mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId);
    if (user) return user.preferences;
  }
  if (userId === 'mock-guest-id') return mockDb.user.preferences;
  const mockUser = mockDb.users.find(u => u._id === userId);
  return mockUser ? mockUser.preferences : mockDb.user.preferences;
}

// --- API Endpoints ---

// 1. Auth Endpoints

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (isDbConnected) {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'Username or Email is already registered' });
      }

      const newUser = new User({ name: name || username, username, email, password });
      await newUser.save();
      
      const token = jwt.sign({ id: newUser._id, name: newUser.name, username, email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, username, email, preferences: newUser.preferences } });
    } else {
      const existingUser = mockDb.users.find(u => u.username === username || u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'Username or Email is already registered' });
      }

      const mockId = 'mock-' + Date.now();
      const newUser = {
        _id: mockId,
        name: name || username,
        username,
        email,
        password, // stored plain for simplicity in mock mode
        preferences: { theme: 'space', accentColor: 'cyan', fontSize: 'medium' }
      };
      mockDb.users.push(newUser);
      
      const token = jwt.sign({ id: mockId, name: newUser.name, username, email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: mockId, name: newUser.name, username, email, preferences: newUser.preferences } });
    }
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Credentials and password are required' });
    }

    if (isDbConnected) {
      const user = await User.findOne({ $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }] });
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      const token = jwt.sign({ id: user._id, name: user.name, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, preferences: user.preferences } });
    } else {
      const user = mockDb.users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username/email or password' });
      }

      const token = jwt.sign({ id: user._id, name: user.name, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, preferences: user.preferences } });
    }
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.isGuest) {
      return res.json({ user: { id: req.user.id, name: req.user.name, isGuest: true, preferences: req.user.preferences } });
    }

    if (isDbConnected) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, preferences: user.preferences } });
    } else {
      const user = mockDb.users.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, preferences: user.preferences } });
    }
  } catch (error) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

// 2. User Settings & Preferences

app.get('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await getUserPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

app.post('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme, accentColor, fontSize } = req.body;
    let updatedPrefs;

    if (isDbConnected && !req.user.isGuest) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (theme) user.preferences.theme = theme;
        if (accentColor) user.preferences.accentColor = accentColor;
        if (fontSize) user.preferences.fontSize = fontSize;
        await user.save();
        updatedPrefs = user.preferences;
      }
    } else if (isDbConnected && req.user.isGuest) {
      const guest = await User.findOne({ name: 'User' });
      if (guest) {
        if (theme) guest.preferences.theme = theme;
        if (accentColor) guest.preferences.accentColor = accentColor;
        if (fontSize) guest.preferences.fontSize = fontSize;
        await guest.save();
        updatedPrefs = guest.preferences;
      }
    } else {
      const activeUser = req.user.isGuest ? mockDb.user : mockDb.users.find(u => u._id === req.user.id);
      if (activeUser) {
        if (theme) activeUser.preferences.theme = theme;
        if (accentColor) activeUser.preferences.accentColor = accentColor;
        if (fontSize) activeUser.preferences.fontSize = fontSize;
        updatedPrefs = activeUser.preferences;
      }
    }

    res.json(updatedPrefs || mockDb.user.preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// 3. Chat Conversations List

app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const userChats = await Chat.find({ userId: req.user.id }).sort({ updatedAt: -1 });
      const summaries = userChats.map(c => ({
        _id: c._id,
        title: c.title,
        folder: c.folder,
        pinned: c.pinned,
        archived: c.archived,
        favorite: c.favorite,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c.messages.length
      }));
      res.json(summaries);
    } else {
      const userChats = mockDb.chats.filter(c => c.userId === req.user.id);
      const summaries = [...userChats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(c => ({
        _id: c._id,
        title: c.title,
        folder: c.folder,
        pinned: c.pinned,
        archived: c.archived,
        favorite: c.favorite,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c.messages.length
      }));
      res.json(summaries);
    }
  } catch (error) {
    console.error('Error listing chats:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// 4. Create Chat

app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { title, folder } = req.body;
    const newChatId = isDbConnected 
      ? new mongoose.Types.ObjectId().toString() 
      : 'mock-' + Date.now();

    const newChatData = {
      _id: newChatId,
      userId: req.user.id,
      title: title || 'New Chat',
      folder: folder || '',
      pinned: false,
      archived: false,
      favorite: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected) {
      const chat = new Chat(newChatData);
      await chat.save();
      res.json(chat);
    } else {
      mockDb.chats.push(newChatData);
      res.json(newChatData);
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// 5. Get Chat Messages

app.get('/api/chats/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (isDbConnected) {
      const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      res.json(chat.messages);
    } else {
      const chat = mockDb.chats.find(c => c._id === chatId && c.userId === req.user.id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      res.json(chat.messages);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// 6. Update Chat Properties

app.patch('/api/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title, folder, pinned, archived, favorite } = req.body;

    if (isDbConnected) {
      const chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      if (title !== undefined) chat.title = title;
      if (folder !== undefined) chat.folder = folder;
      if (pinned !== undefined) chat.pinned = pinned;
      if (archived !== undefined) chat.archived = archived;
      if (favorite !== undefined) chat.favorite = favorite;
      chat.updatedAt = new Date();

      await chat.save();
      res.json(chat);
    } else {
      const chat = mockDb.chats.find(c => c._id === chatId && c.userId === req.user.id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      if (title !== undefined) chat.title = title;
      if (folder !== undefined) chat.folder = folder;
      if (pinned !== undefined) chat.pinned = pinned;
      if (archived !== undefined) chat.archived = archived;
      if (favorite !== undefined) chat.favorite = favorite;
      chat.updatedAt = new Date();

      res.json(chat);
    }
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// 7. Delete Chat

app.delete('/api/chats/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (isDbConnected) {
      const result = await Chat.deleteOne({ _id: chatId, userId: req.user.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Chat not found' });
      res.json({ success: true });
    } else {
      const idx = mockDb.chats.findIndex(c => c._id === chatId && c.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Chat not found' });
      mockDb.chats.splice(idx, 1);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// 8. Clear History

app.delete('/api/chats', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      await Chat.deleteMany({ userId: req.user.id });
    } else {
      mockDb.chats = mockDb.chats.filter(c => c.userId !== req.user.id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// 9. Delete Account

app.delete('/api/user', authenticateToken, async (req, res) => {
  try {
    if (req.user.isGuest) {
      return res.status(400).json({ error: 'Cannot delete default guest profile' });
    }

    if (isDbConnected) {
      await User.deleteOne({ _id: req.user.id });
      await Chat.deleteMany({ userId: req.user.id });
      await Memory.deleteMany({ userId: req.user.id });
      await Upload.deleteMany({ userId: req.user.id });
      await Setting.deleteMany({ userId: req.user.id });
    } else {
      const idx = mockDb.users.findIndex(u => u._id === req.user.id);
      if (idx !== -1) mockDb.users.splice(idx, 1);
      mockDb.chats = mockDb.chats.filter(c => c.userId !== req.user.id);
      mockDb.memories = mockDb.memories.filter(m => m.userId !== req.user.id);
      mockDb.uploads = mockDb.uploads.filter(u => u.userId !== req.user.id);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// 10. Document Parsing

app.post('/api/files/parse', async (req, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'File name and base64 data are required' });
    }

    // Convert base64 to buffer
    const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(base64Content, 'base64');
    let text = '';

    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const parsed = await pdf(buffer);
      text = parsed.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
      const parsed = await mammoth.extractRawText({ buffer });
      text = parsed.value;
    } else {
      // Treat as plain text
      text = buffer.toString('utf-8');
    }

    res.json({ text });
  } catch (error) {
    console.error('File parsing error:', error);
    res.status(500).json({ error: 'Failed to parse file: ' + error.message });
  }
});

// 11. Document Upload DB Operations

app.get('/api/uploads', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const docs = await Upload.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(docs);
    } else {
      const docs = mockDb.uploads.filter(u => u.userId === req.user.id);
      res.json(docs);
    }
  } catch (error) {
    console.error('Error listing uploads:', error);
    res.status(500).json({ error: 'Failed to list uploads' });
  }
});

app.post('/api/uploads', authenticateToken, async (req, res) => {
  try {
    const { fileName, fileType, fileSize, content } = req.body;
    if (!fileName || !content) {
      return res.status(400).json({ error: 'File name and parsed content are required' });
    }

    const docId = isDbConnected ? new mongoose.Types.ObjectId().toString() : 'mock-upload-' + Date.now();
    const docData = {
      _id: docId,
      userId: req.user.id,
      fileName,
      fileType: fileType || 'text/plain',
      fileSize: fileSize || content.length,
      content,
      createdAt: new Date()
    };

    if (isDbConnected) {
      const uploadDoc = new Upload(docData);
      await uploadDoc.save();
      res.json(uploadDoc);
    } else {
      mockDb.uploads.push(docData);
      res.json(docData);
    }
  } catch (error) {
    console.error('Error saving upload:', error);
    res.status(500).json({ error: 'Failed to save upload' });
  }
});

app.delete('/api/uploads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      const result = await Upload.deleteOne({ _id: id, userId: req.user.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Upload not found' });
      res.json({ success: true });
    } else {
      const idx = mockDb.uploads.findIndex(u => u._id === id && u.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Upload not found' });
      mockDb.uploads.splice(idx, 1);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

// 12. Memory Log Operations

app.get('/api/memories', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const memoriesList = await Memory.find({ userId: req.user.id }).sort({ createdAt: -1 });
      res.json(memoriesList);
    } else {
      const memoriesList = mockDb.memories.filter(m => m.userId === req.user.id);
      res.json(memoriesList);
    }
  } catch (error) {
    console.error('Error listing memories:', error);
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

app.post('/api/memories', authenticateToken, async (req, res) => {
  try {
    const { content, category } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Memory content is required' });
    }

    const newMemoryId = isDbConnected 
      ? new mongoose.Types.ObjectId().toString() 
      : 'mock-mem-' + Date.now();

    const newMemory = {
      _id: newMemoryId,
      userId: req.user.id,
      content,
      category: category || 'general',
      createdAt: new Date()
    };

    if (isDbConnected) {
      const memDoc = new Memory(newMemory);
      await memDoc.save();
      res.json(memDoc);
    } else {
      mockDb.memories.push(newMemory);
      res.json(newMemory);
    }
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to save memory' });
  }
});

app.delete('/api/memories/:memoryId', authenticateToken, async (req, res) => {
  try {
    const { memoryId } = req.params;

    if (isDbConnected) {
      const result = await Memory.deleteOne({ _id: memoryId, userId: req.user.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Memory not found' });
      res.json({ success: true });
    } else {
      const idx = mockDb.memories.findIndex(m => m._id === memoryId && m.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Memory not found' });
      mockDb.memories.splice(idx, 1);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to forget memory' });
  }
});

// 13. Settings Key-Value DB Endpoints

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const sets = await Setting.find({ userId: req.user.id });
      res.json(sets);
    } else {
      const sets = mockDb.settings.filter(s => s.userId === req.user.id);
      res.json(sets);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    if (isDbConnected) {
      let set = await Setting.findOne({ userId: req.user.id, key });
      if (set) {
        set.value = value;
        set.updatedAt = new Date();
      } else {
        set = new Setting({ userId: req.user.id, key, value });
      }
      await set.save();
      res.json(set);
    } else {
      let set = mockDb.settings.find(s => s.userId === req.user.id && s.key === key);
      if (set) {
        set.value = value;
        set.updatedAt = new Date();
      } else {
        set = { _id: 'mock-set-' + Date.now(), userId: req.user.id, key, value, updatedAt: new Date() };
        mockDb.settings.push(set);
      }
      res.json(set);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// 14. Streaming Chat Stream SSE Endpoint

app.post('/api/chats/:chatId/message-stream', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, files } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let chat;
    if (isDbConnected) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user.id });
      if (!chat) {
        chat = new Chat({ _id: chatId, userId: req.user.id, title: 'Chat', messages: [] });
        await chat.save();
      }
    } else {
      chat = mockDb.chats.find(c => c._id === chatId && c.userId === req.user.id);
      if (!chat) {
        chat = { _id: chatId, userId: req.user.id, title: 'Chat', messages: [], createdAt: new Date(), updatedAt: new Date() };
        mockDb.chats.push(chat);
      }
    }

    // Append user message
    const userMsgObj = { text: message, isUser: true, timestamp: new Date(), files: files || [] };
    chat.messages.push(userMsgObj);
    chat.updatedAt = new Date();
    
    if (isDbConnected) {
      await chat.save();
    }

    // Search relevant memories using keyword matching
    const keywords = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let userMemories = [];
    if (isDbConnected) {
      userMemories = await Memory.find({ userId: req.user.id });
    } else {
      userMemories = mockDb.memories.filter(m => m.userId === req.user.id);
    }
    const relevantMemories = userMemories.filter(m => 
      keywords.some(k => m.content.toLowerCase().includes(k))
    );

    // Filter last 10 messages for conversational history
    const recentMessages = chat.messages.slice(-10);
    const promptContents = [];

    // Setup system instruction context
    const preferences = await getUserPreferences(req.user.id);

    recentMessages.forEach((m, idx) => {
      const parts = [{ text: m.text }];
      
      // Inject images/files to the matching user message
      if (m.isUser && m.files && m.files.length > 0) {
        m.files.forEach(f => {
          if (f.type.startsWith('image/')) {
            // Strip headers from base64 if present
            const base64Data = f.content.includes(';base64,') ? f.content.split(';base64,').pop() : f.content;
            parts.push({
              inlineData: {
                mimeType: f.type,
                data: base64Data
              }
            });
          } else {
            // Text document inline context
            parts.push({ text: `\n\n--- Attached Document [${f.name}] ---\n${f.content}\n---` });
          }
        });
      }

      promptContents.push({
        role: m.isUser ? 'user' : 'model',
        parts
      });
    });

    const systemInstruction = `You are Astra, a highly intelligent and helpful sci-fi AI companion and system terminal.
User Theme Preference: ${preferences.theme}
User Accent Color: ${preferences.accentColor}
User Font Size: ${preferences.fontSize}
User long-term memory logs:
${relevantMemories.length > 0 ? relevantMemories.map(m => `- [${m.category}] ${m.content}`).join('\n') : '(None)'}

Help the user with their queries, including coding tasks (explain, debug, improve, test, refactor, generate documentation/README). Output clean markdown formatting. If the user asks for code, provide clear, fully functional code blocks with language identifiers. Use LaTeX for math equations and Mermaid for diagrams. Keep your style premium, professional, and slightly futuristic. Don't mention system details unless asked.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullReply = '';
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_api_key_here';

    if (hasGeminiKey) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: 'gemini-1.5-flash',
          contents: promptContents,
          config: {
            systemInstruction: systemInstruction
          }
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            fullReply += text;
            res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
          }
        }
      } catch (geminiError) {
        console.error('Gemini Stream failed, falling back to Groq...', geminiError);
        if (hasGroqKey) {
          await streamGroq(promptContents, systemInstruction, res, (text) => { fullReply += text; });
        } else {
          res.write(`data: ${JSON.stringify({ error: 'Gemini Stream Error: ' + geminiError.message })}\n\n`);
        }
      }
    } else if (hasGroqKey) {
      await streamGroq(promptContents, systemInstruction, res, (text) => { fullReply += text; });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Server Misconfiguration: Both GEMINI_API_KEY and GROQ_API_KEY are missing or default.' })}\n\n`);
    }

    // Save AI reply to history
    const aiMsgObj = { text: fullReply, isUser: false, timestamp: new Date() };
    chat.messages.push(aiMsgObj);
    chat.updatedAt = new Date();

    if (isDbConnected) {
      await Chat.updateOne({ _id: chatId }, { $push: { messages: aiMsgObj }, $set: { updatedAt: new Date() } });
    }

    // Background title generator for new conversations
    if (chat.messages.length <= 2) {
      generateTitleInBackground(req.user.id, chatId, message);
    }

    // Background memory extraction
    extractMemoryInBackground(req.user.id, message, fullReply);

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Server error: ' + error.message })}\n\n`);
    res.end();
  }
});

// Standard non-streaming fallback endpoint
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const preferences = await getUserPreferences(req.user.id);
    const systemInstruction = `You are Astra, a highly intelligent futuristic AI companion. Keep your responses concise (1-3 sentences) and helpful. Theme: ${preferences.theme}.`;

    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
    let reply = '';

    if (hasGeminiKey) {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: { systemInstruction }
      });
      reply = response.text;
    } else {
      reply = "(Mock Mode) Gemini API key is missing. Streaming with Groq is recommended.";
    }

    res.json({ reply });
  } catch (error) {
    console.error('Fallback chat error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

// --- Groq Stream Helper ---

async function streamGroq(promptContents, systemInstruction, res, onChunk) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    res.write(`data: ${JSON.stringify({ error: 'Groq API Key is missing or invalid.' })}\n\n`);
    return;
  }

  // Format context for Groq
  const groqMessages = [
    { role: 'system', content: systemInstruction }
  ];

  promptContents.forEach(p => {
    // Filter text components out of parts array
    let textContent = '';
    p.parts.forEach(part => {
      if (part.text) textContent += part.text;
    });
    groqMessages.push({
      role: p.role === 'model' ? 'assistant' : 'user',
      content: textContent
    });
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      stream: true
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    res.write(`data: ${JSON.stringify({ error: 'Groq API error: ' + errText })}\n\n`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.substring(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const data = JSON.parse(jsonStr);
          const chunk = data.choices?.[0]?.delta?.content || '';
          if (chunk) {
            onChunk(chunk);
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        } catch (e) {}
      }
    }
  }
}

// --- Background Job Helpers ---

async function generateTitleInBackground(userId, chatId, userMessage) {
  try {
    const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
    const prompt = `Generate a concise 2-4 word title for this chat based on the first message: "${userMessage}". Output ONLY the title.`;
    const resp = await aiClient.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });
    const title = resp.text.trim().replace(/^["']|["']$/g, '');
    
    if (isDbConnected) {
      await Chat.updateOne({ _id: chatId, userId }, { $set: { title: title || 'New Conversation' } });
    } else {
      const chat = mockDb.chats.find(c => c._id === chatId && c.userId === userId);
      if (chat) chat.title = title || chat.title;
    }
  } catch (e) {
    console.error("Title generation in background failed:", e);
  }
}

async function extractMemoryInBackground(userId, userMessage, assistantReply) {
  const lowerMsg = userMessage.toLowerCase();
  const memoryTriggers = ['remember', 'my name is', 'i like', 'my goal is', 'my favorite', 'i live in', 'i work as'];
  
  if (memoryTriggers.some(trigger => lowerMsg.includes(trigger))) {
    try {
      const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
      const prompt = `From this interaction, extract a single core memory about the user as a short factual statement (e.g. "User's name is Alice" or "User likes Python"). If no new long-term facts are declared, reply with 'NONE'.
User: "${userMessage}"
Astra: "${assistantReply}"`;
      
      const resp = await aiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      const text = resp.text.trim().replace(/^["']|["']$/g, '');
      
      if (text && text !== 'NONE' && !text.toLowerCase().includes('none')) {
        if (isDbConnected) {
          const exists = await Memory.findOne({ userId, content: { $regex: new RegExp(`^${text}$`, 'i') } });
          if (!exists) {
            const memDoc = new Memory({ userId, content: text, category: 'general' });
            await memDoc.save();
            console.log(`Saved long-term memory in DB: ${text}`);
          }
        } else {
          const exists = mockDb.memories.some(m => m.userId === userId && m.content.toLowerCase() === text.toLowerCase());
          if (!exists) {
            mockDb.memories.push({ 
              _id: 'mock-mem-' + Date.now(), 
              userId,
              content: text, 
              category: 'general', 
              createdAt: new Date() 
            });
            console.log(`Saved long-term memory in MockDB: ${text}`);
          }
        }
      }
    } catch (e) {
      console.error("Memory extraction in background failed:", e);
    }
  }
}

// Catch-all route to serve React index.html
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Vercel serverless integration
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Astra Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
