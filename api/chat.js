import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        error: 'Server Misconfiguration: GEMINI_API_KEY is missing',
      });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Keep prompt consistent with server/index.js
    const prompt = `You are Astra, a highly intelligent futuristic AI companion aboard a spacecraft in zero-gravity. Keep your responses concise (1-3 sentences maximum) and helpful. The user says: "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI core.' });
  }
}

