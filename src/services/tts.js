const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Function to convert text to speech using Web Speech API
const webSpeechTTS = (text) => {
  return new Promise((resolve, reject) => {
    // Create audio context and media recorder
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let mediaRecorder;
    const chunks = [];

    // Create SpeechSynthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0;
    
    // Get available voices and set to a natural sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    // Create audio stream from speech synthesis
    const audioStream = audioContext.createMediaStreamDestination();
    mediaRecorder = new MediaRecorder(audioStream.stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      resolve(blob);
    };

    // Start recording and speech synthesis
    mediaRecorder.start();
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      mediaRecorder.stop();
      audioContext.close();
    };

    utterance.onerror = (error) => {
      reject(new Error(`Web Speech API error: ${error.message}`));
    };
  });
};

// Main text-to-speech function with fallback
export const textToSpeech = async (text, voiceId = 'pNInz6obpgDQGcFmaJgB') => {
  try {
    // Try ElevenLabs first
    console.log('Attempting to use ElevenLabs API...');
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    console.log('Successfully converted text using ElevenLabs');
    return await response.blob();
  } catch (error) {
    console.log('ElevenLabs failed, falling back to Web Speech API:', error.message);
    
    // Fallback to Web Speech API
    try {
      return await webSpeechTTS(text);
    } catch (fallbackError) {
      console.error('Web Speech API fallback error:', fallbackError);
      throw fallbackError;
    }
  }
}; 