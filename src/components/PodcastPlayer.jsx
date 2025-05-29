import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  SpeakerWaveIcon as VolumeHighIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/solid';

const PodcastPlayer = ({ podcast, onNext, onPrevious }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume 70%
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const soundRef = useRef(null);
  const progressInterval = useRef(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isDraggingProgress = useRef(false);
  const isDraggingVolume = useRef(false);

  const initializeAudio = async () => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      soundRef.current = new Howl({
        src: [podcast.audio_url],
        html5: true,
        format: ['mp3'],
        autoplay: false,
        preload: true,
        volume: volume,
        pool: 1,
        onload: () => {
          setIsLoading(false);
          setError(null);
          retryCount.current = 0;
        },
        onloaderror: async (id, err) => {
          console.error('Audio loading error:', err);
          
          if (retryCount.current < MAX_RETRIES) {
            console.log(`Retrying audio load (${retryCount.current + 1}/${MAX_RETRIES})...`);
            retryCount.current++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            initializeAudio();
          } else {
            setError('Failed to load audio. Please try again.');
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
            setError('Failed to play audio. Please try again.');
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

  return (
    <div className="podcast-card" style={{ backgroundImage: `url(${podcast.background_img})` }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="podcast-title">{podcast.title}</h2>
        <span className="podcast-topic">{podcast.topic}</span>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {error ? (
          <div className="text-center mb-8">
            <div className="text-red-500 bg-red-500/10 p-2 rounded mb-2">
              {error}
            </div>
            <button 
              onClick={retryLoading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              <div className="controls flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={onPrevious} className="control-button" disabled={isLoading}>
                    <BackwardIcon className="w-6 h-6 text-white" />
                  </button>
                  
                  <button 
                    onClick={togglePlayPause} 
                    className="control-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                      <PauseIcon className="w-6 h-6 text-white" />
                    ) : (
                      <PlayIcon className="w-6 h-6 text-white" />
                    )}
                  </button>
                  
                  <button onClick={onNext} className="control-button" disabled={isLoading}>
                    <ForwardIcon className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleMute}
                    className="control-button"
                    disabled={isLoading}
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                    ) : (
                      <VolumeHighIcon className="w-6 h-6 text-white" />
                    )}
                  </button>

                  <div 
                    ref={volumeBarRef}
                    className="w-20 h-1 bg-white/20 rounded-full cursor-pointer group"
                    onClick={(e) => {
                      const rect = volumeBarRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const newVolume = Math.max(0, Math.min(1, x / rect.width));
                      setVolume(newVolume);
                      soundRef.current?.volume(newVolume);
                    }}
                    onMouseDown={(e) => {
                      isDraggingVolume.current = true;
                      handleVolumeDrag(e);
                    }}
                  >
                    <div 
                      className="h-full bg-white rounded-full relative"
                      style={{ width: `${volume * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>

              <div 
                ref={progressBarRef}
                className="w-full bg-white/20 h-2 rounded-full overflow-hidden cursor-pointer group"
                onClick={handleProgressClick}
                onMouseDown={(e) => {
                  isDraggingProgress.current = true;
                  handleProgressDrag(e);
                }}
              >
                <div 
                  className="h-full bg-white transition-all duration-100 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PodcastPlayer; 