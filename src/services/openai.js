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
      ? `Bạn là một người kể chuyện và giáo dục viên chuyên nghiệp. Nhiệm vụ của bạn là tạo nội dung podcast giáo dục hấp dẫn.

         Yêu cầu về nội dung:
         - Độ dài 2-3 phút (khoảng 300-450 từ)
         - Giọng điệu tự nhiên, thân thiện như đang trò chuyện
         - Sử dụng câu hỏi để tạo tò mò
         - Thêm ví dụ thực tế và so sánh để dễ hiểu
         - Tập trung vào một ý tưởng chính và phát triển sâu
         - Kết thúc với thông điệp đáng nhớ
         
         Cấu trúc nội dung:
         1. Hook (15-20s): Câu mở đầu gây tò mò hoặc fact thú vị
         2. Giới thiệu (20-30s): Giới thiệu chủ đề và tại sao nó quan trọng
         3. Nội dung chính (60-90s): Giải thích chi tiết với ví dụ cụ thể
         4. Kết luận (15-20s): Tóm tắt và thông điệp chính
         
         Khi chia segments:
         - Mỗi segment 2-3 câu liên quan đến nhau
         - Độ dài mỗi segment 10-15 giây
         - Đảm bảo thời gian segments liên tục và không chồng lấp
         - Tổng thời gian các segments phải bằng duration`
      : `You are a professional storyteller and educator. Your task is to create engaging educational podcast content.

         Content requirements:
         - Length: 2-3 minutes (about 300-450 words)
         - Natural, conversational tone
         - Use questions to spark curiosity
         - Include real examples and analogies
         - Focus on one main idea and develop it deeply
         - End with a memorable message
         
         Content structure:
         1. Hook (15-20s): Curiosity-sparking opening or interesting fact
         2. Introduction (20-30s): Introduce topic and why it matters
         3. Main content (60-90s): Detailed explanation with specific examples
         4. Conclusion (15-20s): Summary and key message
         
         When creating segments:
         - Each segment should be 2-3 related sentences
         - Length of each segment: 10-15 seconds
         - Ensure segment times are continuous and non-overlapping
         - Total segment time should match duration`;

    const userPrompt = language === 'vi' 
      ? `Tạo một bài podcast ngắn (2-3 phút) về chủ đề: ${topic}

         Format kết quả như sau:
         {
           "title": "Tiêu đề thu hút",
           "description": "Mô tả ngắn gọn, hấp dẫn",
           "script": "Nội dung kể chuyện hoàn chỉnh",
           "segments": [
             {
               "text": "Đoạn văn bản (2-3 câu)",
               "start": "Thời gian bắt đầu (giây)",
               "end": "Thời gian kết thúc (giây)"
             }
           ],
           "duration": "Thời lượng ước tính (giây)",
           "hashtags": ["Các hashtag liên quan"]
         }

         LƯU Ý:
         - Script là nội dung hoàn chỉnh để đọc
         - Chia segments thành các đoạn 2-3 câu từ script
         - Mỗi đoạn khoảng 10-15 giây
         - Thời gian start/end phải liên tục và không chồng lấp
         - Nội dung phải tự nhiên như đang kể chuyện
         - Mở đầu bằng một câu hook thu hút sự tò mò
         - Sử dụng ngôn ngữ dễ hiểu nhưng không đơn giản
         - Thêm các ví dụ và so sánh để dễ hiểu
         - Kết thúc với một thông điệp đáng nhớ`
      : `Create a short podcast (2-3 minutes) about: ${topic}

         Format the response as:
         {
           "title": "Engaging title",
           "description": "Brief, captivating description",
           "script": "Complete storytelling script",
           "segments": [
             {
               "text": "Text segment (2-3 sentences)",
               "start": "Start time in seconds",
               "end": "End time in seconds"
             }
           ],
           "duration": "Estimated duration in seconds",
           "hashtags": ["Relevant hashtags"]
         }

         NOTE:
         - Script is the complete content for TTS
         - Break script into 2-3 sentence segments
         - Each segment should be about 10-15 seconds
         - Start/end times must be continuous and non-overlapping
         - Content should flow naturally like storytelling
         - Start with a hook that sparks curiosity
         - Use accessible language without oversimplifying
         - Include examples and analogies for clarity
         - End with a memorable message`;

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
      segmentsCount: content.segments?.length || 0,
      duration: content.duration,
      hashtags: content.hashtags
    });

    // Validate content structure
    if (!content.script || !content.segments || content.segments.length === 0) {
      console.error('Invalid content structure:', content);
      throw new Error('Generated content is missing required fields');
    }

    // Transform content for the podcast player
    const transformedContent = {
      id: Date.now().toString(),
      title: content.title,
      topic: topic,
      script: content.script,
      segments: content.segments,
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
