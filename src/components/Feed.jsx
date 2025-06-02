import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PodcastPlayer from './PodcastPlayer';

const Feed = ({ podcasts, onAddToMyPodcasts }) => {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    if (podcasts.length <= 1) return;
    
    setCurrentIndex(([prevIndex, prevDirection]) => {
      let nextIndex = prevIndex + newDirection;
      
      // Handle wrapping
      if (nextIndex < 0) nextIndex = podcasts.length - 1;
      if (nextIndex >= podcasts.length) nextIndex = 0;
      
      return [nextIndex, newDirection];
    });
  };

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
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full max-w-2xl px-4"
        >
          <PodcastPlayer
            podcast={currentPodcast}
            onAddToMyPodcasts={onAddToMyPodcasts}
          />
        </motion.div>
      </AnimatePresence>

      {podcasts.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 text-sm text-white/60">
          <span>Swipe left for next</span>
          <span>•</span>
          <span>Swipe right for previous</span>
        </div>
      )}
    </div>
  );
};

export default Feed; 