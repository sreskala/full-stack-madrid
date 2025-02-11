import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Scene from './components/Scene'
import SpaceScene from './components/SpaceScene'
import { Center } from '@react-three/drei'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutPage from './components/AboutPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpaceScene />} />
        <Route path="/about" element={<AboutPage />} />
        {/* <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
    </Router>
  )
}

export default App
