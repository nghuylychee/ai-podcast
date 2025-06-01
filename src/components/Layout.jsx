import AuthButton from './AuthButton';

const Layout = ({ children }) => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-3xl text-white">
      {/* Auth Button - Fixed top right */}
      <div className="fixed top-4 right-4 z-50">
        <AuthButton />
      </div>

      {/* Main Container */}
      <div className="h-full flex">
        {/* Sidebar */}
        <aside className="w-64 h-full bg-black/20 backdrop-blur-sm border-r border-white/10">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              PodcastAI
            </h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <a href="#" className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>My Podcasts</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Saved</span>
            </a>
            <a href="#" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Settings</span>
            </a>
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
        <main className="flex-1">
          <div className="h-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 