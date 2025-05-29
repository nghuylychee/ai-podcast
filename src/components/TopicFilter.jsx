import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/solid';

const TopicFilter = ({ topics, selectedTopic, onSelectTopic, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuVariants = {
    open: { 
      opacity: 1,
      y: 0,
      pointerEvents: "auto",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      opacity: 0,
      y: -20,
      pointerEvents: "none",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const handleTopicSelect = (topic) => {
    onSelectTopic(topic === selectedTopic ? null : topic);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-colors"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <AdjustmentsHorizontalIcon className="w-6 h-6 text-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-16 right-0 bg-white/10 backdrop-blur-lg rounded-lg p-2 w-48 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicSelect(topic)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    topic === selectedTopic
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {topic}
                  {topic === selectedTopic && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 right-0 bg-white/10 backdrop-blur-lg rounded-lg px-3 py-1 text-sm text-white"
        >
          Current: {selectedTopic}
        </motion.div>
      )}
    </div>
  );
};

export default TopicFilter; 