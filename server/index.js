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

// Helper function to call Groq API as a fallback
async function generateGroqContent(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Groq API Key is missing or invalid.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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

    let reply = '';
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_api_key_here';

    if (hasGeminiKey) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
        reply = response.text;
      } catch (geminiError) {
        console.error('Gemini API failed, attempting Groq fallback...', geminiError);
        if (hasGroqKey) {
          reply = await generateGroqContent(prompt);
        } else {
          throw geminiError;
        }
      }
    } else if (hasGroqKey) {
      console.log('GEMINI_API_KEY is not configured. Using Groq API as primary...');
      reply = await generateGroqContent(prompt);
    } else {
      return res.status(500).json({ 
        error: 'Server Misconfiguration: Both GEMINI_API_KEY and GROQ_API_KEY are missing or default.' 
      });
    }

    if (isDbConnected && user) {
      user.chatHistory.push({ text: reply, isUser: false });
      await user.save();
    }

    res.json({ reply });
    
  } catch (error) {
    console.error('AI Core Communication Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI core.' });
  }
});

// Catch-all route to serve React index.html
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Only listen on a port if we are NOT running on Vercel (Vercel uses the exported app)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Astra Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;
