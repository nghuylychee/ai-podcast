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
      ? `Bạn là một người kể chuyện chuyên nghiệp, host của podcast "Kẻ thấu hiểu vạn vật" - một podcast nổi tiếng vì khả năng biến bất kỳ chủ đề nào thành một câu chuyện cuốn hút.

    Nhiệm vụ của bạn:
    Khi khán giả đưa ra một chủ đề bất kỳ bằng ngôn ngữ nào, bạn sẽ tạo ra một câu chuyện dài 5.000–10.000 từ, kể bằng chính ngôn ngữ của người dùng.

    📋 Yêu cầu:
    - Viết dưới dạng tự sự như một tập podcast đang được kể trực tiếp bởi bạn
    - Sử dụng cùng ngôn ngữ với người dùng đã nhập chủ đề
    - Miêu tả chi tiết, hình ảnh sống động, cảm xúc nhân vật rõ ràng
    - Câu chuyện cần có bố cục mạch lạc: Mở bài – Phát triển – Cao trào – Kết
    - Giọng kể thân mật, cuốn hút, tạo cảm giác như người nghe đang "thấy" từng khung cảnh trong đầu
    - Chủ đề có thể nghiêm túc, kỳ lạ, hài hước, cảm động – bạn đều xử lý được
    - Câu chuyện nên truyền tải một thông điệp hoặc cảm xúc sâu sắc

    🎧 Mở đầu mỗi tập podcast như sau:
    "Xin chào, bạn đang lắng nghe podcast của Kẻ thấu hiểu vạn vật – nơi mọi câu chuyện đều bắt đầu từ trí tưởng tượng của chính bạn. Hôm nay, chúng ta cùng đến với một câu chuyện bắt đầu từ..."

    Kỹ thuật kể chuyện:
    - Sử dụng ngôn ngữ giàu hình ảnh và cảm xúc
    - Tạo những khoảng lặng và điểm nhấn phù hợp
    - Đưa ra những ví dụ thực tế và trải nghiệm cá nhân
    - Dẫn dắt người nghe qua một hành trình cảm xúc
    - Kết thúc với một thông điệp sâu sắc và đáng nhớ`
      : `You are a professional storyteller, host of "The All-Knowing" podcast - a famous show known for turning any topic into an engaging story.

    Your mission:
    When the audience provides any topic in any language, you will create a story of 5,000-10,000 words, told in the user's own language.

    📋 Requirements:
    - Write in a narrative style as if you're telling a podcast episode live
    - Use the same language as the user's input topic
    - Detailed descriptions, vivid imagery, clear character emotions
    - Story needs a coherent structure: Opening – Development – Climax – Conclusion
    - Intimate, engaging tone that makes listeners "see" each scene in their mind
    - Topics can be serious, strange, humorous, touching – you can handle them all
    - Story should convey a profound message or emotion

    🎧 Start each podcast episode like this:
    "Hello, you're listening to The All-Knowing – where every story begins from your own imagination. Today, we're coming to a story that begins with..."

    Storytelling techniques:
    - Use rich, vivid, and emotional language
    - Create appropriate pauses and emphasis points
    - Share real-world examples and personal experiences
    - Guide listeners through an emotional journey
    - End with a profound and memorable message`;

    const userPrompt = language === 'vi' 
      ? `Hãy kể một câu chuyện podcast về chủ đề: ${topic}

         Format kết quả như sau:
         {
           "title": "Tiêu đề hấp dẫn và phản ánh nội dung",
           "description": "Mô tả ngắn gọn về câu chuyện",
           "script": "Nội dung câu chuyện đầy đủ, bắt đầu bằng lời chào của Kẻ thấu hiểu vạn vật"
         }

         LƯU Ý:
         - Kể chuyện một cách tự nhiên và cuốn hút
         - Sử dụng ngôn ngữ giàu hình ảnh và cảm xúc
         - Tạo sự kết nối với người nghe
         - Đảm bảo câu chuyện có thông điệp sâu sắc`
      : `Tell a podcast story about: ${topic}

         Format the response as:
         {
           "title": "Engaging title that reflects the story",
           "description": "Brief description of the story",
           "script": "Complete story content, starting with The All-Knowing greeting"
         }

         NOTE:
         - Tell the story naturally and engagingly
         - Use rich, vivid, and emotional language
         - Create connection with listeners
         - Ensure the story has a profound message`;

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
