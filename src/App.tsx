import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LoadingScreen from './components/LoadingScreen'

// Lazy load components for better initial loading performance
const SpaceScene = lazy(() => import('./components/SpaceScene'))
const AboutPage = lazy(() => import('./components/AboutPage'))
const LearningPaths = lazy(() => import('./components/LearningPaths'))

// Fallback component for route suspense
const PageLoading = () => (
  <div style={{ 
    width: '100vw', 
    height: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    background: '#000000',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>Loading page...</div>
      <div style={{ 
        width: '150px', 
        height: '3px', 
        background: '#333', 
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: '40%', 
          height: '100%', 
          background: 'white',
          animation: 'loading-animation 1.5s infinite',
          borderRadius: '3px'
        }}></div>
      </div>
      <style>{`
        @keyframes loading-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  </div>
)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize app and handle pre-loading
  useEffect(() => {
    // Check for browser support of WebGL
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (!gl) {
      // WebGL not supported - could show fallback message here
      console.warn('WebGL not supported - fallback experience will be shown')
    }
    
    // Mark app as initialized
    setIsInitialized(true)
  }, [])

  // Handler for loading complete
  const handleLoadComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {/* Show loading screen until app is ready */}
      {isLoading && isInitialized && (
        <LoadingScreen onLoadComplete={handleLoadComplete} />
      )}
      
      {/* Main app content - hidden until loading complete */}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        <Router>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<SpaceScene />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/courses" element={<LearningPaths />} />
              {/* Future routes */}
              {/* <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} /> */}
            </Routes>
          </Suspense>
        </Router>
      </div>
    </>
  )
}

export default App
