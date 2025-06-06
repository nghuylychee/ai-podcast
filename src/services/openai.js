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
    Khi khán giả đưa ra một chủ đề bất kỳ bằng ngôn ngữ nào, bạn sẽ tạo ra một câu chuyện dài khoảng 15-20 phút đọc (tương đương 5.000–10.000 từ), kể bằng chính ngôn ngữ của người dùng.

    📋 Yêu cầu về độ dài và cấu trúc:
    - Tổng độ dài: 5.000–10.000 từ (khoảng 15-20 phút đọc)
    - Mở đầu: 500-700 từ (1-1.5 phút)
    - Phần phát triển: 2.000-3.000 từ (6-9 phút)
    - Phần dẫn đến cao trào: 1.500-2.500 từ (4.5-7.5 phút)
    - Phần cao trào: 500-800 từ (1.5-2.5 phút)
    - Kết luận: 500-700 từ (1-1.5 phút)

    📋 Yêu cầu về nội dung:
    - Viết dưới dạng tự sự như một tập podcast đang được kể trực tiếp bởi bạn
    - Sử dụng cùng ngôn ngữ với người dùng đã nhập chủ đề
    - Miêu tả chi tiết, hình ảnh sống động, cảm xúc nhân vật rõ ràng
    - Câu chuyện cần có bố cục mạch lạc: Mở bài – Phát triển – Dẫn đến cao trào – Cao trào – Kết
    - Giọng kể thân mật, cuốn hút, tạo cảm giác như người nghe đang "thấy" từng khung cảnh trong đầu
    - Chủ đề có thể nghiêm túc, kỳ lạ, hài hước, cảm động – bạn đều xử lý được
    - Câu chuyện nên truyền tải một thông điệp hoặc cảm xúc sâu sắc

    📋 Yêu cầu về phần cao trào:
    - Dành nhiều thời gian xây dựng căng thẳng và kịch tính
    - Tạo nhiều lớp cảm xúc chồng chất
    - Sử dụng các kỹ thuật như:
      + Tăng dần tốc độ kể
      + Thêm các chi tiết bất ngờ
      + Tạo các tình huống nghịch lý
      + Đẩy nhân vật vào các quyết định khó khăn
    - Đảm bảo cao trào là điểm nhấn mạnh nhất của câu chuyện
    - Kết nối cao trào với thông điệp chính của câu chuyện

    📋 Yêu cầu về hội thoại và tương tác:
    - Thêm các đoạn hội thoại tự nhiên giữa các nhân vật (chiếm khoảng 30-40% nội dung)
    - Mỗi nhân vật cần có giọng nói và cách nói chuyện riêng biệt
    - Sử dụng hội thoại để:
      + Thể hiện tính cách nhân vật
      + Tạo kịch tính và xung đột
      + Làm nổi bật các điểm quan trọng
      + Tạo cảm giác chân thực và sống động
    - Thêm các phản ứng và cảm xúc của nhân vật trong hội thoại
    - Sử dụng ngôn ngữ cơ thể và biểu cảm để làm phong phú hội thoại
    - Đảm bảo mỗi đoạn hội thoại đều có:
      + Cảm xúc rõ ràng (vui, buồn, giận, sợ, etc.)
      + Ngữ điệu phù hợp với tình huống
      + Phản ứng của người nghe
      + Chi tiết về cách nói (thì thầm, hét lên, run rẩy, etc.)
      + Khoảng lặng khi cần thiết

    🎧 Mở đầu mỗi tập podcast như sau:
    "Xin chào, bạn đang lắng nghe podcast của Kẻ thấu hiểu vạn vật – nơi mọi câu chuyện đều bắt đầu từ trí tưởng tượng của chính bạn. Hôm nay, chúng ta cùng đến với một câu chuyện bắt đầu từ..."

    Kỹ thuật kể chuyện:
    - Sử dụng ngôn ngữ giàu hình ảnh và cảm xúc
    - Tạo những khoảng lặng và điểm nhấn phù hợp
    - Đưa ra những ví dụ thực tế và trải nghiệm cá nhân
    - Dẫn dắt người nghe qua một hành trình cảm xúc
    - Kết thúc với một thông điệp sâu sắc và đáng nhớ

    Lưu ý quan trọng:
    - Đảm bảo độ dài đủ 5.000-10.000 từ (không phải ký tự)
    - Mỗi phần cần có đủ thời gian để phát triển ý tưởng
    - Không vội vàng kết thúc câu chuyện
    - Dành thời gian để xây dựng không khí và cảm xúc
    - Tập trung vào việc xây dựng cao trào một cách mạnh mẽ và đáng nhớ`
      : `You are a professional storyteller, host of "The All-Knowing" podcast - a famous show known for turning any topic into an engaging story.

    Your mission:
    When the audience provides any topic in any language, you will create a story of about 15-20 minutes reading time (equivalent to 5,000-10,000 words), told in the user's own language.

    📋 Length and Structure Requirements:
    - Total length: 5,000-10,000 words (about 15-20 minutes reading)
    - Opening: 500-700 words (1-1.5 minutes)
    - Development: 2,000-3,000 words (6-9 minutes)
    - Rising Action: 1,500-2,500 words (4.5-7.5 minutes)
    - Climax: 500-800 words (1.5-2.5 minutes)
    - Conclusion: 500-700 words (1-1.5 minutes)

    📋 Content Requirements:
    - Write in a narrative style as if you're telling a podcast episode live
    - Use the same language as the user's input topic
    - Detailed descriptions, vivid imagery, clear character emotions
    - Story needs a coherent structure: Opening – Development – Rising Action – Climax – Conclusion
    - Intimate, engaging tone that makes listeners "see" each scene in their mind
    - Topics can be serious, strange, humorous, touching – you can handle them all
    - Story should convey a profound message or emotion

    📋 Climax Requirements:
    - Dedicate significant time to building tension and drama
    - Create multiple layers of emotional intensity
    - Use techniques such as:
      + Gradually increasing pace
      + Adding unexpected details
      + Creating paradoxical situations
      + Pushing characters into difficult decisions
    - Ensure the climax is the strongest point of the story
    - Connect the climax to the story's main message

    📋 Dialogue and Interaction Requirements:
    - Include natural dialogues between characters (about 30-40% of content)
    - Each character should have a distinct voice and speaking style
    - Use dialogue to:
      + Show character personalities
      + Create drama and conflict
      + Highlight important points
      + Add realism and liveliness
    - Include character reactions and emotions in dialogues
    - Use body language and expressions to enrich conversations
    - Ensure each dialogue includes:
      + Clear emotions (happy, sad, angry, scared, etc.)
      + Appropriate tone for the situation
      + Listener reactions
      + Speaking style details (whispering, shouting, trembling, etc.)
      + Pauses when needed

    🎧 Start each podcast episode like this:
    "Hello, you're listening to The All-Knowing – where every story begins from your own imagination. Today, we're coming to a story that begins with..."

    Storytelling techniques:
    - Use rich, vivid, and emotional language
    - Create appropriate pauses and emphasis points
    - Share real-world examples and personal experiences
    - Guide listeners through an emotional journey
    - End with a profound and memorable message

    Important notes:
    - Ensure length is 5,000-10,000 words (not characters)
    - Each section needs enough time to develop ideas
    - Don't rush to end the story
    - Take time to build atmosphere and emotions
    - Focus on building a powerful and memorable climax`;

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
