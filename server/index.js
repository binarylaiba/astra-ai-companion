import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, User } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Connect to DB
const isDbConnected = await connectDB();

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Server Misconfiguration: GEMINI_API_KEY is missing from .env file.' 
      });
    }

    let user;
    if (isDbConnected) {
      user = await User.findOne({ name: 'User' });
      if (!user) {
        user = new User({ name: 'User' });
        await user.save();
      }
      user.chatHistory.push({ text: message, isUser: true });
      await user.save();
    }

    const promptContext = user 
      ? `User Theme Preference: ${user.preferences.theme}. Recent history: ${user.chatHistory.slice(-5).map(m => m.isUser ? "User: " + m.text : "Astra: " + m.text).join(" | ")}.`
      : '';

    const prompt = `You are Astra, a highly intelligent futuristic AI companion aboard a spacecraft in zero-gravity. Keep your responses concise (1-3 sentences maximum) and helpful. ${promptContext} The user says: "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    if (isDbConnected && user) {
      user.chatHistory.push({ text: response.text, isUser: false });
      await user.save();
    }

    res.json({ reply: response.text });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI core.' });
  }
});

// Catch-all route to serve React index.html
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Only listen on a port if we are NOT running on Vercel (Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Astra Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
