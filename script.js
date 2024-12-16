// Get the cube element and its container
const cube = document.getElementById('cube');
const cubeContainer = document.querySelector('.cube-container');

// Variables to track mouse movement
let isDragging = false;
let prevX = 0;
let prevY = 0;
let rotationX = 0;
let rotationY = 0;

// Handle mouse down event to start dragging
cubeContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  prevX = e.clientX;
  prevY = e.clientY;
  cube.style.transition = 'none'; // Disable transition while dragging
  cubeContainer.style.cursor = 'grabbing'; // Change cursor to grabbing state
});

// Handle mouse move event to rotate the cube
cubeContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const deltaX = e.clientX - prevX;
  const deltaY = e.clientY - prevY;

  rotationX += deltaY * 0.2; // Control speed of vertical rotation
  rotationY -= deltaX * 0.2; // Control speed of horizontal rotation

  // Apply the rotation to the cube
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;

  prevX = e.clientX;
  prevY = e.clientY;
});

// Handle mouse up event to stop dragging
cubeContainer.addEventListener('mouseup', () => {
  isDragging = false;
  cube.style.transition = 'transform 0.5s ease'; // Enable smooth transition after dragging
  cubeContainer.style.cursor = 'grab'; // Change cursor back to default
});

// Handle mouse leave event to stop dragging if the mouse leaves the cube
cubeContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  cube.style.transition = 'transform 0.5s ease'; // Enable smooth transition after dragging
  cubeContainer.style.cursor = 'grab'; // Change cursor back to default
});

// Web Audio API Setup for Sine Wave Tone Generation
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let midiAccess = null;
let midiOutput = null;

// Connect to MIDI devices and initialize MIDI access
function setupMIDI() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  } else {
    alert("MIDI is not supported in this browser.");
  }
}

function onMIDISuccess(access) {
  midiAccess = access;
  const midiOutputs = Array.from(midiAccess.outputs.values());
  midiOutput = midiOutputs[0];  // Get the first MIDI output device
  document.getElementById('status').textContent = "MIDI Connected";
}

function onMIDIFailure() {
  document.getElementById('status').textContent = "Failed to connect MIDI";
}

// MIDI Note Mapping for 88 keys
const midiNotes = {
  'C1': 24,
  'C#1': 25,
  'D1': 26,
  'D#1': 27,
  'E1': 28,
  'F1': 29,
  'F#1': 30,
  'G1': 31,
  'G#1': 32,
  'A1': 33,
  'A#1': 34,
  'B1': 35,
  'C2': 36,
  'C#2': 37,
  'D2': 38,
  'D#2': 39,
  'E2': 40,
  'F2': 41,
  'F#2': 42,
  'G2': 43,
  'G#2': 44,
  'A2': 45,
  'A#2': 46,
  'B2': 47,
  'C3': 48,
  'C#3': 49,
  'D3': 50,
  'D#3': 51,
  'E3': 52,
  'F3': 53,
  'F#3': 54,
  'G3': 55,
  'G#3': 56,
  'A3': 57,
  'A#3': 58,
  'B3': 59,
  'C4': 60,
  'C#4': 61,
  'D4': 62,
  'D#4': 63,
  'E4': 64,
  'F4': 65,
  'F#4': 66,
  'G4': 67,
  'G#4': 68,
  'A4': 69,
  'A#4': 70,
  'B4': 71,
  'C5': 72,
  'C#5': 73,
  'D5': 74,
  'D#5': 75,
  'E5': 76,
  'F5': 77,
  'F#5': 78,
  'G5': 79,
  'G#5': 80,
  'A5': 81,
  'A#5': 82,
  'B5': 83,
  'C6': 84,
  'C#6': 85,
  'D6': 86,
  'D#6': 87,
  'E6': 88,
  'F6': 89,
  'F#6': 90,
  'G6': 91,
  'G#6': 92,
  'A6': 93,
  'A#6': 94,
  'B6': 95,
  'C7': 96,
  'C#7': 97,
  'D7': 98,
  'D#7': 99,
  'E7': 100,
  'F7': 101,
  'F#7': 102,
  'G7': 103,
  'G#7': 104,
  'A7': 105,
  'A#7': 106,
  'B7': 107,
  'C8': 108
};

