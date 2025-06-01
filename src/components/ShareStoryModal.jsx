import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const ShareStoryModal = ({ isVisible, onClose, audioUrl, duration, podcastTitle, podcastTopic }) => {
  const [step, setStep] = useState('preview'); // preview, edit, share
  const [videoBlob, setVideoBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const logoRef = useRef(null);
  const playerImageRef = useRef(null);
  const videoRef = useRef(null);
  const audioElementRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [activeAudioElements, setActiveAudioElements] = useState([]);

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      color: 'bg-black'
    }
  ];

  useEffect(() => {
    const loadAssets = async () => {
      const logo = new Image();
      logo.src = '/logo.png';
      await new Promise(resolve => {
        logo.onload = resolve;
      });
      logoRef.current = logo;

      const playerImg = new Image();
      playerImg.src = '/player-bg.png';
      await new Promise(resolve => {
        playerImg.onload = resolve;
      });
      playerImageRef.current = playerImg;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      drawPreview();
    };

    if (isVisible) {
      loadAssets();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isVisible]);

  useEffect(() => {
    // Cleanup preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (videoBlob) {
      // Create preview URL when video is ready
      const url = URL.createObjectURL(videoBlob);
      setPreviewUrl(url);
      
      // Cleanup old URL if exists
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoBlob]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw logo
    if (logoRef.current) {
      const logoSize = width * 0.2;
      ctx.drawImage(logoRef.current, width - logoSize - 20, 20, logoSize, logoSize);
    }

    // Draw player background
    if (playerImageRef.current) {
      const playerHeight = height * 0.3;
      const playerY = height * 0.35;
      ctx.drawImage(playerImageRef.current, 0, playerY, width, playerHeight);
    }

    // Draw podcast info with text wrapping
    const wrapText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Center text vertically based on number of lines
      const totalHeight = lines.length * lineHeight;
      let currentY = y - (totalHeight / 2);

      lines.forEach(line => {
        ctx.fillText(line.trim(), x, currentY);
        currentY += lineHeight;
      });
    };

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    wrapText(podcastTitle, width/2, height * 0.25, width * 0.8, 60);
    
    // Draw topic
    ctx.font = '32px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    wrapText(podcastTopic, width/2, height * 0.35, width * 0.8, 40);
  };

  // Cleanup all audio elements
  const cleanupAudio = () => {
    // Cleanup current audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }

    // Cleanup audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Cleanup all active audio elements
    activeAudioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.remove(); // Remove from DOM
      } catch (err) {
        console.log('Error cleaning up audio:', err);
      }
    });
    setActiveAudioElements([]);
  };

  // Cleanup render process
  const cleanupRenderProcess = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.log('MediaRecorder already stopped');
      }
      mediaRecorderRef.current = null;
    }

    cleanupAudio();

    setIsProcessing(false);
    setProgress(0);
    setProcessingStatus('');
  };

  // Full cleanup
  const cleanup = () => {
    cleanupRenderProcess();

    // Cleanup video preview
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.src = '';
    }

    // Reset states
    setVideoBlob(null);
    setSelectedPlatform(null);
    setIsPreviewPlaying(false);

    // Cleanup preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      cleanup();
    }
    return () => {
      cleanup();
      cleanupAudio(); // Extra cleanup for audio
    };
  }, [isVisible]);

  const createStoryVideo = async () => {
    try {
      cleanupRenderProcess();
      setIsProcessing(true);
      setProgress(0);
      setProcessingStatus('Đang chuẩn bị...');

      const canvas = canvasRef.current;
      const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
      const offCtx = offscreen.getContext('2d');
      
      setProcessingStatus('Đang tải audio...');
      const audioElement = new Audio();
      audioElement.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        audioElement.addEventListener('canplaythrough', resolve, { once: true });
        audioElement.addEventListener('error', reject, { once: true });
        audioElement.src = audioUrl;
        audioElement.load();
      });

      audioElementRef.current = audioElement;
      setActiveAudioElements(prev => [...prev, audioElement]);

      setProcessingStatus('Đang khởi tạo audio context...');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      setProcessingStatus('Đang chuẩn bị render video...');
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      let startTime = null;
      let lastProgressUpdate = 0;

      const drawFrame = (timestamp) => {
        if (!startTime) {
          startTime = timestamp;
          audioElement.play();
        }

        const elapsed = audioElement.currentTime;
        const progressPercent = Math.min((elapsed / duration) * 100, 100);
        
        // Chỉ update progress khi thay đổi đáng kể (tránh re-render quá nhiều)
        if (Math.abs(progressPercent - lastProgressUpdate) >= 1) {
          setProgress(progressPercent);
          lastProgressUpdate = progressPercent;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(offscreen, 0, 0);

        // Draw visualizer
        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;
          const visualizerHeight = height * 0.2;
          const startY = height * 0.5;
          
          ctx.beginPath();
          ctx.moveTo(0, startY);
          
          for (let i = 0; i < bufferLength; i++) {
            const x = (width * i) / bufferLength;
            const value = dataArray[i] / 255;
            const y = startY + Math.sin(i * 0.1 + elapsed * 0.002) * value * visualizerHeight;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          
          const gradient = ctx.createLinearGradient(0, startY - visualizerHeight, 0, startY + visualizerHeight);
          gradient.addColorStop(0, '#4F46E5');
          gradient.addColorStop(1, '#818CF8');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Add CTA at the end
        if (elapsed > (duration - 3)) {
          const fadeIn = Math.min((elapsed - (duration - 3)) / 3, 1);
          
          ctx.save();
          ctx.globalAlpha = fadeIn;
          
          ctx.fillStyle = 'rgba(0,0,0,0.8)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          if (logoRef.current) {
            const logoSize = canvas.width * 0.4;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2 - 100;
            ctx.drawImage(logoRef.current, logoX, logoY, logoSize, logoSize);
          }
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Try it on', canvas.width/2, canvas.height * 0.6);
          ctx.font = 'bold 64px Arial';
          ctx.fillText('Podcast AI', canvas.width/2, canvas.height * 0.7);
          
          ctx.restore();
        }

        if (elapsed < duration) {
          animationFrameRef.current = requestAnimationFrame(drawFrame);
        } else {
          // Khi render xong
          mediaRecorder.stop();
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setProgress(100);
          setProcessingStatus('Hoàn thành!');
          setIsProcessing(false);
        }
      };

      // Copy initial frame to offscreen canvas
      drawPreview();
      offCtx.drawImage(canvas, 0, 0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setProcessingStatus('Hoàn thành!');
        setProgress(100);
        setIsProcessing(false);
        
        // Cleanup render audio
        cleanupAudio();
      };

      setProcessingStatus('Bắt đầu ghi...');
      mediaRecorder.start();
      animationFrameRef.current = requestAnimationFrame(drawFrame);

    } catch (err) {
      console.error('Lỗi khi tạo video:', err);
      setProcessingStatus('Có lỗi xảy ra!');
      cleanupRenderProcess();
    }
  };

  useEffect(() => {
    if (isVisible) {
      createStoryVideo(); // Bắt đầu render ngay khi mở modal
    }
  }, [isVisible]);

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    createStoryVideo();
  };

  const handleShare = () => {
    if (!videoBlob) {
      // Bắt đầu render video nếu chưa có
      createStoryVideo();
    } else if (selectedPlatform) {
      // Xử lý share khi đã chọn platform
      shareToSocialMedia(selectedPlatform);
    }
  };

  const downloadVideo = () => {
    if (!videoBlob) return;
    
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podcastTitle.replace(/\s+/g, '-').toLowerCase()}-story.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareToSocialMedia = (platform) => {
    if (!videoBlob || !platform) return;

    // Tải video xuống trước khi share
    downloadVideo();

    // Mở app tương ứng
    switch (platform.id) {
      case 'instagram':
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = 'instagram://story-camera';
        } else {
          alert('Để chia sẻ lên Instagram Story:\n1. Tải video về máy\n2. Mở Instagram trên điện thoại\n3. Tạo story mới và chọn video vừa tải');
        }
        break;

      case 'facebook':
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = 'fb://story';
        } else {
          window.open('https://www.facebook.com/stories/create', '_blank');
        }
        break;

      case 'tiktok':
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = 'snssdk1233://';
        } else {
          window.open('https://www.tiktok.com/upload', '_blank');
        }
        break;
    }
  };

  const handleClose = () => {
    cleanup();
    cleanupAudio(); // Extra cleanup for audio
    onClose();
  };

  const handlePreviewPlay = () => {
    if (videoRef.current) {
      if (isPreviewPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const handlePreviewTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'preview':
        return (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full aspect-[9/16] bg-gray-900 rounded-lg"
            />
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  disabled={isProcessing}
                  className={`${platform.color} p-3 rounded-lg flex flex-col items-center justify-center space-y-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="text-white text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'share':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setStep('preview')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-semibold">Chia sẻ lên {selectedPlatform?.name}</h3>
            </div>

            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full aspect-[9/16] bg-gray-900 rounded-lg"
            />

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{processingStatus}</span>
                  <span className="text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={isProcessing}
              className={`w-full py-3 ${selectedPlatform?.color} rounded-lg flex items-center justify-center space-x-2`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-white">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">{selectedPlatform?.icon}</span>
                  <span className="text-white">Chia sẻ ngay</span>
                </>
              )}
            </button>

            <button
              onClick={downloadVideo}
              className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Tải video về máy
            </button>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ margin: 0 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {!isProcessing && videoBlob ? 'Chia sẻ Story' : 'Đang tạo Story...'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3">
          {!videoBlob && (
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              className="w-full aspect-[9/16] bg-gray-900 rounded-lg"
            />
          )}

          {videoBlob && (
            <div className="relative">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full aspect-[9/16] bg-gray-900 rounded-lg"
                onTimeUpdate={handlePreviewTimeUpdate}
                onEnded={handlePreviewEnded}
                playsInline
                controls
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">
                {isProcessing ? processingStatus : (isPreviewPlaying ? 'Đang phát' : 'Sẵn sàng chia sẻ')}
              </span>
              <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {videoBlob && !isProcessing && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => shareToSocialMedia(platform)}
                    className={`${platform.color} p-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-all duration-200
                      ${!isProcessing && videoBlob ? 'hover:opacity-90 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={isProcessing || !videoBlob}
                  >
                    <span className="text-xl text-white">{platform.icon}</span>
                    <span className="text-white text-xs">{platform.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={downloadVideo}
                disabled={isProcessing || !videoBlob}
                className={`w-full flex items-center justify-center text-sm py-2 transition-colors duration-200
                  ${!isProcessing && videoBlob 
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer' 
                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Tải về máy</span>
              </button>
            </div>
          )}

          {!videoBlob && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`${platform.color} p-2 rounded-lg flex flex-col items-center justify-center space-y-1 opacity-50 cursor-not-allowed`}
                  >
                    <span className="text-xl text-white">{platform.icon}</span>
                    <span className="text-white text-xs">{platform.name}</span>
                  </div>
                ))}
              </div>

              <div
                className="w-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm py-2 cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Tải về máy</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShareStoryModal; 