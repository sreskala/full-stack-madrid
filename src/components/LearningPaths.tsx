// LearningPaths.jsx
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { 
  BookOpen, 
  Code2, 
  Cloud, 
  Database, 
  Brain,
  ChevronRight,
  Clock,
  Target,
  Loader
} from 'lucide-react';
import './LearningPaths.css';

const LearningPaths = () => {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goals: '',
    selectedPath: ''
  });

  useEffect(() => {
    // Initialize EmailJS
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string); // You'll need to replace this with your actual public key
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const templateParams = {
        to_name: "Sam", // Replace with your name
        from_name: formData.name,
        from_email: formData.email,
        learning_goals: formData.goals,
        selected_path: selectedPath || "No path selected"
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID as string, // Replace with your EmailJS service ID
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string, // Replace with your EmailJS template ID
        templateParams
      );

      setSubmitStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', goals: '', selectedPath: '' });
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Email sending failed:', error);
      setSubmitStatus('error');
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const learningPaths = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      icon: <Code2 className="path-icon" />,
      description: 'Master modern frontend development with React, TypeScript, and responsive design',
      duration: '12 weeks',
      level: 'Beginner to Intermediate',
      courses: [
        {
          title: 'Web Fundamentals',
          modules: [
            'HTML5 Semantic Structure',
            'CSS3 & Responsive Design',
            'JavaScript ES6+ Fundamentals',
            'DOM Manipulation & Events'
          ]
        },
        {
          title: 'React Essentials',
          modules: [
            'React Components & Props',
            'State Management & Hooks',
            'Component Lifecycle',
            'React Router & Navigation'
          ]
        },
        {
          title: 'Advanced Frontend',
          modules: [
            'TypeScript in React',
            'State Management with Redux',
            'Performance Optimization',
            'Testing React Applications'
          ]
        }
      ]
    },
    {
      id: 'backend',
      title: 'Backend Development',
      icon: <Database className="path-icon" />,
      description: 'Build scalable backend services using Node.js, C#, and modern databases',
      duration: '14 weeks',
      level: 'Intermediate',
      courses: [
        {
          title: 'Server-Side Fundamentals',
          modules: [
            'Node.js & Express Basics',
            'RESTful API Design',
            'Database Design Principles',
            'Authentication & Authorization'
          ]
        },
        {
          title: '.NET Development',
          modules: [
            'C# Fundamentals',
            'ASP.NET Core Basics',
            'Entity Framework',
            'Web API Development'
          ]
        },
        {
          title: 'Advanced Backend',
          modules: [
            'Microservices Architecture',
            'Message Queues & Event-Driven Design',
            'Caching Strategies',
            'API Security & Performance'
          ]
        }
      ]
    },
    {
      id: 'cloud',
      title: 'Cloud & DevOps',
      icon: <Cloud className="path-icon" />,
      description: 'Learn cloud architecture, DevOps practices, and deployment strategies',
      duration: '10 weeks',
      level: 'Intermediate to Advanced',
      courses: [
        {
          title: 'Cloud Fundamentals',
          modules: [
            'AWS Core Services',
            'Azure Fundamentals',
            'Cloud Architecture Patterns',
            'Serverless Computing'
          ]
        },
        {
          title: 'DevOps Practices',
          modules: [
            'CI/CD Pipeline Implementation',
            'Docker & Containerization',
            'Infrastructure as Code',
            'Monitoring & Logging'
          ]
        },
        {
          title: 'Advanced Cloud Solutions',
          modules: [
            'Multi-Cloud Strategies',
            'Cloud Security',
            'Scalability & High Availability',
            'Cost Optimization'
          ]
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI & Deep Learning',
      icon: <Brain className="path-icon" />,
      description: 'Explore AI fundamentals, neural networks, and practical machine learning',
      duration: '16 weeks',
      level: 'Advanced',
      courses: [
        {
          title: 'AI Foundations',
          modules: [
            'Python for AI',
            'Mathematics for Machine Learning',
            'Data Preprocessing',
            'Basic Neural Networks'
          ]
        },
        {
          title: 'Deep Learning',
          modules: [
            'Neural Network Architectures',
            'Computer Vision Basics',
            'Natural Language Processing',
            'Deep Learning Frameworks'
          ]
        },
        {
          title: 'Applied AI',
          modules: [
            'Model Deployment',
            'AI in Production',
            'Performance Optimization',
            'AI Ethics & Best Practices'
          ]
        }
      ]
    }
  ];

  return (
    <div className="learning-paths-container">
      <div className="paths-header">
        <h1>Learning Paths</h1>
        <p>Click on a learning path to learn more details about the course</p>
      </div>

      <div className="paths-grid">
        {learningPaths.map(path => (
          <div 
            key={path.id}
            className={`path-card ${selectedPath === path.id ? 'selected' : ''}`}
            onClick={() => setSelectedPath(path.id as string)}
          >
            <div className="path-header">
              {path.icon}
              <h2>{path.title}</h2>
            </div>
            <p className="path-description">{path.description}</p>
            <div className="path-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>{path.duration}</span>
              </div>
              <div className="meta-item">
                <Target size={16} />
                <span>{path.level}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPath && (
        <div className="course-details">
          <h2>Course Structure</h2>
          <div className="courses-grid">
            {
              //@ts-ignore
            learningPaths.find(p => p.id === selectedPath).courses.map((course, index) => (
              <div key={index} className="course-card">
                <h3>
                  <BookOpen size={20} />
                  {course.title}
                </h3>
                <ul>
                  {course.modules.map((module, moduleIndex) => (
                    <li key={moduleIndex}>
                      <ChevronRight size={16} />
                      {module}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="enroll-section">
        <div className="enroll-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Choose a learning path and begin your development journey today.</p>
          <button 
            className="enroll-button"
            onClick={() => setIsModalOpen(true)}
          >
            Enroll Now
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2>Enroll in Learning Path</h2>
            <p>Tell us about yourself and your learning goals</p>
            
            <form onSubmit={handleSubmit} className="enrollment-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="goals">What do you want to learn?</label>
                <textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us about your learning goals and what you hope to achieve..."
                  rows={4}
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading">
                    <Loader className="animate-spin" />
                    Sending...
                  </span>
                ) : 'Submit Enrollment'}
              </button>

              {submitStatus === 'success' && (
                <div className="status-message success">
                  Enrollment submitted successfully!
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="status-message error">
                  There was an error submitting the form. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPaths;