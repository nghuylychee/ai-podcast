import { useState } from 'react';
import { generatePodcastContent } from '../services/openai';
import { textToSpeech } from '../services/tts';

const PodcastGenerator = ({ onPodcastGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ step: 0, message: '' });

  const handleGenerate = async () => {
    if (!topic) return;

    setIsGenerating(true);
    
    try {
      // Step 1: Generate content
      setProgress({ step: 1, message: 'Generating podcast script...' });
      const content = await generatePodcastContent(topic);
      
      // Step 2: Convert to speech
      setProgress({ step: 2, message: 'Converting to audio...' });
      const audioBlob = await textToSpeech(content.script);

      // Step 3: Create podcast object
      const audioUrl = URL.createObjectURL(audioBlob);
      const podcast = {
        id: Date.now().toString(),
        title: content.title,
        topic: topic,
        audio_url: audioUrl,
        duration: content.duration,
        background_img: `https://source.unsplash.com/random/800x600/?${topic.replace(' ', '+')}`,
      };

      // Step 4: Pass the podcast back
      onPodcastGenerated(podcast);
      setProgress({ step: 3, message: 'Done!' });
    } catch (error) {
      console.error('Error generating podcast:', error);
      setProgress({ step: -1, message: `Error: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedTopics = [
    "Mind-blowing space facts",
    "Psychology tricks that work",
    "Ancient mysteries solved",
    "Future technology predictions",
    "Unexplained phenomena"
  ];

  return (
    <div className="p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Generate New Podcast</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic for your podcast..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-white/50"
            disabled={isGenerating}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedTopics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                disabled={isGenerating}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic || isGenerating}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !topic || isGenerating
              ? 'bg-white/20 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isGenerating ? 'Generating...' : 'Generate Podcast'}
        </button>

        {isGenerating && (
          <div className="mt-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(progress.step / 3) * 100}%` }}
              />
            </div>
            <p className="text-sm text-white/60 mt-2">{progress.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastGenerator; 