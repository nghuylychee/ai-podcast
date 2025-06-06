import { GoogleGenAI } from '@google/genai';
import { generateReadingPrompt } from './promptGenerator';

// Khởi tạo Gemini
const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Hàm phát hiện ngôn ngữ
const detectLanguage = (text) => {
  if (!text) return 'en-US';
  // Phát hiện tiếng Việt dựa trên dấu
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text) ? 'vi-VN' : 'en-US';
};

// Danh sách giọng đọc được hỗ trợ
const voices = {
  'en-US': [
    // { name: 'puck', style: 'casual' },        // Nam, trẻ trung
    // { name: 'alnilam', style: 'formal' },     // Nữ, chuyên nghiệp
    { name: 'algenib', style: 'storytelling' }, // Nam, kể chuyện
    // { name: 'gacrux', style: 'energetic' },   // Nữ, năng động
    // { name: 'achernar', style: 'deep' }       // Nam, trầm ấm
  ],
  'vi-VN': [
    // { name: 'kore', style: 'casual' },        // Nữ, trẻ trung
    // { name: 'leda', style: 'formal' },        // Nữ, chuyên nghiệp
    { name: 'charon', style: 'storytelling' }, // Nam, kể chuyện
    // { name: 'despina', style: 'energetic' },  // Nữ, năng động
    // { name: 'zephyr', style: 'soft' }         // Nam, dịu dàng
  ]
};

// Hàm chọn giọng nói ngẫu nhiên phù hợp với nội dung
const getVoiceForLanguage = (language) => {
  const availableVoices = voices[language] || voices['en-US'];
  const randomIndex = Math.floor(Math.random() * availableVoices.length);
  const selectedVoice = availableVoices[randomIndex];
  
  return {
    name: selectedVoice.name,
    model: 'gemini-2.5-flash-preview-tts',
    style: selectedVoice.style
  };
};

// Hàm tạo WAV header với cấu hình chuẩn
function createWavHeader(pcmData, channels = 1, sampleRate = 24000, bitsPerSample = 16) {
  const headerLength = 44;
  const dataLength = pcmData.length;
  const header = new ArrayBuffer(headerLength);
  const view = new DataView(header);

  // RIFF chunk descriptor
  view.setUint8(0, 0x52); // 'R'
  view.setUint8(1, 0x49); // 'I'
  view.setUint8(2, 0x46); // 'F'
  view.setUint8(3, 0x46); // 'F'
  view.setUint32(4, 36 + dataLength, true); // File size
  view.setUint8(8, 0x57); // 'W'
  view.setUint8(9, 0x41); // 'A'
  view.setUint8(10, 0x56); // 'V'
  view.setUint8(11, 0x45); // 'E'

  // fmt sub-chunk
  view.setUint8(12, 0x66); // 'f'
  view.setUint8(13, 0x6D); // 'm'
  view.setUint8(14, 0x74); // 't'
  view.setUint8(15, 0x20); // ' '
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, channels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, channels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  view.setUint8(36, 0x64); // 'd'
  view.setUint8(37, 0x61); // 'a'
  view.setUint8(38, 0x74); // 't'
  view.setUint8(39, 0x61); // 'a'
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return header;
}

// Hàm chính để chuyển đổi text thành speech
export async function textToSpeech(text) {
  try {
    console.log('Bắt đầu chuyển đổi text thành speech...');
    
    // Validate text parameter
    if (!text) {
      throw new Error('Text parameter is required');
    }
    
    // Convert text to string if it's an object
    const scriptText = typeof text === 'object' ? text.script || JSON.stringify(text) : text.toString();
    
    // Tạo prompt hướng dẫn đọc
    const readingPrompt = await generateReadingPrompt(scriptText);
    console.log('Đã tạo prompt hướng dẫn đọc:', readingPrompt);

    const language = detectLanguage(scriptText);
    const voice = getVoiceForLanguage(language);
    console.log('Đã chọn giọng đọc:', voice);

    // Tạo request với cấu hình giọng đọc
    const response = await genAI.models.generateContent({
      model: voice.model,
      contents: [{ parts: [{ text: readingPrompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: voice.name,
              speakingStyle: voice.style
            }
          }
        }
      }
    });

    console.log('Response từ API:', JSON.stringify(response, null, 2));
    
    // Lấy audio data từ response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      console.error('Không tìm thấy audio data trong response:', response);
      throw new Error('Không nhận được dữ liệu audio từ API');
    }

    // Chuyển đổi base64 thành ArrayBuffer
    const binaryString = atob(audioData);
    const pcmData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pcmData[i] = binaryString.charCodeAt(i);
    }

    // Tạo WAV header với cấu hình phù hợp
    const wavHeader = createWavHeader(pcmData, 1, 24000, 16);

    // Combine header và PCM data
    const wavData = new Uint8Array(wavHeader.byteLength + pcmData.length);
    wavData.set(new Uint8Array(wavHeader), 0);
    wavData.set(pcmData, wavHeader.byteLength);

    // Tạo Blob với MIME type chính xác
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    console.log('Đã tạo audio URL:', url);

    return url;

  } catch (error) {
    console.error('Lỗi khi chuyển đổi text thành speech:', error);
    throw error;
  }
} 