import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Scan, UserCheck, UserX } from 'lucide-react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { Employee, RecognitionResult } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface CameraFeedProps {
  employees: Employee[];
  onRecognition: (result: RecognitionResult) => void;
  onCapture?: (imageData: string, descriptor: Float32Array | null) => void;
  mode: 'recognition' | 'registration';
}

export const CameraFeed = ({ employees, onRecognition, onCapture, mode }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const { isModelLoaded, isLoading, error, detectFace, getFaceDescriptor, matchFace } = useFaceDetection();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setCameraError(null);
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please grant permission.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Face detection loop for recognition mode
  useEffect(() => {
    if (!isStreaming || !isModelLoaded || mode !== 'recognition') return;

    let animationId: number;
    let lastDetectionTime = 0;
    const DETECTION_INTERVAL = 1000; // Run detection every second

    const detect = async (timestamp: number) => {
      if (timestamp - lastDetectionTime >= DETECTION_INTERVAL && videoRef.current) {
        lastDetectionTime = timestamp;
        setIsScanning(true);
        
        const detection = await detectFace(videoRef.current);
        
        if (detection) {
          const result = matchFace(detection.descriptor, employees);
          setLastResult(result);
          onRecognition(result);
        } else {
          setLastResult(null);
        }
        
        setIsScanning(false);
      }
      
      animationId = requestAnimationFrame(detect);
    };

    animationId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animationId);
  }, [isStreaming, isModelLoaded, mode, employees, detectFace, matchFace, onRecognition]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    const descriptor = await getFaceDescriptor(video);
    onCapture?.(imageData, descriptor);
  };

  const getStatusColor = () => {
    if (!lastResult) return 'border-muted';
    if (lastResult.employee) return 'border-success';
    return 'border-warning';
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative aspect-video rounded-2xl overflow-hidden border-4 transition-colors duration-300",
          getStatusColor(),
          "shadow-lg bg-foreground/5"
        )}
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Scan className="w-16 h-16 text-primary" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-muted-foreground">Loading face detection models...</p>
            </div>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center p-6">
              <CameraOff className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Model error */}
        {error && (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center p-6">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Recognition result overlay */}
        <AnimatePresence>
          {mode === 'recognition' && lastResult && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent"
            >
              <div className="flex items-center gap-3">
                {lastResult.employee ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-success-foreground" />
                    </div>
                    <div className="text-background">
                      <p className="font-semibold">{lastResult.employee.name}</p>
                      <p className="text-sm opacity-80">
                        {lastResult.employee.department} • {Math.round(lastResult.confidence * 100)}% match
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center">
                      <UserX className="w-5 h-5 text-warning-foreground" />
                    </div>
                    <div className="text-background">
                      <p className="font-semibold">Unknown Person</p>
                      <p className="text-sm opacity-80">Not registered in system</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera status indicator */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ scale: isStreaming ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: isStreaming ? Infinity : 0, duration: 2 }}
            className={cn(
              "w-3 h-3 rounded-full",
              isStreaming ? "bg-success" : "bg-destructive"
            )}
          />
        </div>
      </motion.div>

      {/* Capture button for registration mode */}
      {mode === 'registration' && isStreaming && isModelLoaded && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={captureImage}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-glow flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          Capture Face
        </motion.button>
      )}
    </div>
  );
};
