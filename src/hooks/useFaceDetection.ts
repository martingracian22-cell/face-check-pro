import { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Employee, RecognitionResult } from '@/types/attendance';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

export const useFaceDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const loadModels = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
        setError(null);
      } catch (err) {
        setError('Failed to load face detection models. Please check your connection.');
        console.error('Model loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const detectFace = useCallback(async (
    video: HTMLVideoElement
  ): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> => {
    if (!isModelLoaded) return null;

    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection || null;
  }, [isModelLoaded]);

  const getFaceDescriptor = useCallback(async (
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<Float32Array | null> => {
    if (!isModelLoaded) return null;

    const detection = await faceapi
      .detectSingleFace(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection?.descriptor || null;
  }, [isModelLoaded]);

  const matchFace = useCallback((
    descriptor: Float32Array,
    employees: Employee[],
    threshold: number = 0.6
  ): RecognitionResult => {
    const registeredEmployees = employees.filter(e => e.faceDescriptor);
    
    if (registeredEmployees.length === 0) {
      return { detected: true, employee: null, confidence: 0 };
    }

    const labeledDescriptors = registeredEmployees.map(emp => 
      new faceapi.LabeledFaceDescriptors(emp.id, [emp.faceDescriptor!])
    );

    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, threshold);
    const match = faceMatcher.findBestMatch(descriptor);

    if (match.label === 'unknown') {
      return { detected: true, employee: null, confidence: 1 - match.distance };
    }

    const matchedEmployee = employees.find(e => e.id === match.label);
    return {
      detected: true,
      employee: matchedEmployee || null,
      confidence: 1 - match.distance,
    };
  }, []);

  return {
    isModelLoaded,
    isLoading,
    error,
    detectFace,
    getFaceDescriptor,
    matchFace,
  };
};
