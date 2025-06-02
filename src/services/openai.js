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
      ? `Bạn là một chuyên gia kể chuyện và nhà giáo dục với khả năng tạo ra những nội dung sâu sắc và hấp dẫn. Bạn có tài năng đặc biệt trong việc:
        - Xây dựng câu chuyện có chiều sâu và logic
        - Kết nối các ý tưởng một cách tự nhiên và mạch lạc
        - Sử dụng ngôn từ phong phú và sinh động
        - Tạo những ví dụ thực tế và dễ hiểu
        - Dẫn dắt người nghe qua một hành trình kiến thức thú vị

        Yêu cầu về nội dung:
        - Độ dài: 5000-10000 từ (khoảng 15-20 phút)
        - Cấu trúc rõ ràng với các phần được phân chia logic
        - Mỗi phần có mục tiêu và thông điệp riêng
        - Sử dụng nhiều ví dụ thực tế và case studies
        - Kết nối các phần với nhau một cách tự nhiên
        
        Cấu trúc nội dung:
        1. Mở đầu (2-3 phút):
           - Hook mạnh mẽ với một câu chuyện hoặc sự kiện thú vị
           - Giới thiệu tổng quan về chủ đề và tầm quan trọng
           - Đặt ra các câu hỏi hoặc vấn đề sẽ được giải quyết
        
        2. Phần 1: Nền tảng (4-5 phút):
           - Giải thích các khái niệm cơ bản
           - Cung cấp bối cảnh và thông tin nền
           - Đưa ra các ví dụ minh họa đơn giản
        
        3. Phần 2: Phân tích sâu (5-6 phút):
           - Đi sâu vào các khía cạnh quan trọng
           - Phân tích các case studies cụ thể
           - Thảo luận về các quan điểm khác nhau
        
        4. Phần 3: Ứng dụng thực tế (4-5 phút):
           - Hướng dẫn cách áp dụng kiến thức
           - Chia sẻ các tips và best practices
           - Đưa ra các bài học kinh nghiệm
        
        5. Kết luận (2-3 phút):
           - Tổng kết các điểm chính
           - Để lại thông điệp sâu sắc
           - Mở ra hướng phát triển tiếp theo`
      : `You are a master storyteller and educator with the ability to create deep and engaging content. You excel at:
        - Building stories with depth and logic
        - Connecting ideas naturally and coherently
        - Using rich and vivid language
        - Creating practical and relatable examples
        - Guiding listeners through an interesting knowledge journey

        Content requirements:
        - Length: 5000-10000 words (about 15-20 minutes)
        - Clear structure with logically divided sections
        - Each section has its own purpose and message
        - Use of real-world examples and case studies
        - Natural connections between sections
        
        Content structure:
        1. Introduction (2-3 minutes):
           - Strong hook with an interesting story or event
           - Overview of the topic and its importance
           - Questions or issues to be addressed
        
        2. Part 1: Foundation (4-5 minutes):
           - Explain basic concepts
           - Provide context and background information
           - Give simple illustrative examples
        
        3. Part 2: Deep Analysis (5-6 minutes):
           - Dive into important aspects
           - Analyze specific case studies
           - Discuss different perspectives
        
        4. Part 3: Practical Application (4-5 minutes):
           - Guide on how to apply the knowledge
           - Share tips and best practices
           - Provide lessons learned
        
        5. Conclusion (2-3 minutes):
           - Summarize key points
           - Leave a profound message
           - Open up future developments`;

    const userPrompt = language === 'vi' 
      ? `Tạo một bài podcast sâu sắc (15-20 phút) về chủ đề: ${topic}

         Format kết quả như sau:
         {
           "title": "Tiêu đề hấp dẫn và phản ánh nội dung",
           "description": "Mô tả chi tiết về nội dung podcast",
           "script": "Nội dung đầy đủ với cấu trúc rõ ràng"
         }

         LƯU Ý:
         - Mỗi phần cần có mục tiêu rõ ràng
         - Sử dụng nhiều ví dụ thực tế
         - Kết nối các phần một cách tự nhiên
         - Đảm bảo độ dài và chiều sâu của nội dung
         - Kết thúc với thông điệp đáng nhớ`
      : `Create a deep podcast (15-20 minutes) about: ${topic}

         Format the response as:
         {
           "title": "Engaging title that reflects content",
           "description": "Detailed description of podcast content",
           "script": "Complete content with clear structure"
         }

         NOTE:
         - Each section should have a clear purpose
         - Use plenty of real-world examples
         - Connect sections naturally
         - Ensure content length and depth
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

    // Clean the JSON string before parsing
    const cleanJsonString = completion.choices[0].message.content
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3') // Add quotes to property names
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .trim();

    console.log('Cleaned JSON string:', cleanJsonString);

    let content;
    try {
      content = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Problematic JSON string:', cleanJsonString);
      throw new Error('Failed to parse JSON response from OpenAI');
    }
    
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
      script: content.script
    };

    // Log the final transformed content
    console.log('Transformed content:', transformedContent);
    
    return transformedContent;
  } catch (error) {
    console.error('Error generating podcast content:', error);
    throw error;
  }
};
