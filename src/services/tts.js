const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Function to detect language from text
const detectLanguage = (text) => {
  if (!text) return 'en';
  // Simple detection based on common Vietnamese diacritical marks
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text) ? 'vi' : 'en';
};

// Function to get appropriate voice based on language
const getVoiceForLanguage = (language) => {
  const voices = {
    en: {
      id: 'pNInz6obpgDQGcFmaJgB', // Adam - English
      name: 'Adam',
      settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      },
      model: 'eleven_multilingual_v2'
    },
    vi: {
      id: '7hsfEc7irDn6E8br0qfw', // Ly Hai's voice
      name: 'Ly Hai',
      settings: {
        stability: 0.75,         // Tăng stability để giọng ổn định hơn
        similarity_boost: 0.85,   // Giảm một chút để tự nhiên hơn
        style: 0.35,             // Tăng style để thêm ngữ điệu
        use_speaker_boost: true
      },
      model: 'eleven_monolingual_v1'  // Dùng monolingual để tập trung vào một ngôn ngữ
    }
  };
  return voices[language] || voices.en;
};

// Function to validate and prepare text for TTS
const prepareTextForTTS = (text) => {
  // Validate input
  if (!text) {
    throw new Error('No text provided for text-to-speech conversion');
  }

  // Convert to string if not already
  text = String(text);
  
  // Remove any special characters that might cause issues
  text = text.replace(/[^\p{L}\p{N}\p{P}\s]/gu, '');
  
  // Ensure text isn't too long (ElevenLabs has a limit)
  const MAX_CHARS = 2500;
  if (text.length > MAX_CHARS) {
    text = text.substring(0, MAX_CHARS) + '...';
  }
  
  // Add proper punctuation if missing
  if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    text += '.';
  }
  
  return text;
};

// Function to optimize text for Vietnamese TTS
const optimizeVietnameseText = (text) => {
  if (!text) return '';
  
  // Thêm dấu chấm sau các từ kết thúc câu
  text = text.replace(/([.!?]),/g, '$1');
  text = text.replace(/([.!?])\s+/g, '$1 ');
  
  // Thêm dấu phẩy trước các từ nối
  const connectors = ['nhưng', 'và', 'hoặc', 'hay', 'vì', 'bởi vì', 'do đó', 'vì vậy', 'tuy nhiên', 'mặc dù'];
  connectors.forEach(conn => {
    const regex = new RegExp(`\\s+${conn}\\s+`, 'gi');
    text = text.replace(regex, `, ${conn} `);
  });

  // Thêm dấu phẩy cho các từ ngữ khí
  const particles = ['nhé', 'nhỉ', 'ạ', 'ấy', 'chứ', 'đấy', 'này', 'thế', 'nào'];
  particles.forEach(particle => {
    const regex = new RegExp(`\\b${particle}\\b`, 'gi');
    text = text.replace(regex, `, ${particle}`);
  });

  // Thêm khoảng dừng cho các con số và đơn vị
  text = text.replace(/(\d+)\s*([a-zắằẳẵặăấầẩẫậâáàãảạđếềểễệêéèẻẽẹíìỉĩịốồổỗộôớờởỡợơóòõỏọứừửữựưúùủũụýỳỷỹỵ]+)/gi, '$1, $2');

  return text;
};

// Function to split text into chunks
const splitTextIntoChunks = (text, maxChunkLength = 1000) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
};

// Function to concatenate audio blobs
const concatenateAudioBlobs = async (blobs) => {
  // Convert blobs to array buffers
  const arrayBuffers = await Promise.all(
    blobs.map(blob => blob.arrayBuffer())
  );

  // Calculate total length
  const totalLength = arrayBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  
  // Create a new array buffer with the total length
  const concatenatedBuffer = new Uint8Array(totalLength);
  
  // Copy each buffer into the concatenated buffer
  let offset = 0;
  arrayBuffers.forEach(buffer => {
    concatenatedBuffer.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  
  // Convert back to blob
  return new Blob([concatenatedBuffer], { type: 'audio/mpeg' });
};

// Main text-to-speech function
export const textToSpeech = async (text) => {
  try {
    // Debug environment variables
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    console.log('API Key debug:');
    console.log('- Key exists:', !!apiKey);
    console.log('- Key length:', apiKey?.length);
    console.log('- First 4 chars:', apiKey?.substring(0, 4));
    console.log('- Contains whitespace:', /\s/.test(apiKey));
    
    if (!apiKey) {
      throw new Error('ElevenLabs API key is missing. Please check your .env file.');
    }

    // Validate input
    if (!text) {
      throw new Error('No text provided for text-to-speech conversion');
    }

    // Detect language
    const language = detectLanguage(text);
    console.log('Detected language:', language);

    // Get appropriate voice
    const voice = getVoiceForLanguage(language);
    console.log('Using voice:', voice.name);

    // Split text into chunks
    const chunks = splitTextIntoChunks(text);
    console.log(`Split text into ${chunks.length} chunks`);

    // Convert each chunk to speech
    const audioBlobs = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

      // Prepare and optimize chunk
      let processedChunk = prepareTextForTTS(chunk);
      if (language === 'vi') {
        processedChunk = optimizeVietnameseText(processedChunk);
      }

      // Make API request for this chunk
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voice.id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: processedChunk,
          voice_settings: voice.settings,
          model_id: voice.model
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          body: errorText
        });
        
        throw new Error(`ElevenLabs API error (${response.status})`);
      }

      const audioBlob = await response.blob();
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio response from ElevenLabs');
      }

      audioBlobs.push(audioBlob);
    }

    // Concatenate all audio blobs
    console.log('Concatenating audio chunks...');
    const finalAudioBlob = await concatenateAudioBlobs(audioBlobs);
    console.log('Audio concatenation complete');

    return finalAudioBlob;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}; 