import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Feed from './components/Feed'
import PodcastGenerator from './components/PodcastGenerator'
import { PlusIcon } from '@heroicons/react/24/solid'
import './App.css'

function App() {
  const [podcasts, setPodcasts] = useState([])
  const [showGenerator, setShowGenerator] = useState(false)

  const handlePodcastGenerated = (newPodcast) => {
    setPodcasts(prev => [...prev, newPodcast])
    setShowGenerator(false)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">PodcastAI</h1>
          <button 
            onClick={() => setShowGenerator(true)}
            className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="h-full">
        {podcasts.length > 0 ? (
          <Feed podcasts={podcasts} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Welcome to PodcastAI</h2>
              <p className="text-white/60 max-w-md">
                Create your first AI-powered podcast by clicking the plus button above.
                Choose a topic, and we'll generate an engaging podcast for you.
              </p>
              <button
                onClick={() => setShowGenerator(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-medium transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First Podcast
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Podcast Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <PodcastGenerator 
            onPodcastGenerated={handlePodcastGenerated}
            onClose={() => setShowGenerator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
