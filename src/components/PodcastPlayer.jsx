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
  VideoCameraIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  HeartIcon
} from '@heroicons/react/24/solid';
import StoryRecorder from './StoryRecorder';
import ShareStoryModal from './ShareStoryModal';

const PodcastPlayer = ({ podcast, onNext, onPrevious, onAddToMyPodcasts }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume 70%
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [isAddedToMyPodcasts, setIsAddedToMyPodcasts] = useState(false);
  const soundRef = useRef(null);
  const progressInterval = useRef(null);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const isDraggingProgress = useRef(false);
  const isDraggingVolume = useRef(false);
  const videoCanvasRef = useRef(null);

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

  const handleSaveVideo = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = `${podcast.title.replace(/\s+/g, '-').toLowerCase()}-story.mp4`;
    a.click();
    URL.revokeObjectURL(url);
    setShowRecorder(false);
  };

  const saveAsVideo = async () => {
    if (!soundRef.current || isSavingVideo) return;
    
    try {
      setIsSavingVideo(true);

      // Tạo canvas cho video
      const canvas = document.createElement('canvas');
      canvas.width = 1080; // Width cho video dọc
      canvas.height = 1920; // Height cho video dọc (9:16 ratio)
      const ctx = canvas.getContext('2d');

      // Setup MediaRecorder
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = `${podcast.title.replace(/\s+/g, '-').toLowerCase()}-podcast.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        setIsSavingVideo(false);
      };

      // Setup audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const audio = new Audio(podcast.audio_url);
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Load assets
      const logo = new Image();
      logo.src = '/logo.png';
      await new Promise(resolve => { logo.onload = resolve; });

      const drawFrame = () => {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw logo
        const logoSize = canvas.width * 0.2;
        ctx.drawImage(logo, canvas.width - logoSize - 20, 20, logoSize, logoSize);

        // Draw podcast info
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Title
        ctx.font = 'bold 48px Arial';
        ctx.fillText(podcast.title, canvas.width/2, canvas.height * 0.25);
        
        // Topic
        ctx.font = '32px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(podcast.topic, canvas.width/2, canvas.height * 0.3);

        // Draw audio visualizer
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (canvas.width * 0.8) / bufferLength;
        const barSpacing = 2;
        const maxBarHeight = canvas.height * 0.15;
        const startX = canvas.width * 0.1;
        const startY = canvas.height * 0.5;

        ctx.fillStyle = '#4F46E5';
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * maxBarHeight;
          const x = startX + i * (barWidth + barSpacing);
          ctx.fillRect(x, startY - barHeight/2, barWidth, barHeight);
        }

        if (!mediaRecorder.state.match(/inactive/)) {
          requestAnimationFrame(drawFrame);
        }
      };

      // Start recording
      mediaRecorder.start();
      audio.play();
      drawFrame();

      // Stop when audio ends
      audio.onended = () => {
        mediaRecorder.stop();
        audio.pause();
        audio.currentTime = 0;
      };

    } catch (err) {
      console.error('Lỗi khi tạo video:', err);
      setIsSavingVideo(false);
    }
  };

  const handleAddToMyPodcasts = () => {
    setIsAddedToMyPodcasts(true);
    onAddToMyPodcasts(podcast);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-pink-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative space-y-6">
          {/* Title and description */}
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {podcast.title}
            </h2>
            <p className="text-lg text-gray-300 mt-2">{podcast.topic}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
              <button 
                onClick={retryLoading}
                className="ml-2 text-purple-400 hover:text-purple-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div 
              className="relative h-2 bg-white/5 rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div 
                className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(soundRef.current?.duration() || 0)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button 
              onClick={toggleMute}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-6 w-6" />
              ) : (
                <SpeakerWaveIcon className="h-6 w-6" />
              )}
            </button>

            <button 
              onClick={togglePlayPause}
              disabled={isLoading}
              className={`p-4 rounded-full ${
                isLoading 
                  ? 'bg-white/10 cursor-wait' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              } transition-all duration-200`}
            >
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              ) : isPlaying ? (
                <PauseIcon className="h-8 w-8 text-white" />
              ) : (
                <PlayIcon className="h-8 w-8 text-white" />
              )}
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToMyPodcasts}
                disabled={isAddedToMyPodcasts}
                className={`p-2 rounded-full transition-colors ${
                  isAddedToMyPodcasts 
                    ? 'text-pink-500' 
                    : 'text-gray-400 hover:text-pink-500'
                }`}
                title={isAddedToMyPodcasts ? 'Added to My Podcasts' : 'Add to My Podcasts'}
              >
                <HeartIcon className="h-6 w-6" />
              </button>
              
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Share Podcast"
              >
                <ShareIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Volume slider (only show when hovering speaker icon) */}
          <AnimatePresence>
            {showVolumeControl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10"
              >
                <div 
                  className="relative w-24 h-2 bg-white/10 rounded-full cursor-pointer"
                  onClick={handleVolumeChange}
                >
                  <div 
                    className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer; 