// Create a PolySynth (allows us to play multiple notes at once)
const synth = new Tone.PolySynth({
  oscillator: {
    type: 'sine', // Sine wave is commonly used for piano sounds, but you can try 'square', 'triangle', etc.
  },
  envelope: {
    attack: 0.05, // Attack time for the note
    decay: 0.2,   // Decay time
    sustain: 0.3, // Sustain time
    release: 0.8  // Release time for when the note is let go
  }
}).toDestination(); // Directly send the sound to the audio output (speakers)

// Setup the analyser for waveform visualization
const analyser = new Tone.Analyser("waveform", 512); // 512 samples per frame
synth.connect(analyser); // Connect the synth output to the analyser

// Map computer keyboard keys to piano notes
const keyMap = {
  'a': 'C1', 'w': 'C#1', 's': 'D1', 'e': 'D#1', 'd': 'E1',
  'f': 'F1', 't': 'F#1', 'g': 'G1', 'y': 'G#1', 'h': 'A1',
  'u': 'A#1', 'j': 'B1', 'k': 'C2', 'o': 'C#2', 'l': 'D2',
  ';': 'D#2', "'": 'E2', 'z': 'F2', 'x': 'F#2', 'c': 'G2',
  'v': 'G#2', 'b': 'A2', 'n': 'A#2', 'm': 'B2', ',': 'C3',
  '.': 'C#3', '/': 'D3', '1': 'D#3', '2': 'E3', '3': 'F3',
  '4': 'F#3', '5': 'G3', '6': 'G#3', '7': 'A3', '8': 'A#3',
  '9': 'B3', '0': 'C4', '-': 'C#4', '=': 'D4', 'q': 'D#4',
  'e': 'E4', 'r': 'F4', 't': 'F#4', 'y': 'G4', 'u': 'G#4',
  'i': 'A4', 'o': 'A#4', 'p': 'B4', '[': 'C5', ']': 'C#5'
};

// Function to play note using Tone.js
function playNote(note) {
  const frequency = Tone.Frequency(note).toFrequency(); // Convert note to frequency
  synth.triggerAttackRelease(frequency, "8n");  // Play the note with 8th note duration
}

// Function to highlight key (if you decide to add this feature later)
function highlightKey(note) {
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (key) {
    key.classList.add('active');
    setTimeout(() => key.classList.remove('active'), 200);  // Remove the highlight after a brief moment
  }
}

// Add event listeners for mouse click on piano keys (if you still have a visual keyboard)
const whiteKeys = document.querySelectorAll('.key.white');
const blackKeys = document.querySelectorAll('.key.black');

whiteKeys.forEach(key => {
  key.addEventListener('click', (e) => {
    const note = key.getAttribute('data-note');
    playNote(note);
    highlightKey(note);
  });
});

blackKeys.forEach(key => {
  key.addEventListener('click', (e) => {
    const note = key.getAttribute('data-note');
    playNote(note);
    highlightKey(note);
  });
});

// Add event listener for keyboard key press
document.addEventListener('keydown', (event) => {
  const note = keyMap[event.key.toLowerCase()]; // Get the corresponding piano note for the pressed key
  if (note) {
    playNote(note);  // Play the note if a valid key is pressed
    highlightKey(note);  // Highlight the corresponding key
  }
});

// Canvas for waveform visualization
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

// Function to draw the waveform on the canvas
function drawWaveform() {
  // Get the waveform data
  const waveform = analyser.getValue();

  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set up the canvas styling
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0099ff'; // Waveform color

  // Begin drawing the waveform
  ctx.beginPath();
  const sliceWidth = canvas.width / waveform.length;
  let x = 0;
  
  // Loop through the waveform data and plot it
  for (let i = 0; i < waveform.length; i++) {
    const y = (waveform[i] * 0.5 + 0.5) * canvas.height; // Scale to fit canvas
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.stroke();

  // Continue drawing the waveform at 60Hz (every 16ms)
  requestAnimationFrame(drawWaveform);
}

// Start drawing the waveform
drawWaveform();