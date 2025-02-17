import './App.css'
import SpaceScene from './components/SpaceScene'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutPage from './components/AboutPage'
import LearningPaths from './components/LearningPaths'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpaceScene />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<LearningPaths />} />
        {/* <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
    </Router>
  )
}

export default App
