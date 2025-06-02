import { useState } from 'react';
import AuthButton from './AuthButton';
import Feed from './Feed';
import { HeartIcon, HomeIcon, BookmarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Layout = ({ children, myPodcasts = [] }) => {
  const [showMyPodcasts, setShowMyPodcasts] = useState(false);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-3xl text-white">
      {/* Auth Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <AuthButton />
      </div>

      {/* Main Container */}
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 z-40">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              PodcastAI
            </h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setShowMyPodcasts(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full text-left transition-colors ${
                !showMyPodcasts 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => setShowMyPodcasts(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg w-full text-left transition-colors ${
                showMyPodcasts 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-5 h-5" />
                  <span>My Podcasts</span>
                </div>
                {myPodcasts.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">
                    {myPodcasts.length}
                  </span>
                )}
              </div>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg w-full text-left text-gray-400 hover:bg-white/5 transition-colors">
              <BookmarkIcon className="w-5 h-5" />
              <span>Saved</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg w-full text-left text-gray-400 hover:bg-white/5 transition-colors">
              <Cog6ToothIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10">
              <h3 className="font-medium mb-1">Pro Account</h3>
              <p className="text-sm text-gray-400 mb-3">Upgrade to unlock more features</p>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          <div className="h-full p-8 pr-20">
            {showMyPodcasts ? (
              <div className="min-h-screen">
                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  My Podcasts
                </h2>
                {myPodcasts.length > 0 ? (
                  <Feed podcasts={myPodcasts} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <HeartIcon className="w-16 h-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-300 mb-2">No podcasts yet</h3>
                    <p className="text-gray-400 text-center max-w-md">
                      Generate a podcast and click the heart icon to add it to your collection
                    </p>
                  </div>
                )}
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 