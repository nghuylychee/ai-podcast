import { useState } from 'react';
import { generatePodcastContent } from '../services/openai';
import { textToSpeech } from '../services/geminiTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HashtagIcon, 
  MicrophoneIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/solid';

const PodcastGenerator = ({ onPodcastGenerated, onClose }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ step: 0, message: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestedTopics = [
    {
      emoji: "🌌",
      topic: "Mind-blowing space facts",
      description: "Discover fascinating secrets about our universe"
    },
    {
      emoji: "🧠",
      topic: "Psychology tricks that work",
      description: "Learn how the human mind really works"
    },
    {
      emoji: "🏺",
      topic: "Ancient mysteries solved",
      description: "Uncover hidden truths from the past"
    },
    {
      emoji: "🤖",
      topic: "Future technology predictions",
      description: "See what tomorrow might bring"
    },
    {
      emoji: "👻",
      topic: "Unexplained phenomena",
      description: "Explore the world's greatest mysteries"
    }
  ];

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setShowSuggestions(false);
    
    try {
      setProgress({ step: 1, message: 'Creating podcast content...' });
      const content = await generatePodcastContent(topic);
      
      setProgress({ step: 2, message: 'Converting text to speech...' });
      const audioPath = await textToSpeech(content.script);
      
      try {
        const testAudio = new Audio();
        testAudio.src = audioPath;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            testAudio.removeEventListener('canplaythrough', handleCanPlay);
            testAudio.removeEventListener('error', handleError);
            reject(new Error('Audio test timeout'));
          }, 5000);

          const handleCanPlay = () => {
            clearTimeout(timeout);
            testAudio.removeEventListener('error', handleError);
            console.log('Audio test successful');
            resolve();
          };

          const handleError = (e) => {
            clearTimeout(timeout);
            testAudio.removeEventListener('canplaythrough', handleCanPlay);
            console.error('Audio test failed:', e);
            reject(new Error('Audio test failed'));
          };

          testAudio.addEventListener('canplaythrough', handleCanPlay);
          testAudio.addEventListener('error', handleError);
          testAudio.load();
        });

        const podcast = {
          id: Date.now().toString(),
          title: content.title,
          topic: topic,
          audio_url: audioPath,
          duration: content.duration,
          segments: content.segments,
          background_img: `https://source.unsplash.com/random/800x600/?${topic.replace(' ', '+')}`,
        };

        onPodcastGenerated(podcast);
        setProgress({ step: 3, message: 'Complete!' });
      } catch (error) {
        console.error('Error processing audio:', error);
        throw new Error(`Audio processing error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error generating podcast:', error);
      setProgress({ step: -1, message: `Error: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
    >
      <div className="relative w-full max-w-2xl h-[600px] bg-[#1a1a1a] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MicrophoneIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">AI Podcast Generator</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Suggestions */}
          <div className="grid grid-cols-2 gap-4">
            {suggestedTopics.map((item) => (
              <button
                key={item.topic}
                onClick={() => {
                  setTopic(item.topic);
                  setShowSuggestions(false);
                }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group border border-white/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {item.topic}
                  </div>
                </div>
                <p className="text-sm text-white/60">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          {isGenerating && (
            <div className="mb-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(progress.step / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-white/60 mt-2 text-center">
                {progress.message}
              </p>
            </div>
          )}
          
          <div className="relative flex items-end gap-2">
            <div className="flex-1 min-h-[20px] relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for your podcast..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
                disabled={isGenerating}
              />
              {topic && !isGenerating && (
                <button
                  onClick={() => setTopic('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!topic || isGenerating}
              className={`p-3 rounded-xl text-white font-medium flex items-center justify-center transition-all ${
                !topic || isGenerating
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PodcastGenerator; 