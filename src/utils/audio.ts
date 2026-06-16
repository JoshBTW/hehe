export class RomanticLofiSynth {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private currentChordIndex = 0;

  // Romantic chord voices (frequencies in Hz)
  private chords = [
    [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9 (C3, E3, G3, B3, D4)
    [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9 (F3, A3, C4, E4, G4)
    [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9 (D3, F3, A3, C4, E4)
    [220.00, 261.63, 329.63, 392.00, 440.00], // Am7 (A3, C4, E4, G4, A4)
    [196.00, 246.94, 293.66, 392.00, 493.88], // G6 (G3, B3, D4, G4, B4)
  ];

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      
      this.ctx = new AudioCtxClass();
      this.isPlaying = true;
      this.currentChordIndex = 0;

      // Lowpass filter for that warm, muted lofi room sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Stereo delay node
      const delay = this.ctx.createDelay();
      delay.delayTime.setValueAtTime(0.4, this.ctx.currentTime);

      const delayGain = this.ctx.createGain();
      delayGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      // Feedback loop for the delay
      delay.connect(delayGain);
      delayGain.connect(delay);

      // Ambient master gain
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Gentle background volume

      // Routing
      filter.connect(masterGain);
      filter.connect(delay);
      delayGain.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      let step = 0;
      const playNote = () => {
        if (!this.ctx || this.ctx.state === 'suspended') return;

        const chord = this.chords[this.currentChordIndex];
        const noteFreq = chord[step % chord.length];

        // Create oscillator representing a soft keyboard / guitar stroke
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'triangle'; // Smooth, warm, flute/bell-like wave
        osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);

        // Add a slight vibrato for dreamy lofi character
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 3.5; // slow pitch wobble
        lfoGain.gain.value = 1.2; // subtle shift

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        // Envelope
        const now = this.ctx.currentTime;
        oscGain.gain.setValueAtTime(0, now);
        // Soft pluck attack, long warm decay
        oscGain.gain.linearRampToValueAtTime(0.4, now + 0.15);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

        osc.connect(oscGain);
        oscGain.connect(filter);

        lfo.start(now);
        osc.start(now);

        lfo.stop(now + 3.0);
        osc.stop(now + 3.0);

        step++;
        if (step % 6 === 0) {
          // Progress to another ambient chord
          this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
        }
      };

      // Play soft notes in a staggered dreamy tempo
      this.intervalId = setInterval(() => {
        playNote();
        // Staggered double note chance for magical fairy-chime sparkles
        if (Math.random() > 0.72) {
          setTimeout(playNote, 280);
        }
      }, 750);
    } catch (e) {
      console.warn('Web Audio API not supported or failed to start:', e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  // Plays a cute, short positive bell chime when answering quizzes / unlocking slides
  playChime() {
    try {
      const audioCtx = this.ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const playTone = (freq: number, delayTime: number, vol: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delayTime);
        
        gain.gain.setValueAtTime(0, now + delayTime);
        gain.gain.linearRampToValueAtTime(vol, now + delayTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delayTime + 0.6);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + delayTime);
        osc.stop(now + delayTime + 0.7);
      };

      // A lovely major-third upward chime
      playTone(523.25, 0, 0.12);     // C5
      playTone(659.25, 0.12, 0.12);  // E5
      playTone(783.99, 0.24, 0.15);  // G5
    } catch (e) {
      // Silently catch audio policy blocks
    }
  }

  // Play a soft bubble pop/heart beat click
  playClick() {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }
}

// Single active instance
export const romanticThemePlayer = new RomanticLofiSynth();
