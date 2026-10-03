/**
 * High-quality Web Audio API generator for ambient focus sounds and chimes.
 * Requires zero external audio files.
 */

let audioCtx = null;
let currentNoiseNode = null;
let currentGainNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Generate pink noise buffer (warm, smooth sound for ADHD/focus)
 */
function createPinkNoiseBuffer(ctx, seconds = 5) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Generate soft white noise buffer
 */
function createWhiteNoiseBuffer(ctx, seconds = 5) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.05;
  }
  return buffer;
}

/**
 * Play ambient focus sound (pink, rain, white, binaural)
 */
export function playAmbientSound(type = 'pink', volume = 0.25) {
  stopAmbientSound();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), ctx.currentTime + 1.2);
    currentGainNode = gainNode;

    if (type === 'pink' || type === 'rain') {
      const buffer = createPinkNoiseBuffer(ctx, 4);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Add low-pass filter for soothing tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 600 : 900, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      currentNoiseNode = noiseSource;
    } else if (type === 'white') {
      const buffer = createWhiteNoiseBuffer(ctx, 4);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      currentNoiseNode = noiseSource;
    } else if (type === 'binaural') {
      // 432Hz Calm Binaural Beat
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(216, ctx.currentTime);
      osc2.frequency.setValueAtTime(224, ctx.currentTime); // 8Hz Alpha wave diff

      const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner1 && panner2) {
        panner1.pan.setValueAtTime(-0.8, ctx.currentTime);
        panner2.pan.setValueAtTime(0.8, ctx.currentTime);
        osc1.connect(panner1);
        osc2.connect(panner2);
        panner1.connect(gainNode);
        panner2.connect(gainNode);
      } else {
        osc1.connect(gainNode);
        osc2.connect(gainNode);
      }
      gainNode.connect(ctx.destination);
      osc1.start();
      osc2.start();
      currentNoiseNode = {
        stop: () => {
          try { osc1.stop(); osc2.stop(); } catch(e){}
        }
      };
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/**
 * Stop any active ambient background sound
 */
export function stopAmbientSound() {
  if (currentGainNode && audioCtx) {
    try {
      currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, audioCtx.currentTime);
      currentGainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    } catch(e) {}
  }
  setTimeout(() => {
    if (currentNoiseNode) {
      try {
        currentNoiseNode.stop();
        currentNoiseNode.disconnect();
      } catch (e) {}
      currentNoiseNode = null;
    }
  }, 500);
}

/**
 * Play a peaceful crystal completion chime (Notion/Tiimo celebratory tone)
 */
export function playCompletionChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major triad)
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.14);

      gain.gain.setValueAtTime(0, now + index * 0.14);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.14 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.14);
      osc.stop(now + index * 0.14 + 1.3);
    });
  } catch (err) {
    console.warn('Chime playback error:', err);
  }
}

/**
 * Play light tactile tap click sound
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch(e) {}
}
