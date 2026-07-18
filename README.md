# Astra AI Companion 🌌

Astra is a fully interactive, futuristic 3D Web Companion built with React Three Fiber, Vite, and Node.js. She responds to your voice, organizes floating memories in zero-gravity, synthesizes dynamic cosmic ambient pad audio on the fly, and possesses real conversational intelligence powered by Google Gemini and Groq.

---

## ✨ Features

- **🤖 Holographic 3D Interface:** Fully interactive parametric humanoid built with `three.js` and React Three Fiber.
- **💬 HUD 2D Chat Comm Link:** A sleek, glassmorphic HUD Chat Overlay that slides into view on the right, providing 100% reliable clicks and viewing in all browsers.
- **🎙️ Voice Recognition:** Speak directly to Astra using your browser's Web Speech API.
- **🔊 Voice Synthesis (NEW!):** Astra speaks back to you out loud! She reads her answers in a futuristic space-robotic voice. Includes an interactive volume/mute control at the top of the chat Comm Link.
- **🎵 Procedural Ambient Synthesizer:** A custom built browser-native audio engine. Click the Music icon to synthesize soothing sci-fi chords on the fly (no files loaded!). Waveforms and notes dynamically morph to match active themes:
  - *Space Theme:* Cold, vast C-minor 9th chords synthesized with triangle waves.
  - *Dream Theme:* Ethereal, sweeping F-major 9th chords synthesized with warm sine waves.
  - *Cyber Theme:* Dark, resonant A-minor 7th chords synthesized with rich sawtooth waves.
- **🧠 Color-Coded Project Memories (NEW!):** Type `Remember: [task] for [project] #[category]` in the chat box to spawn floating project rings. 
  - **Custom Priorities:** Use hashtags (like `#urgent`, `#work`, `#personal`, `#learning`) to dynamically color the 3D memory orbs.
  - **Project Labels:** Add `for [project]` to float a beautiful `[PROJECT_NAME]` tag above the orb in 3D space.
  - Drag-and-drop memory orbs with your mouse, and fling them into the **Black Hole Singularity** to erase them.
- **⚡ Dual-AI Brain (NEW!):** Full-Stack Node.js backend integrated with Google Gemini API (`gemini-1.5-flash`) and an automatic fallback to Groq (`llama-3.3-70b-versatile`) if Gemini fails or is not configured.
- **🌌 Physics & Cinematic HUD:** Toggle "Gravity Mode" to ground objects, accelerate space dust in "Warp Speed" mode, cast a "Holographic Diagnostic Scan" over Astra, or toggle the "System Info / Help Modal" (? icon).
- **🎨 Dynamic Themes:** Click the Palette icon to cycle between Space, Dreamy Lavender, and Cyberpunk themes in real-time.

---

## 🚀 Local Development (How to Run)

Since this is a full-stack application, you must run both the Frontend and the Backend servers.

### 1. Prerequisites
- Node.js installed on your machine.
- A free Google Gemini API Key or a free Groq API Key.

### 2. Setup
Clone the repository and install dependencies:
```bash
git clone https://github.com/Laiba-dev569/astra-ai-companion.git
cd astra-ai-companion
npm install --legacy-peer-deps
```

### 3. Environment Variables
Create a file named `.env` in the root folder and add your API Keys:
```env
GEMINI_API_KEY=your_gemini_key_here
GROQ_API_KEY=your_groq_key_here
```
*(If Gemini key is left as placeholder, the backend automatically uses the Groq key as primary!)*

### 4. Boot up the Servers
- **Windows (Easiest):** Simply double-click the **`start.bat`** file in the root folder. It will open two console windows and start both servers automatically!
- **Manual (Two separate terminals):**
  - **Terminal 1 (Frontend):**
    ```bash
    npm run dev
    ```
  - **Terminal 2 (Backend):**
    ```bash
    npm run server
    ```

Open your browser to `http://localhost:5173` to meet Astra!

---

## 🌍 Deployment

This application is fully optimized for **both** serverless deployment on Vercel or unified hosting on Render.com.

### ⚡ Option A: Vercel (Recommended & Serverless)
Vercel hosts the frontend as a high-speed static site and runs the Express backend serverless-compatibly.

1. Push this repository to your GitHub account.
2. Log into **[vercel.com](https://vercel.com/)** and click **Add New ➔ Project**.
3. Import this GitHub repository. Vercel automatically detects the Vite/React setup.
4. Under the **Environment Variables** section, add your API keys:
   - Key: `GROQ_API_KEY`
   - Key: `GEMINI_API_KEY` (Optional)
5. Click **Deploy**!
*(Note: Vercel will automatically redeploy your site in real-time whenever you run `git push` to your repository!)*
