import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Function to detect language from text
const detectLanguage = (text) => {
  if (!text) return 'en';
  // Simple detection based on common Vietnamese diacritical marks
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text) ? 'vi' : 'en';
};

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

export const generatePodcastContent = async (topic) => {
  try {
    // Detect language of the topic
    const language = detectLanguage(topic);
    console.log('OpenAI detected language:', language);

    // Create system prompt based on detected language
    const systemPrompt = language === 'vi'
      ? `Bạn là một chuyên gia kể chuyện với khả năng tạo ra những câu chuyện sống động và lôi cuốn. Bạn có tài năng đặc biệt trong việc:
        - Xây dựng cốt truyện hấp dẫn
        - Tạo hình ảnh sống động qua lời văn
        - Sử dụng ngôn từ gợi cảm xúc
        - Tạo những khoảnh khắc cao trào và bất ngờ
        - Kết nối các ý tưởng một cách tự nhiên và logic

        Yêu cầu về nội dung:
        - Độ dài: 3-5 phút (khoảng 1000-2000 từ)
        - Bám sát chủ đề chính xuyên suốt câu chuyện
        - Mô tả chi tiết, tạo hình ảnh rõ nét trong tâm trí người nghe
        - Sử dụng nhiều phép so sánh và ẩn dụ để làm sinh động nội dung
        - Tạo cảm xúc và sự đồng cảm với người nghe
        
        Cấu trúc nội dung:
        1. Mở đầu (30-45s): 
           - Tạo hook mạnh mẽ bằng một câu chuyện, sự kiện hoặc tình huống gây tò mò
           - Đặt câu hỏi hoặc vấn đề thu hút sự chú ý
        
        2. Giới thiệu (45-60s):
           - Kết nối hook với chủ đề chính
           - Giải thích tại sao chủ đề này quan trọng và liên quan
        
        3. Nội dung chính (90-150s):
           - Phát triển ý tưởng với các ví dụ cụ thể và chi tiết
           - Tạo những khoảnh khắc cao trào và bất ngờ
           - Sử dụng ngôn ngữ mô tả sinh động
        
        4. Kết luận (30-45s):
           - Tổng kết các ý chính một cách sáng tạo
           - Để lại thông điệp sâu sắc và đáng nhớ
           - Tạo dư âm trong lòng người nghe`
      : `You are a master storyteller with the ability to create vivid and engaging narratives. You excel at:
        - Crafting compelling storylines
        - Creating vivid imagery through words
        - Using emotionally resonant language
        - Building moments of suspense and revelation
        - Connecting ideas naturally and logically

        Content requirements:
        - Length: 3-5 minutes (about 1000-2000 words)
        - Maintain strong focus on the main topic throughout
        - Use detailed descriptions to paint pictures in listeners' minds
        - Employ rich metaphors and analogies to bring content to life
        - Create emotional connection with the audience
        
        Content structure:
        1. Hook (30-45s):
           - Create a powerful hook with a story, event, or intriguing situation
           - Pose thought-provoking questions or scenarios
        
        2. Introduction (45-60s):
           - Connect the hook to the main topic
           - Explain why this topic matters and is relevant
        
        3. Main content (90-150s):
           - Develop ideas with specific examples and details
           - Create moments of surprise and revelation
           - Use vivid descriptive language
        
        4. Conclusion (30-45s):
           - Creatively summarize key points
           - Leave a profound and memorable message
           - Create lasting resonance with listeners`;

    const userPrompt = language === 'vi' 
      ? `Tạo một bài podcast ngắn (3-5 phút) về chủ đề: ${topic}

         Format kết quả như sau:
         {
           "title": "Tiêu đề thu hút",
           "description": "Mô tả ngắn gọn, hấp dẫn",
           "script": "Nội dung kể chuyện hoàn chỉnh",
           "duration": "Thời lượng ước tính (giây)",
           "hashtags": ["Các hashtag liên quan"]
         }

         LƯU Ý:
         - Nội dung phải tự nhiên như đang kể chuyện
         - Mở đầu bằng một câu hook thu hút sự tò mò
         - Sử dụng ngôn ngữ dễ hiểu nhưng không đơn giản
         - Thêm các ví dụ và so sánh để dễ hiểu
         - Kết thúc với một thông điệp đáng nhớ`
      : `Create a short podcast (3-5 minutes) about: ${topic}

         Format the response as:
         {
           "title": "Engaging title",
           "description": "Brief, captivating description",
           "script": "Complete storytelling script",
           "duration": "Estimated duration in seconds",
           "hashtags": ["Relevant hashtags"]
         }

         NOTE:
         - Content should flow naturally like storytelling
         - Start with a hook that sparks curiosity
         - Use accessible language without oversimplifying
         - Include examples and analogies for clarity
         - End with a memorable message`;

    // For testing without API, return mock data if available
    if (process.env.NODE_ENV === 'development' && MOCK_RESPONSES[topic.toLowerCase()]) {
      return MOCK_RESPONSES[topic.toLowerCase()];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    // Log the raw response
    console.log('Raw OpenAI response:', completion.choices[0].message.content);

    const content = JSON.parse(completion.choices[0].message.content);
    
    // Log the parsed content
    console.log('Parsed content:', {
      title: content.title,
      description: content.description,
      scriptLength: content.script?.length || 0,
      duration: content.duration,
      hashtags: content.hashtags
    });

    // Validate content structure
    if (!content.script) {
      console.error('Invalid content structure:', content);
      throw new Error('Generated content is missing required fields');
    }

    // Transform content for the podcast player
    const transformedContent = {
      id: Date.now().toString(),
      title: content.title,
      topic: topic,
      script: content.script,
      duration: Math.ceil(parseInt(content.duration) / 60), // Convert seconds to minutes
      hashtags: content.hashtags
    };

    // Log the final transformed content
    console.log('Transformed content:', transformedContent);
    
    return transformedContent;
  } catch (error) {
    console.error('Error generating podcast content:', error);
    throw error;
  }
};
