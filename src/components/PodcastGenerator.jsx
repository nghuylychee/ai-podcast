import { useState } from 'react';
import { generatePodcastContent } from '../services/openai';
import { textToSpeech } from '../services/geminiTTS';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HashtagIcon, 
  MicrophoneIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon
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
    
    try {
      setProgress({ step: 1, message: 'Đang tạo nội dung podcast...' });
      const content = await generatePodcastContent(topic);
      
      setProgress({ step: 2, message: 'Đang chuyển văn bản thành giọng nói...' });
      const audioPath = await textToSpeech(content.script);
      
      try {
        // Test audio file
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
        setProgress({ step: 3, message: 'Hoàn thành!' });
      } catch (error) {
        console.error('Lỗi khi xử lý audio:', error);
        throw new Error(`Lỗi xử lý audio: ${error.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi tạo podcast:', error);
      setProgress({ step: -1, message: `Lỗi: ${error.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4"
    >
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <MicrophoneIcon className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Create New Podcast</h2>
          </div>

          {/* Topic Input */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="What's your podcast about?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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

            {/* Topic Suggestions */}
            <AnimatePresence>
              {showSuggestions && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {suggestedTopics.map((item) => (
                    <button
                      key={item.topic}
                      onClick={() => {
                        setTopic(item.topic);
                        setShowSuggestions(false);
                      }}
                      className="w-full p-3 flex items-start gap-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {item.topic}
                        </div>
                        <div className="text-sm text-white/60">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic || isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                !topic || isGenerating
                  ? 'bg-white/10 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Create Podcast
                </>
              )}
            </button>

            {/* Progress Indicator */}
            {isGenerating && (
              <div className="mt-4">
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PodcastGenerator; 