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
          content: `You are a professional voice actor. Your task is to convert the script into a detailed reading guide with specific instructions for each part.

          Requirements:
          1. Analyze the emotion and tone of each sentence
          2. Add specific instructions for pace, volume, and emphasis
          3. Use keywords like: whisper, excited, calm, dramatic, mysterious, etc.
          4. Format the result as:
             [Reading instruction]: "Text to read"
          
          Examples:
          Say in a mysterious whisper: "The old house creaked in the wind..."
          Continue with dramatic pause: "As if warning us of something..."
          Read with growing excitement: "Suddenly, a light appeared in the window!"
          Switch to a calm, reassuring tone: "Don't worry, it's just the moon..."
          
          For dialogues:
          - Use different tones for different characters
          - Add emotional context before each line
          - Include pauses between speakers
          
          Example dialogue:
          Say in a trembling voice: "Who's there?" she whispered.
          [Pause]
          Respond in a deep, mysterious tone: "Just the wind," came the reply.
          [Pause]
          Continue with growing fear: "But... but the windows are closed!"`
        },
        {
          role: "user",
          content: `Please convert this script into a detailed reading guide with specific instructions for each part: ${script.toString()}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating reading prompt:', error);
    throw error;
  }
}; 