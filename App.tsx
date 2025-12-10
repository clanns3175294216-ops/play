import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import Scene from './components/Scene';
import { TreeState } from './types';
import { CONFIG } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [gestureStatus, setGestureStatus] = useState<string>('Initializing...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastVideoTime = useRef(-1);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  // Toggle function for manual button
  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  };

  const isTree = treeState === TreeState.TREE_SHAPE;

  // Initialize MediaPipe and Camera
  useEffect(() => {
    const initHandTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
           const stream = await navigator.mediaDevices.getUserMedia({ 
             video: { width: 320, height: 240, facingMode: "user" } 
           });
           
           if (videoRef.current) {
             videoRef.current.srcObject = stream;
             videoRef.current.onloadedmetadata = () => {
               videoRef.current!.play();
               setIsCameraReady(true);
             };
           }
        }
      } catch (error) {
        console.error("Failed to init hand tracking:", error);
        setGestureStatus("Camera Error (Manual Mode Only)");
      }
    };

    initHandTracking();
  }, []);

  // Tracking Loop
  useEffect(() => {
    if (!isCameraReady || !handLandmarkerRef.current || !videoRef.current) return;

    let animationFrameId: number;

    const detect = () => {
      const video = videoRef.current;
      if (video && video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        
        const results = handLandmarkerRef.current?.detectForVideo(video, performance.now());
        
        if (results && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Simple Gesture Logic: Check if fingers are curled towards wrist
          const wrist = landmarks[0];
          const tips = [8, 12, 16, 20].map(i => landmarks[i]);
          
          const avgDist = tips.reduce((acc, tip) => {
             const d = Math.sqrt(
               Math.pow(tip.x - wrist.x, 2) + 
               Math.pow(tip.y - wrist.y, 2) + 
               Math.pow(tip.z - wrist.z, 2)
             );
             return acc + d;
          }, 0) / tips.length;

          if (avgDist < 0.25) {
             setTreeState(TreeState.TREE_SHAPE);
             setGestureStatus("Detected: ✊ FIST (Assemble)");
          } else if (avgDist > 0.35) {
             setTreeState(TreeState.SCATTERED);
             setGestureStatus("Detected: 🖐 OPEN (Release)");
          }
        } else {
             setGestureStatus("No hand detected");
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    detect();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCameraReady]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden Video for Analysis */}
      <video ref={videoRef} id="webcam" playsInline muted autoPlay />

      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: false, 
          toneMapping: 3, 
          toneMappingExposure: 1.2
        }}
        camera={{ position: [0, 2, 32], fov: 45 }}
      >
        <Scene treeState={treeState} />
      </Canvas>

      {/* Christmas Greeting - Centered behind UI but over Canvas */}
      <div 
        className={`
          absolute inset-0 flex items-center justify-center pointer-events-none z-10
          transition-opacity duration-[1500ms] ease-in-out
          ${!isTree ? 'opacity-100 delay-[2400ms]' : 'opacity-0 delay-0'}
        `}
      >
        <h1 className="
          text-5xl md:text-8xl font-serif italic 
          text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C3] to-[#CBA135]
          drop-shadow-[0_0_30px_rgba(203,161,53,0.5)] 
          tracking-wider transform -rotate-3
        ">
          Merry Christmas!
        </h1>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-20">
        
        {/* Header */}
        <header className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C3] to-[#CBA135] tracking-widest drop-shadow-lg">
            ARIX
          </h1>
          <p className="text-[#008f51] uppercase tracking-[0.3em] text-xs md:text-sm mt-2 font-semibold">
            Signature Collection
          </p>
          {/* Gesture Debug Info */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCameraReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <p className="text-[#CBA135]/60 text-[10px] uppercase tracking-widest font-mono">
              {gestureStatus}
            </p>
          </div>
        </header>

        {/* Footer Controls */}
        <footer className="flex flex-col items-center justify-end pb-8">
          <div className="pointer-events-auto group">
            <button 
              onClick={toggleState}
              className={`
                relative px-12 py-4 rounded-full overflow-hidden transition-all duration-700
                border border-[#CBA135]/30 hover:border-[#CBA135]
                ${isTree ? 'bg-[#004225]/80' : 'bg-black/40'}
                backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CBA135]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              
              <span className="relative z-10 font-serif text-[#FFE5B4] text-lg tracking-widest uppercase transition-colors duration-300">
                {isTree ? 'Release Magic' : 'Assemble Tree'}
              </span>
            </button>
            
            <div className={`mt-4 h-[1px] w-full bg-gradient-to-r from-transparent via-[#CBA135] to-transparent transition-opacity duration-500 ${isTree ? 'opacity-100' : 'opacity-30'}`} />
          </div>
          
          <p className="mt-6 text-[10px] text-[#CBA135]/40 tracking-widest uppercase text-center leading-relaxed">
            Gesture Control Enabled<br/>
            <span className="text-[#FFE5B4]">Fist ✊ to Assemble • Open Hand 🖐 to Release</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;