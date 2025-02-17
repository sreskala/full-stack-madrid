// AboutSection.jsx
import React from 'react';
import { 
  Code2, 
  Rocket, 
  Users, 
  Globe, 
  FileCode, 
  Binary, 
  Coffee, 
  Hash, 
  BeakerIcon,
  FileJson,
  Layers,
  Paintbrush,
  BoxIcon,
  Component,
  Workflow,
  PackageOpen,
  Cloud,
  CloudCog,
  ServerIcon,
  Box,
  GitBranch,
  Infinity,
  Brain,
  Network,
  Database,
  DatabaseIcon,
  Boxes,
  Search,
  Monitor,
  Activity,
  Scan,
  Cpu,
  HardDrive
} from 'lucide-react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <div className="about-container">
      <h2 className="about-title">Why Learn With Me?</h2>
      
      <div className="about-intro">
        <p>
          As a trilingual full-stack software engineer with experience across cutting-edge technologies,
          I bring real-world expertise from working with industry leaders like HP/Poly and innovative
          startups in the space technology sector. My journey has taken me from developing IoT solutions
          to crafting mission analysis software for spacecraft design, giving me a unique perspective
          on both practical and advanced programming concepts.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-header">
            <Code2 className="feature-icon" />
            <h3>Full-Stack Mastery</h3>
          </div>
          <p>
            From React and TypeScript to Python and Julia, I've architected solutions
            across the entire technology stack. I'll help you build a strong foundation
            in both frontend and backend development.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <Rocket className="feature-icon" />
            <h3>Cloud & DevOps</h3>
          </div>
          <p>
            With extensive experience in AWS, Azure, and GCP, I'll teach you modern
            cloud architecture and CI/CD practices that are essential in today's
            software development landscape.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <Users className="feature-icon" />
            <h3>Mentorship Experience</h3>
          </div>
          <p>
            I've mentored developers and interns, led cross-functional teams, and
            established best practices that have improved team velocity and code quality.
            I know how to break down complex concepts into digestible lessons.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <Globe className="feature-icon" />
            <h3>International Perspective</h3>
          </div>
          <p>
            Working across different countries and cultures has given me a unique
            ability to communicate effectively and adapt my teaching style to diverse
            learning approaches.
          </p>
        </div>
      </div>

      <div className="teaching-approach">
        <h3>My Teaching Approach</h3>
        <p>
          I believe in practical, hands-on learning that combines theoretical knowledge
          with real-world applications. My courses will take you from understanding
          basic concepts to implementing complex features using the same tools and
          practices I use in professional development. Whether you're starting from
          scratch or looking to level up your skills, I'll help you build the
          confidence and competence needed to succeed in full-stack development.
        </p>
      </div>

      <div className="skills-section">
        <h3>Technical Skills</h3>
        
        <div className="skills-category">
          <h4>Languages & Frameworks</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <Code2 className="skill-icon" />
              <span>TypeScript</span>
            </div>
            <div className="skill-item">
              <FileCode className="skill-icon" />
              <span>JavaScript</span>
            </div>
            <div className="skill-item">
              <Binary className="skill-icon" />
              <span>Python</span>
            </div>
            <div className="skill-item">
              <Coffee className="skill-icon" />
              <span>Java</span>
            </div>
            <div className="skill-item">
              <Hash className="skill-icon" />
              <span>C#</span>
            </div>
            <div className="skill-item">
              <BeakerIcon className="skill-icon" />
              <span>Julia</span>
            </div>
            <div className="skill-item">
              <FileJson className="skill-icon" />
              <span>PHP</span>
            </div>
          </div>
        </div>

        <div className="skills-category">
          <h4>Web Technologies</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <Layers className="skill-icon" />
              <span>React</span>
            </div>
            <div className="skill-item">
              <Paintbrush className="skill-icon" />
              <span>CSS</span>
            </div>
            <div className="skill-item">
              <FileCode className="skill-icon" />
              <span>HTML</span>
            </div>
            <div className="skill-item">
              <BoxIcon className="skill-icon" />
              <span>Node.js</span>
            </div>
            <div className="skill-item">
              <Component className="skill-icon" />
              <span>ASP.NET</span>
            </div>
            <div className="skill-item">
              <Workflow className="skill-icon" />
              <span>GraphQL</span>
            </div>
            <div className="skill-item">
              <PackageOpen className="skill-icon" />
              <span>REST APIs</span>
            </div>
          </div>
        </div>

        <div className="skills-category">
          <h4>Cloud & DevOps</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <Cloud className="skill-icon" />
              <span>AWS</span>
            </div>
            <div className="skill-item">
              <CloudCog className="skill-icon" />
              <span>Azure</span>
            </div>
            <div className="skill-item">
              <ServerIcon className="skill-icon" />
              <span>GCP</span>
            </div>
            <div className="skill-item">
              <Box className="skill-icon" />
              <span>Docker</span>
            </div>
            <div className="skill-item">
              <GitBranch className="skill-icon" />
              <span>Git</span>
            </div>
            <div className="skill-item">
              <Infinity className="skill-icon" />
              <span>CI/CD</span>
            </div>
          </div>
        </div>

        <div className="skills-category">
          <h4>Data & AI</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <Brain className="skill-icon" />
              <span>Deep Learning</span>
            </div>
            <div className="skill-item">
              <Network className="skill-icon" />
              <span>Neural Networks</span>
            </div>
            <div className="skill-item">
              <Database className="skill-icon" />
              <span>MongoDB</span>
            </div>
            <div className="skill-item">
              <DatabaseIcon className="skill-icon" />
              <span>DynamoDB</span>
            </div>
            <div className="skill-item">
              <Boxes className="skill-icon" />
              <span>Redis</span>
            </div>
            <div className="skill-item">
              <Search className="skill-icon" />
              <span>Elasticsearch</span>
            </div>
          </div>
        </div>

        <div className="skills-category">
          <h4>Tools & Services</h4>
          <div className="skills-grid">
            <div className="skill-item">
              <Monitor className="skill-icon" />
              <span>Databricks</span>
            </div>
            <div className="skill-item">
              <Activity className="skill-icon" />
              <span>Datadog</span>
            </div>
            <div className="skill-item">
              <Scan className="skill-icon" />
              <span>Debugging</span>
            </div>
            <div className="skill-item">
              <Cpu className="skill-icon" />
              <span>IoT</span>
            </div>
            <div className="skill-item">
              <Box className="skill-icon" />
              <span>Lambda</span>
            </div>
            <div className="skill-item">
              <HardDrive className="skill-icon" />
              <span>S3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;