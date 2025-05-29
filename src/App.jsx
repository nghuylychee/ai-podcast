import { useState } from 'react'
import Feed from './components/Feed'
import PodcastGenerator from './components/PodcastGenerator'
import './App.css'

function App() {
  const [podcasts, setPodcasts] = useState([])
  const [showGenerator, setShowGenerator] = useState(true)

  const handlePodcastGenerated = (newPodcast) => {
    setPodcasts(prev => [...prev, newPodcast])
    setShowGenerator(false) // Hide generator after successful generation
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {showGenerator ? (
        <div className="h-full flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <PodcastGenerator onPodcastGenerated={handlePodcastGenerated} />
          </div>
        </div>
      ) : (
        <>
          <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">PodcastAI</h1>
              <button 
                onClick={() => setShowGenerator(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                Generate New Podcast
              </button>
            </div>
          </header>
          
          <main className="h-full">
            {podcasts.length > 0 ? (
              <Feed podcasts={podcasts} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60">No podcasts yet. Generate your first one!</p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}

export default App
