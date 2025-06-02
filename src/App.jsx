import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Feed from './components/Feed'
import PodcastGenerator from './components/PodcastGenerator'
import { SparklesIcon } from '@heroicons/react/24/solid'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import { generatePodcastContent } from './services/openai.js'
import { textToSpeech } from './services/geminiTTS.js'

function App() {
  const [podcasts, setPodcasts] = useState([])
  const [myPodcasts, setMyPodcasts] = useState([])
  const [showGenerator, setShowGenerator] = useState(false)
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ step: 0, message: '' })
  const [currentPodcast, setCurrentPodcast] = useState(null)
  const [notificationSound] = useState(new Audio('/notification.mp3'))

  useEffect(() => {
    // Preload the notification sound
    notificationSound.load();
    // Set volume to 30%
    notificationSound.volume = 0.3;
  }, [notificationSound]);

  const playNotification = () => {
    notificationSound.currentTime = 0;
    // Play with a slight delay to ensure smooth playback
    setTimeout(() => {
      notificationSound.play().catch(console.error);
    }, 0);
  };

  const handlePodcastGenerated = (newPodcast) => {
    setPodcasts(prev => [...prev, newPodcast])
    setCurrentPodcast(newPodcast)
    setShowGenerator(false)
  }

  const handleAddToMyPodcasts = (podcast) => {
    if (!myPodcasts.some(p => p.id === podcast.id)) {
      setMyPodcasts(prev => [...prev, podcast])
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setProgress({ step: 0, message: 'Please enter a topic' });
      return;
    }

    setIsGenerating(true);
    setProgress({ step: 1, message: 'Creating your podcast content...' });
    
    try {
      // Generate content
      const content = await generatePodcastContent(topic);
      if (!content || !content.script) {
        throw new Error('Failed to generate podcast content');
      }
      
      // Generate audio
      setProgress({ step: 2, message: 'Converting to speech...' });
      const audioUrl = await textToSpeech(content.script);
      if (!audioUrl) {
        throw new Error('Failed to generate audio');
      }
      
      // Create podcast object
      const podcast = {
        id: Date.now().toString(),
        title: content.title,
        topic: topic,
        audio_url: audioUrl,
        duration: content.duration,
        segments: content.segments,
        background_img: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(topic)}`,
      };

      // Update state
      setPodcasts(prev => [...prev, podcast]);
      setCurrentPodcast(podcast);
      setProgress({ step: 3, message: 'Done! Your podcast is ready.' });
      setTopic('');
      
      // Play notification sound
      playNotification();
    } catch (error) {
      console.error('Error generating podcast:', error);
      setProgress({ 
        step: 0, 
        message: error.message || 'An error occurred while generating the podcast. Please try again.' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AuthProvider>
      <Layout>
        {currentPodcast ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Back to Generator button - Fixed position */}
            <div className="fixed top-4 left-72 z-50">
              <button
                onClick={() => setCurrentPodcast(null)}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
              >
                <svg 
                  className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Back to Generator</span>
              </button>
            </div>

            {/* Podcast Player */}
            <div className="w-full max-w-5xl">
              <Feed 
                podcasts={[currentPodcast]} 
                onAddToMyPodcasts={handleAddToMyPodcasts}
              />
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-2rem)] flex items-center justify-center px-8">
            <div className="w-full max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl min-h-[600px]">
                {/* Decorative Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-pink-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Content */}
                <div className="relative p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <SparklesIcon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Create AI Podcast
                  </h2>
                  
                  <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Enter your topic or idea, and our AI will generate an engaging podcast just for you.
                  </p>

                  {/* Direct Prompt Input */}
                  <div className="max-w-xl mx-auto mb-10">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && topic.trim() && !isGenerating) {
                              handleGenerate();
                            }
                          }}
                          placeholder="What's your podcast about? (e.g. 'Mind-blowing space facts')"
                          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full text-white placeholder-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                        />
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={!topic || isGenerating}
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          !topic || isGenerating
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        } transition-all duration-200`}
                        title="Generate Podcast"
                      >
                        {isGenerating ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <SparklesIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {isGenerating && (
                      <div className="mt-4">
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${(progress.step / 3) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-white/60 mt-2 text-center">{progress.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-6 mt-12 text-left max-w-3xl mx-auto">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-medium mb-3 text-purple-400">Smart AI</h3>
                      <p className="text-base text-gray-400">Using advanced AI technology to create high-quality content</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-medium mb-3 text-pink-400">Diverse Topics</h3>
                      <p className="text-base text-gray-400">Thousands of topics from tech and business to lifestyle</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-medium mb-3 text-blue-400">Community Sharing</h3>
                      <p className="text-base text-gray-400">Share your podcasts and connect with listeners worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AuthProvider>
  )
}

export default App
