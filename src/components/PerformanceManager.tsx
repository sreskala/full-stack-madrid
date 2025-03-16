import { useEffect, useCallback, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { isLowPerformanceDevice } from '../utils/textureUtils'

// States for rendering quality
export enum QualityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

interface PerformanceManagerProps {
  onQualityChange?: (quality: QualityLevel) => void;
  children?: React.ReactNode;
}

/**
 * Component that monitors frame rate and adjusts rendering quality accordingly
 */
const PerformanceManager = ({ onQualityChange, children }: PerformanceManagerProps): JSX.Element => {
  const { gl } = useThree()
  const [qualityLevel, setQualityLevel] = useState<QualityLevel>(
    isLowPerformanceDevice() ? QualityLevel.LOW : QualityLevel.HIGH
  )
  
  // Frame rate monitoring
  const [frameRates, setFrameRates] = useState<number[]>([])
  const [lastTime, setLastTime] = useState<number>(0)
  const [frameCount, setFrameCount] = useState<number>(0)
  
  // Function to measure and track frame rate
  const measureFrameRate = useCallback(() => {
    const now = performance.now()
    setFrameCount(prev => prev + 1)
    
    // Calculate FPS every second
    if (now - lastTime >= 1000) {
      const fps = frameCount * 1000 / (now - lastTime)
      
      // Keep the last 5 FPS measurements
      setFrameRates(prev => {
        const newFrameRates = [...prev, fps]
        if (newFrameRates.length > 5) {
          newFrameRates.shift()
        }
        return newFrameRates
      })
      
      setLastTime(now)
      setFrameCount(0)
    }
    
    requestAnimationFrame(measureFrameRate)
  }, [lastTime, frameCount])
  
  // Start measuring frame rate
  useEffect(() => {
    const initialTime = performance.now()
    setLastTime(initialTime)
    
    const animationId = requestAnimationFrame(measureFrameRate)
    return () => cancelAnimationFrame(animationId)
  }, [measureFrameRate])
  
  // Adjust quality based on frame rate
  useEffect(() => {
    if (frameRates.length < 3) return // Wait for enough samples
    
    const avgFps = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length
    
    let newQuality: QualityLevel
    
    if (avgFps < 30) {
      newQuality = QualityLevel.LOW
    } else if (avgFps < 45) {
      newQuality = QualityLevel.MEDIUM
    } else {
      newQuality = QualityLevel.HIGH
    }
    
    if (newQuality !== qualityLevel) {
      setQualityLevel(newQuality)
      
      // Apply renderer settings based on quality
      if (newQuality === QualityLevel.LOW) {
        gl.setPixelRatio(Math.min(1, window.devicePixelRatio))
        gl.shadowMap.enabled = false
      } else if (newQuality === QualityLevel.MEDIUM) {
        gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio))
        gl.shadowMap.enabled = true
      } else {
        gl.setPixelRatio(window.devicePixelRatio)
        gl.shadowMap.enabled = true
      }
      
      // Notify parent component
      if (onQualityChange) {
        onQualityChange(newQuality)
      }
    }
  }, [frameRates, qualityLevel, gl, onQualityChange])
  
  return (
    <>
      {children}
    </>
  )
}

export default PerformanceManager
