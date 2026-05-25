// AudioEngine.js - Synthesizes retro/sci-fi UI sounds and generative ambient music without external files

let audioCtx = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playClick = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.warn("Audio disabled", e);
  }
};

export const playHover = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    console.warn("Audio disabled", e);
  }
};

export const playThinking = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(250, audioCtx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.4);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.warn("Audio disabled", e);
  }
};

// --- Generative Ambient Space Music Engine ---
let ambientOscillators = [];
let ambientGains = [];
let filterNode = null;
let lfoNode = null;
let isPlayingAmbient = false;
let ambientInterval = null;

const scaleChords = {
  space: [
    [130.81, 196.00, 233.08, 311.13, 392.00], // C3, G3, Bb3, Eb4, G4 (Cm9 vibe - cold, vast)
    [146.83, 220.00, 261.63, 349.23, 440.00], // D3, A3, C4, F4, A4 (Dm9 vibe)
  ],
  dream: [
    [174.61, 261.63, 329.63, 440.00, 523.25], // F3, C4, E4, A4, C5 (Fmaj9 vibe - warm, ethereal)
    [196.00, 293.66, 349.23, 440.00, 587.33], // G3, D4, F4, A4, D5 (G9 vibe)
  ],
  cyber: [
    [110.00, 164.81, 220.00, 261.63, 329.63], // A2, E3, A3, C4, E4 (Am7 vibe - dark, tense)
    [123.47, 185.00, 246.94, 293.66, 369.99], // B2, F#3, B3, D4, F#4 (Bm7 vibe)
  ]
};

export const startAmbient = (theme) => {
  try {
    initAudio();
    if (isPlayingAmbient) return;
    isPlayingAmbient = true;
    
    // Create a sweeping lowpass filter to give it a warm, analog space feel
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(300, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(4, audioCtx.currentTime);
    filterNode.connect(audioCtx.destination);
    
    // Slow LFO to modulate the filter frequency for drifting cosmic effects
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); // Very slow 12s cycle
    
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(120, audioCtx.currentTime); // Sweep filter +-120Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(filterNode.frequency);
    lfo.start();
    lfoNode = lfo;

    const chords = scaleChords[theme] || scaleChords.space;
    const notes = chords[0];

    // Create 5 soft-sounding oscillators for rich 5-note ambient pad harmony
    for (let i = 0; i < 5; i++) {
      const osc = audioCtx.createOscillator();
      osc.type = theme === 'cyber' ? 'sawtooth' : theme === 'dream' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(notes[i], audioCtx.currentTime);
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
      // Soft 3.5s attack to fade in the ambient music elegantly
      gainNode.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 3.5);
      
      osc.connect(gainNode);
      gainNode.connect(filterNode);
      osc.start();
      
      ambientOscillators.push(osc);
      ambientGains.push(gainNode);
    }

    // Slowly morph chords every 8 seconds
    let chordIndex = 0;
    ambientInterval = setInterval(() => {
      if (!isPlayingAmbient) return;
      chordIndex = (chordIndex + 1) % 2;
      const nextNotes = (scaleChords[theme] || scaleChords.space)[chordIndex];
      const now = audioCtx.currentTime;
      for (let i = 0; i < 5; i++) {
        if (ambientOscillators[i]) {
          // Slow 4-second cross-fade between frequencies
          ambientOscillators[i].frequency.exponentialRampToValueAtTime(nextNotes[i], now + 4.0);
        }
      }
    }, 8000);

  } catch (e) {
    console.warn("Could not start ambient music engine", e);
  }
};

export const stopAmbient = () => {
  isPlayingAmbient = false;
  if (ambientInterval) {
    clearInterval(ambientInterval);
    ambientInterval = null;
  }
  
  const now = audioCtx ? audioCtx.currentTime : 0;
  // Soft 2-second fade-out release
  ambientGains.forEach((g) => {
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + 2.0);
    } catch(e){}
  });
  
  setTimeout(() => {
    ambientOscillators.forEach((osc) => {
      try { osc.stop(); } catch(e){}
    });
    if (lfoNode) {
      try { lfoNode.stop(); } catch(e){}
    }
    ambientOscillators = [];
    ambientGains = [];
    lfoNode = null;
    filterNode = null;
  }, 2200);
};

export const updateAmbientTheme = (newTheme) => {
  if (!isPlayingAmbient) return;
  const chords = scaleChords[newTheme] || scaleChords.space;
  const nextNotes = chords[0];
  const now = audioCtx.currentTime;
  
  for (let i = 0; i < 5; i++) {
    if (ambientOscillators[i]) {
      // Transition oscillator type smoothly
      ambientOscillators[i].type = newTheme === 'cyber' ? 'sawtooth' : newTheme === 'dream' ? 'sine' : 'triangle';
      ambientOscillators[i].frequency.exponentialRampToValueAtTime(nextNotes[i], now + 3.5);
    }
  }
};

export const getAmbientState = () => isPlayingAmbient;
