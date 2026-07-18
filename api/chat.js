import { GoogleGenAI } from '@google/genai';

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

    const prompt = `You are Astra, a highly intelligent futuristic AI companion aboard a spacecraft in zero-gravity. Keep your responses concise (1-3 sentences maximum) and helpful. The user says: "${message}"`;

    let reply = '';
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here';
    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_api_key_here';

    if (hasGeminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('AI Core Communication Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with AI core.' });
  }
}

