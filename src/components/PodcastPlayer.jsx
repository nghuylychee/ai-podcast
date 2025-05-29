import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  SpeakerWaveIcon as VolumeHighIcon,
  MinusIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

const PodcastPlayer = ({ podcast, onNext, onPrevious }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume 70%
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const soundRef = useRef(null);
  const progressInterval = useRef(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isDraggingProgress = useRef(false);
  const isDraggingVolume = useRef(false);

  // Find current segment based on currentTime
  const getCurrentSegment = () => {
    if (!podcast.segments) return null;
    return podcast.segments.find(segment => 
      currentTime >= segment.start && currentTime <= segment.end
    );
  };

  const initializeAudio = async () => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setCurrentTime(0);

    try {
      // Check if it's a blob URL
      const isBlob = podcast.audio_url.startsWith('blob:');
      
      if (!isBlob) {
        // Only do preflight check for non-blob URLs
        try {
          const response = await fetch(podcast.audio_url, { 
            method: 'HEAD',
            mode: 'cors',
            credentials: 'omit'
          });
          if (!response.ok) {
            throw new Error(`Audio file not accessible: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          console.error('Preflight check failed:', err);
          // Continue anyway as Howler might still be able to load it
        }
      }

      soundRef.current = new Howl({
        src: [podcast.audio_url],
        html5: true,
        format: ['mp3', 'wav'],
        autoplay: false,
        preload: true,
        volume: volume,
        pool: 1,
        xhr: {
          method: 'GET',
          withCredentials: false,
          headers: {
            'Range': 'bytes=0-',
            'Origin': window.location.origin
          }
        },
        onload: () => {
          console.log('Audio loaded successfully');
          setIsLoading(false);
          setError(null);
          retryCount.current = 0;
        },
        onloaderror: async (id, err) => {
          console.error('Audio loading error:', err);
          console.log('Audio URL:', podcast.audio_url);
          
          if (retryCount.current < MAX_RETRIES) {
            console.log(`Retrying audio load (${retryCount.current + 1}/${MAX_RETRIES})...`);
            retryCount.current++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            initializeAudio();
          } else {
            let errorMessage = 'Failed to load audio';
            if (isBlob) {
              errorMessage += ': The temporary audio file may have expired. Please regenerate the podcast.';
            } else {
              errorMessage += `: ${err || 'Unknown error'}`;
            }
            setError(errorMessage);
            setIsLoading(false);
            retryCount.current = 0;
          }
        },
        onplayerror: (id, err) => {
          console.error('Audio playback error:', err);
          if (retryCount.current < MAX_RETRIES) {
            console.log(`Retrying playback (${retryCount.current + 1}/${MAX_RETRIES})...`);
            retryCount.current++;
            setError('Click play to start audio playback');
            setIsLoading(false);
          } else {
            setError(`Failed to play audio: ${err || 'Unknown error'}`);
            setIsLoading(false);
            retryCount.current = 0;
          }
        },
        onplay: () => {
          setIsPlaying(true);
          startProgressTracking();
        },
        onpause: () => {
          setIsPlaying(false);
          stopProgressTracking();
        },
        onend: () => {
          setIsPlaying(false);
          stopProgressTracking();
          onNext();
        },
        onstop: () => {
          setIsPlaying(false);
          stopProgressTracking();
        },
        onmute: () => {
          setIsMuted(true);
        },
        onunmute: () => {
          setIsMuted(false);
        },
        onvolume: () => {
          if (soundRef.current) {
            setVolume(soundRef.current.volume());
          }
        }
      });

    } catch (err) {
      console.error('Player initialization error:', err);
      setError(`Error loading audio: ${err.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      stopProgressTracking();
      retryCount.current = 0;
    };
  }, [podcast]);

  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const startProgressTracking = () => {
    if (progressInterval.current) return;
    
    progressInterval.current = setInterval(() => {
      if (soundRef.current && soundRef.current.playing()) {
        try {
          const seek = soundRef.current.seek() || 0;
          const duration = soundRef.current.duration() || 1;
          const progress = (seek / duration) * 100;
          setProgress(Math.min(progress, 100));
          setCurrentTime(seek);
        } catch (err) {
          console.error('Progress tracking error:', err);
        }
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const togglePlayPause = () => {
    if (!soundRef.current || isLoading) return;
    
    try {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    } catch (err) {
      console.error('Playback toggle error:', err);
      setError('Playback control error. Please try again.');
    }
  };

  const toggleMute = () => {
    if (!soundRef.current || isLoading) return;
    
    try {
      const newMuteState = !isMuted;
      soundRef.current.mute(newMuteState);
      setIsMuted(newMuteState);
    } catch (err) {
      console.error('Mute toggle error:', err);
      setError('Audio control error. Please try again.');
    }
  };

  const handleVolumeChange = (delta) => {
    if (!soundRef.current || isLoading) return;
    
    try {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);
      soundRef.current.volume(newVolume);
    } catch (err) {
      console.error('Volume change error:', err);
      setError('Volume control error. Please try again.');
    }
  };

  const handleProgressClick = (e) => {
    if (!soundRef.current || isLoading) return;

    try {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const duration = soundRef.current.duration();
      const newPosition = duration * percentage;
      
      soundRef.current.seek(newPosition);
      setProgress(percentage * 100);
      setCurrentTime(newPosition);
    } catch (err) {
      console.error('Seek error:', err);
      setError('Playback control error. Please try again.');
    }
  };

  const retryLoading = () => {
    retryCount.current = 0;
    initializeAudio();
  };

  const handleProgressDrag = (e) => {
    if (!soundRef.current || isLoading || !isDraggingProgress.current) return;

    try {
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      
      setProgress(percentage * 100);
      
      // Only update audio position when mouse is released
      if (e.type === 'mouseup' || e.type === 'mouseleave') {
        const duration = soundRef.current.duration();
        const newPosition = duration * percentage;
        soundRef.current.seek(newPosition);
        isDraggingProgress.current = false;
      }
    } catch (err) {
      console.error('Progress drag error:', err);
      setError('Playback control error. Please try again.');
    }
  };

  const handleVolumeDrag = (e) => {
    if (!soundRef.current || isLoading || !isDraggingVolume.current) return;

    try {
      const volumeBar = volumeBarRef.current;
      const rect = volumeBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newVolume = x / rect.width;
      
      setVolume(newVolume);
      soundRef.current.volume(newVolume);
      
      if (e.type === 'mouseup' || e.type === 'mouseleave') {
        isDraggingVolume.current = false;
      }
    } catch (err) {
      console.error('Volume drag error:', err);
      setError('Volume control error. Please try again.');
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingProgress.current) {
        handleProgressDrag(e);
      }
      if (isDraggingVolume.current) {
        handleVolumeDrag(e);
      }
    };

    const handleMouseUp = (e) => {
      if (isDraggingProgress.current) {
        handleProgressDrag(e);
      }
      if (isDraggingVolume.current) {
        handleVolumeDrag(e);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Title and description */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{podcast.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{podcast.topic}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-center p-4">
            {error}
            <button 
              onClick={retryLoading}
              className="ml-2 text-blue-500 hover:text-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
          onClick={handleProgressClick}
          onMouseDown={(e) => handleProgressDrag(e)}
        >
          <div 
            className="absolute h-full bg-blue-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(soundRef.current?.duration() || 0)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button 
            onClick={onPrevious}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <BackwardIcon className="h-8 w-8" />
          </button>

          <button 
            onClick={togglePlayPause}
            disabled={isLoading}
            className={`p-3 rounded-full ${
              isLoading 
                ? 'bg-gray-300 dark:bg-gray-700 cursor-wait' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-400 dark:border-gray-600 border-t-transparent" />
            ) : isPlaying ? (
              <PauseIcon className="h-8 w-8 text-white" />
            ) : (
              <PlayIcon className="h-8 w-8 text-white" />
            )}
          </button>

          <button 
            onClick={onNext}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <ForwardIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center justify-center space-x-2">
          <button 
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeControl(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            {isMuted ? (
              <SpeakerXMarkIcon className="h-6 w-6" />
            ) : volume > 0.5 ? (
              <VolumeHighIcon className="h-6 w-6" />
            ) : (
              <SpeakerWaveIcon className="h-6 w-6" />
            )}
          </button>

          <AnimatePresence>
            {showVolumeControl && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center space-x-2"
                onMouseLeave={() => setShowVolumeControl(false)}
              >
                <button 
                  onClick={() => handleVolumeChange(-0.1)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>

                <div 
                  ref={volumeBarRef}
                  className="relative w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
                  onClick={(e) => handleVolumeDrag(e)}
                  onMouseDown={(e) => handleVolumeDrag(e)}
                >
                  <div 
                    className="absolute h-full bg-blue-500 rounded"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>

                <button 
                  onClick={() => handleVolumeChange(0.1)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transcript toggle button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>{showTranscript ? 'Hide Transcript' : 'Show Transcript'}</span>
          </button>
        </div>

        {/* Transcript display */}
        <AnimatePresence>
          {showTranscript && podcast.segments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 max-h-60 overflow-y-auto"
            >
              {podcast.segments.map((segment, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    currentTime >= segment.start && currentTime <= segment.end
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {segment.text}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PodcastPlayer; 