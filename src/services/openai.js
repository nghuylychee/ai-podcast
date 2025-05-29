import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Mock data for testing without API
const MOCK_RESPONSES = {
  "artificial intelligence": {
    "title": "AI Revolution: The Path to Superintelligence",
    "description": "Exploring the rapid advancement of AI technology and its impact on our future",
    "script": `Welcome to today's episode of Tech Horizons. Today, we're diving deep into the fascinating world of artificial intelligence and its incredible journey towards superintelligence.

    First, let's talk about where we are now. Machine learning and neural networks have revolutionized everything from image recognition to natural language processing. Companies like OpenAI, Google, and DeepMind are pushing the boundaries of what AI can do.

    But here's where it gets interesting. The path to superintelligence isn't just about faster computers or bigger datasets. It's about creating AI systems that can improve themselves, learn from their mistakes, and eventually surpass human intelligence in virtually every domain.

    However, this journey isn't without its challenges. We need to address concerns about AI safety, ethics, and control. How do we ensure that superintelligent AI systems align with human values and interests?

    As we wrap up, remember that the future of AI isn't just about technology – it's about us, how we shape it, and how we prepare for a world where machines might think better than we do.

    Thanks for listening to Tech Horizons. Don't forget to subscribe for more insights into the future of technology.`,
    "duration": "4",
    "keyPoints": [
      "Current state of AI technology",
      "The concept of superintelligence",
      "Challenges in AI development",
      "Importance of AI safety and ethics"
    ]
  },
  "space exploration": {
    "title": "Beyond Earth: The New Space Race",
    "description": "Discover the latest developments in space exploration and humanity's journey to the stars",
    "script": `Welcome to Cosmic Ventures. Today, we're exploring humanity's greatest adventure: our journey into space.

    The space industry has undergone a remarkable transformation. Private companies like SpaceX and Blue Origin have revolutionized space travel, making it more accessible and cost-effective than ever before.

    Mars colonization is no longer just science fiction. With multiple missions planned for the next decade, we're closer than ever to becoming a multi-planetary species. The challenges are enormous, but so are the potential rewards.

    Beyond Mars, the possibilities are endless. From mining asteroids to exploring the moons of Jupiter and Saturn, we're entering a new golden age of space exploration.

    As we conclude, remember that space exploration isn't just about reaching new worlds – it's about pushing the boundaries of human achievement and ensuring our species' long-term survival.

    Thanks for joining us on Cosmic Ventures. Stay curious and keep looking up!`,
    "duration": "3.5",
    "keyPoints": [
      "Private space industry revolution",
      "Mars colonization plans",
      "Future of space exploration",
      "Impact on human civilization"
    ]
  }
};

// Function to detect language from text
const detectLanguage = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a language detector. Respond with only the ISO 639-1 language code (e.g., 'en', 'vi', 'ja', etc.)"
        },
        {
          role: "user",
          content: `What is the language of this text: "${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English if detection fails
  }
};

export const generatePodcastContent = async (topic) => {
  try {
    // Detect language of the topic
    const language = await detectLanguage(topic);
    console.log('Detected language:', language);

    // Create system prompt based on detected language
    const systemPrompt = {
      en: `You are a professional TikTok content creator and storyteller. 
           Create engaging, informative, and entertaining content that hooks listeners in the first few seconds.
           Focus on creating content that is:
           - Conversational and natural in tone
           - Rich in interesting facts and insights
           - Engaging with hooks and cliffhangers
           - Suitable for a TikTok/short-form content audience
           - Educational yet entertaining`,
      vi: `Bạn là một người tạo nội dung TikTok chuyên nghiệp và người kể chuyện.
           Tạo nội dung hấp dẫn, nhiều thông tin và giải trí, thu hút người nghe trong vài giây đầu tiên.
           Tập trung tạo nội dung:
           - Giọng điệu tự nhiên và gần gũi
           - Phong phú về thông tin và kiến thức thú vị
           - Hấp dẫn với các hook và tình tiết gay cấn
           - Phù hợp với khán giả TikTok/nội dung ngắn
           - Mang tính giáo dục nhưng vẫn giải trí`
    }[language] || systemPrompt.en;

    // Create user prompt based on detected language
    const userPrompt = {
      en: `Create a 1-3 minute TikTok-style educational podcast script about ${topic}. Include:
           1. A powerful hook in the first 5 seconds to grab attention
           2. 2-3 fascinating main points that will surprise the audience
           3. Engaging transitions and mini-cliffhangers between points
           4. A strong conclusion with a call-to-action
           5. Conversational language with occasional humor
           6. Questions or statements that make listeners think`,
      vi: `Tạo kịch bản podcast giáo dục kiểu TikTok dài 1-3 phút về ${topic}. Bao gồm:
           1. Một hook mạnh mẽ trong 5 giây đầu tiên để thu hút sự chú ý
           2. 2-3 điểm chính thú vị sẽ khiến khán giả bất ngờ
           3. Chuyển cảnh hấp dẫn và tình tiết gay cấn giữa các điểm
           4. Kết luận mạnh mẽ với lời kêu gọi hành động
           5. Ngôn ngữ gần gũi với chút hài hước
           6. Câu hỏi hoặc phát biểu khiến người nghe suy nghĩ`
    }[language] || userPrompt.en;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${userPrompt}
          
          Format the response as a JSON with:
          {
            "title": "Attention-grabbing title",
            "description": "Engaging description",
            "hook": "The opening hook (first 5-10 seconds)",
            "script": "The full script",
            "duration": "Estimated duration in minutes",
            "keyPoints": ["Array of key points"],
            "hashtags": ["Relevant hashtags"],
            "callToAction": "The call-to-action for viewers"
          }`
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = JSON.parse(completion.choices[0].message.content);
    
    // Add background music suggestion based on content and language
    content.musicSuggestion = await suggestBackgroundMusic(topic, content.title, language);
    
    return content;
  } catch (error) {
    console.error('Error generating podcast content:', error);
    throw error;
  }
};

// Helper function to suggest background music
async function suggestBackgroundMusic(topic, title, language = 'en') {
  try {
    const prompt = {
      en: `Suggest background music style and mood for a TikTok-style educational podcast about "${topic}" with title "${title}"`,
      vi: `Gợi ý phong cách và tâm trạng của nhạc nền cho podcast giáo dục kiểu TikTok về "${topic}" với tiêu đề "${title}"`
    }[language] || prompt.en;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a music supervisor who suggests perfect background music for content."
        },
        {
          role: "user",
          content: `${prompt}
          Format response as JSON: {
            "style": "Music style/genre",
            "mood": "Mood/emotion of the music",
            "tempo": "Suggested tempo (BPM)",
            "description": "Brief description of ideal background music"
          }`
        }
      ],
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error suggesting background music:', error);
    return {
      style: "Ambient",
      mood: "Neutral",
      tempo: "Medium",
      description: "Subtle background music that won't overpower the voice"
    };
  }
} 