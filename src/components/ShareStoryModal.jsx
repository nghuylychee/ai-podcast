import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareIcon, ArrowLeftIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ShareStoryModal = ({ isVisible, onClose, audioUrl, duration, podcastTitle, podcastTopic }) => {
  const [step, setStep] = useState('preview'); // preview, share
  const [videoBlob, setVideoBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [renderedVideo, setRenderedVideo] = useState(null);
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

  const drawPodcastInfo = (ctx, width, height) => {
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(podcastTitle, width/2, height * 0.25);
    
    // Draw topic
    ctx.font = '32px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(podcastTopic, width/2, height * 0.3);
  };

  const drawAudioVisualizer = (ctx, width, height) => {
    // Bỏ phần visualizer animation
    return;
  };

  const drawCTA = (ctx, width, height) => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Listen to more podcasts', width/2, height * 0.8);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('@PodcastAI', width/2, height * 0.85);
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

      // Kiểm tra audioUrl
      if (!audioUrl) {
        throw new Error('Audio URL không hợp lệ');
      }
      console.log('Audio URL:', audioUrl);

      // Kiểm tra duration
      if (!duration || duration <= 0) {
        throw new Error('Duration không hợp lệ');
      }
      console.log('Duration:', duration);

      // Tạo canvas mới nếu chưa có
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        // Giảm kích thước canvas xuống 1/5
        canvas.width = 216; // 1080/5
        canvas.height = 384; // 1920/5
        canvasRef.current = canvas;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      setProcessingStatus('Đang tải audio...');
      
      // Tạo audio element mới
      const audioElement = new Audio();
      audioElement.crossOrigin = 'anonymous';
      
      // Thêm xử lý lỗi CORS
      try {
        // Thử fetch audio file
        console.log('Bắt đầu fetch audio...');
        const response = await fetch(audioUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'audio/webm,audio/mp3,audio/*;q=0.9,*/*;q=0.8'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Fetch audio thành công, đang tạo blob...');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        audioElement.src = blobUrl;
      } catch (fetchError) {
        console.error('Fetch audio thất bại:', fetchError);
        console.log('Thử tải audio trực tiếp...');
        audioElement.src = audioUrl;
      }

      // Đợi audio load xong
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          audioElement.removeEventListener('canplaythrough', handleCanPlay);
          audioElement.removeEventListener('error', handleError);
          reject(new Error('Audio load timeout'));
        }, 10000);

        const handleCanPlay = () => {
          clearTimeout(timeout);
          audioElement.removeEventListener('error', handleError);
          console.log('Audio load thành công');
          resolve();
        };

        const handleError = (e) => {
          clearTimeout(timeout);
          audioElement.removeEventListener('canplaythrough', handleCanPlay);
          console.error('Audio load thất bại:', e);
          reject(new Error('Audio load failed'));
        };

        audioElement.addEventListener('canplaythrough', handleCanPlay);
        audioElement.addEventListener('error', handleError);
        audioElement.load();
      });

      // Lưu audio element để cleanup sau
      audioElementRef.current = audioElement;
      setActiveAudioElements(prev => [...prev, audioElement]);

      // Setup MediaRecorder với audio track
      const stream = canvas.captureStream(15); // Giảm frame rate xuống 15fps
      const audioStream = audioElement.captureStream();
      audioStream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 1000000 // Giảm bitrate xuống 1Mbps
      });

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setRenderedVideo(blob);
        setProcessingStatus('Hoàn thành!');
        setProgress(100);
        setIsProcessing(false);
      };

      // Load assets
      const logo = new Image();
      logo.src = '/logo.png';
      await new Promise(resolve => { logo.onload = resolve; });

      // Start recording
      mediaRecorderRef.current.start();
      
      // Draw frames
      const startTime = Date.now();
      const drawFrame = () => {
        const currentTime = Date.now() - startTime;
        const progress = Math.min(currentTime / (duration * 1000), 1);
        setProgress(progress * 100);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2a2a2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw logo
        const logoSize = canvas.width * 0.2;
        ctx.drawImage(logo, canvas.width - logoSize - 20, 20, logoSize, logoSize);

        // Draw podcast info
        drawPodcastInfo(ctx, canvas.width, canvas.height);

        // Draw CTA at the end
        if (progress > 0.9) {
          drawCTA(ctx, canvas.width, canvas.height);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(drawFrame);
        } else {
          mediaRecorderRef.current.stop();
        }
      };

      // Start drawing và phát audio (muted)
      audioElement.muted = true; // Tắt âm thanh trong quá trình render
      audioElement.play();
      drawFrame();

      // Đợi render xong thì bật lại âm thanh cho preview
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setRenderedVideo(blob);
        setProcessingStatus('Hoàn thành!');
        setProgress(100);
        setIsProcessing(false);
        audioElement.muted = false; // Bật lại âm thanh cho preview
      };

    } catch (error) {
      console.error('Error creating story:', error);
      cleanupRenderProcess();
      throw error;
    }
  };

  useEffect(() => {
    if (isVisible) {
      createStoryVideo(); // Bắt đầu render ngay khi mở modal
    }
  }, [isVisible]);

  const handlePlatformSelect = async (platform) => {
    if (!videoBlob) return;
    
    try {
      // Tạo file từ blob
      const file = new File([videoBlob], `${podcastTitle.replace(/\s+/g, '-').toLowerCase()}-story.mp4`, {
        type: 'video/mp4'
      });

      // Tự động tải video về máy trước
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${podcastTitle.replace(/\s+/g, '-').toLowerCase()}-story.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Mở app tương ứng
      switch (platform.id) {
        case 'instagram':
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Tạo URL scheme cho Instagram
            const instagramUrl = `instagram-stories://share?source_application=podcastai`;
            window.location.href = instagramUrl;
          } else {
            // Mở Instagram trên web
            window.open('https://www.instagram.com/stories/create', '_blank');
          }
          break;

        case 'facebook':
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Tạo URL scheme cho Facebook
            const facebookUrl = `fb://publish/?text=${encodeURIComponent(podcastTitle)}`;
            window.location.href = facebookUrl;
          } else {
            // Mở Facebook trên web
            window.open('https://www.facebook.com/stories/create', '_blank');
          }
          break;

        case 'tiktok':
          if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            // Tạo URL scheme cho TikTok
            const tiktokUrl = `snssdk1233://`;
            window.location.href = tiktokUrl;
          } else {
            // Mở TikTok trên web
            window.open('https://www.tiktok.com/upload', '_blank');
          }
          break;
      }

    } catch (err) {
      console.error('Lỗi khi share:', err);
      alert('Không thể share trực tiếp. Vui lòng tải video về và share thủ công.');
    }
  };

  const downloadVideo = () => {
    if (!videoBlob) return;
    
    try {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${podcastTitle.replace(/\s+/g, '-').toLowerCase()}-story.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi khi tải video:', err);
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
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
      } else {
        if (!audioElementRef.current) {
          const audio = new Audio(audioUrl);
          audio.currentTime = videoRef.current.currentTime;
          audioElementRef.current = audio;
        }
        audioElementRef.current.play();
        videoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const handlePreviewTimeUpdate = () => {
    if (videoRef.current && audioElementRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      // Đồng bộ thời gian giữa video và audio
      audioElementRef.current.currentTime = videoRef.current.currentTime;
    }
  };

  const handlePreviewEnded = () => {
    setIsPreviewPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'preview':
        return (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="relative aspect-[9/16] bg-black/20 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-300 text-sm">Rendering story...</p>
                    <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</p>
                  </div>
                </div>
              </div>
            ) : videoBlob ? (
              <div className="relative aspect-[9/16] bg-black/20 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  onClick={handlePreviewPlay}
                  onTimeUpdate={handlePreviewTimeUpdate}
                  onEnded={handlePreviewEnded}
                />
                {!isPreviewPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePreviewPlay}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  disabled={isProcessing || !videoBlob}
                  className={`${platform.color} p-2 rounded-lg flex flex-col items-center justify-center space-y-1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="text-white text-xs">{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadVideo}
                disabled={isProcessing || !videoBlob}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors ${
                  (isProcessing || !videoBlob) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="text-sm">Save Video</span>
              </button>
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

            <div className="relative aspect-[9/16] bg-black/20 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                src={previewUrl}
                className="w-full h-full object-cover"
                onClick={handlePreviewPlay}
                onTimeUpdate={handlePreviewTimeUpdate}
                onEnded={handlePreviewEnded}
              />
              {!isPreviewPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={handlePreviewPlay}
                    className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handlePlatformSelect}
              className={`w-full py-3 ${selectedPlatform?.color} rounded-lg flex items-center justify-center space-x-2`}
            >
              <span className="text-2xl">{selectedPlatform?.icon}</span>
              <span className="text-white">Chia sẻ ngay</span>
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
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xs mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Share Podcast Story</h3>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>

            {/* Content */}
            <div className="p-2 space-y-2">
              {renderStep()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareStoryModal; 