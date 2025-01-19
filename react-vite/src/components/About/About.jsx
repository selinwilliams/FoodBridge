import React from 'react';
import './About.css';
import { GiSuspensionBridge } from "react-icons/gi";

const About = () => {
    return (
        <div className="about-container">
            <div className="about-header">
                <h1><GiSuspensionBridge className="bridge-icon" /> About FoodBridge</h1>
                <p><i className="fas fa-handshake"></i> Connecting food providers with those in need</p>
            </div>

            <div className="about-content">
                <div className="mission-section">
                    <h2><i className="fas fa-heart"></i> Our Mission</h2>
                    <p>
                        <i className="fas fa-utensils"></i> FoodBridge aims to reduce food waste while helping those in need by creating 
                        a seamless connection between food providers and recipients. We believe in 
                        building a sustainable future where no food goes to waste and no one goes hungry.
                    </p>
                </div>

                <div className="developer-section">
                    <h2><i className="fas fa-code"></i> Meet the Developer</h2>
                    <div className="developer-card">
                        <img src="/sln.jpg" alt="Developer" className="developer-image" />
                        <div className="developer-info">
                            <h3><i className="fas fa-user-circle"></i> Selin Williams</h3>
                            <p><i className="fas fa-laptop-code"></i> Full Stack Software Engineer</p>
                            <p className="developer-bio">
                                <i className="fas fa-quote-left"></i> Passionate about creating meaningful solutions that make a positive 
                                impact on society. Specialized in building modern web applications 
                                with React, Python, and Node.js.
                            </p>
                            <div className="social-links">
                                <a href="https://selinwilliams.github.io/" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <i className="fas fa-briefcase"></i>
                                    Portfolio
                                </a>
                                <a href="https://www.linkedin.com/in/selinwilliams/" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <i className="fab fa-linkedin"></i>
                                    LinkedIn
                                </a>
                                <a href="https://github.com/selinwilliams" target="_blank" rel="noopener noreferrer" className="social-link">
                                    <i className="fab fa-github"></i>
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tech-stack-section">
                    <h2><i className="fas fa-layer-group"></i> Technology Stack</h2>
                    <div className="tech-grid">
                        <div className="tech-item">
                            <i className="fab fa-react"></i>
                            <span>React</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-python"></i>
                            <span>Python</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-js"></i>
                            <span>JavaScript</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-database"></i>
                            <span>PostgreSQL</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-node-js"></i>
                            <span>Node.js</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-html5"></i>
                            <span>HTML5</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-css3-alt"></i>
                            <span>CSS3</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-server"></i>
                            <span>Flask</span>
                        </div>
                    </div>
                </div>

                <div className="contact-section">
                    <h2><i className="fas fa-envelope"></i> Get in Touch</h2>
                    <p>
                        <i className="fas fa-comments"></i> Interested in collaborating or have questions about FoodBridge? 
                        Feel free to reach out through any of the social links above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About; 