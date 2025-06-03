import { useState } from 'react';
import PodcastPlayer from './PodcastPlayer';

const Feed = ({ podcasts, onAddToMyPodcasts }) => {
  const [currentIndex] = useState(0);

  if (!podcasts.length) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-gray-400">
        <p className="text-xl">No podcasts yet</p>
        <p className="text-sm mt-2">Generate a new podcast or add some to your collection</p>
      </div>
    </div>
  );

  const currentPodcast = podcasts[currentIndex];

  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <PodcastPlayer
          podcast={currentPodcast}
          onAddToMyPodcasts={onAddToMyPodcasts}
        />
      </div>
    </div>
  );
};

export default Feed; 