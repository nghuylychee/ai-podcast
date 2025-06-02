import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateReadingPrompt = async (script) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Bạn là một chuyên gia về giọng đọc podcast. 
          Nhiệm vụ của bạn là chuyển đổi script thành prompt có hướng dẫn cách đọc chi tiết cho từng câu.
          
          Yêu cầu:
          1. Phân tích cảm xúc và ngữ điệu của từng câu
          2. Thêm hướng dẫn về tốc độ, âm lượng, và cách nhấn mạnh
          3. Sử dụng các từ khóa như: whisper, excited, calm, dramatic, etc.
          4. Format kết quả theo dạng:
             [Hướng dẫn đọc]: "Nội dung cần đọc"
          
          Ví dụ:
          Say in a spooky whisper: "By the pricking of my thumbs..."
          Continue with dramatic pause: "Something wicked this way comes"
          `
        },
        {
          role: "user",
          content: script.toString()
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi khi tạo prompt đọc:', error);
    throw error;
  }
}; 