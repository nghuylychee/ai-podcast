import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Feed from './components/Feed'
import PodcastGenerator from './components/PodcastGenerator'
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/solid'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'

function App() {
  const [podcasts, setPodcasts] = useState([])
  const [showGenerator, setShowGenerator] = useState(false)

  const handlePodcastGenerated = (newPodcast) => {
    setPodcasts(prev => [...prev, newPodcast])
    setShowGenerator(false)
  }

  return (
    <AuthProvider>
      <Layout>
        {podcasts.length > 0 ? (
          <Feed podcasts={podcasts} />
        ) : (
          <div className="h-[calc(100vh-2rem)] flex items-center justify-center px-8">
            <div className="w-full max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
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
                  
                  <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                    Choose a topic you're interested in, and our AI will generate an engaging podcast just for you.
                  </p>

                  <button
                    onClick={() => setShowGenerator(true)}
                    className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <PlusIcon className="w-6 h-6 mr-2" />
                    <span>Create Now</span>
                  </button>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-8 mt-16 text-left max-w-5xl mx-auto">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-medium mb-3 text-purple-400">Smart AI</h3>
                      <p className="text-base text-gray-400">Using advanced AI technology to create high-quality content</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <h3 className="text-lg font-medium mb-3 text-pink-400">Diverse Topics</h3>
                      <p className="text-base text-gray-400">Thousands of topics from tech and business to lifestyle</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Podcast Generator Modal */}
        <AnimatePresence>
          {showGenerator && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="w-full max-w-4xl mx-4">
                <PodcastGenerator 
                  onPodcastGenerated={handlePodcastGenerated}
                  onClose={() => setShowGenerator(false)}
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </Layout>
    </AuthProvider>
  )
}

export default App
