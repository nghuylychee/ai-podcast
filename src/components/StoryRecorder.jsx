import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@heroicons/react/24/solid';

const ShareStoryModal = ({ isVisible, onClose, onSave, audioUrl, duration }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Load logo
    const logo = new Image();
    logo.src = '/logo.png'; // Đảm bảo có file logo.png trong thư mục public
    logoRef.current = logo;

    // Setup audio context và analyser
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw logo
    if (logoRef.current) {
      const logoSize = 100;
      ctx.drawImage(logoRef.current, width - logoSize - 20, 20, logoSize, logoSize);
    }

    // Draw audio visualizer
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const barWidth = (width * 0.8) / bufferLength;
      const barSpacing = 2;
      const maxBarHeight = height * 0.4;
      const startX = width * 0.1;
      const startY = height * 0.5;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * maxBarHeight;
        const x = startX + i * (barWidth + barSpacing);
        
        // Draw mirrored bars
        ctx.fillStyle = '#4F46E5';
        ctx.fillRect(x, startY - barHeight/2, barWidth, barHeight);
      }
    }

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Đang phát podcast...', width/2, height * 0.3);

    animationFrameRef.current = requestAnimationFrame(drawFrame);
  };

  const createStoryVideo = async () => {
    try {
      setIsProcessing(true);
      const canvas = canvasRef.current;
      const audioElement = new Audio(audioUrl);
      const source = audioContextRef.current.createMediaElementSource(audioElement);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        setVideoBlob(blob);
        setIsProcessing(false);
        cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start();
      audioElement.play();
      drawFrame();
      setIsRecording(true);

      audioElement.onended = () => {
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      };
    } catch (err) {
      console.error('Lỗi khi tạo video:', err);
      setIsProcessing(false);
    }
  };

  const shareToInstagram = async () => {
    try {
      // Trên mobile, mở Instagram app với URL scheme
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const instagramUrl = `instagram://story-camera`;
        window.location.href = instagramUrl;
        // Tự động tải video để user có thể upload
        downloadVideo();
      } else {
        // Trên desktop, tải video về
        downloadVideo();
        alert('Mở Instagram trên điện thoại và upload video vừa tải về để chia sẻ story');
      }
    } catch (err) {
      console.error('Lỗi khi chia sẻ lên Instagram:', err);
    }
  };

  const shareToFacebook = async () => {
    try {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(fbUrl, '_blank');
      downloadVideo();
    } catch (err) {
      console.error('Lỗi khi chia sẻ lên Facebook:', err);
    }
  };

  const shareToTikTok = async () => {
    try {
      // Mở TikTok app trên mobile
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const tiktokUrl = `tiktok://`;
        window.location.href = tiktokUrl;
      }
      // Tải video về để upload
      downloadVideo();
    } catch (err) {
      console.error('Lỗi khi chia sẻ lên TikTok:', err);
    }
  };

  const downloadVideo = () => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'podcast-story.mp4';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chia sẻ Story
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1920}
            className="w-full aspect-[9/16] bg-gray-900 rounded-lg"
          />

          <audio ref={audioRef} src={audioUrl} className="hidden" />

          {!videoBlob ? (
            <button
              onClick={createStoryVideo}
              disabled={isProcessing}
              className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                isProcessing 
                  ? 'bg-gray-400 cursor-wait' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-white">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ShareIcon className="w-5 h-5 text-white" />
                  <span className="text-white">Tạo Story</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={shareToInstagram}
                className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:opacity-90"
              >
                Chia sẻ lên Instagram
              </button>
              
              <button
                onClick={shareToFacebook}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Chia sẻ lên Facebook
              </button>
              
              <button
                onClick={shareToTikTok}
                className="w-full py-3 bg-black text-white rounded-lg hover:opacity-90"
              >
                Chia sẻ lên TikTok
              </button>

              <button
                onClick={downloadVideo}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Tải video về máy
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShareStoryModal; 