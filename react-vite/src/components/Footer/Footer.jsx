import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>FoodBridge</h3>
                    <p>Connecting surplus food with those in need, reducing waste, and building stronger communities.</p>
                    <div className="social-links">
                        <a href="https://github.com/selinwilliams" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <i className="fab fa-github"></i>
                        </a>
                        <a href="https://linkedin.com/in/selinwilliams" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a href="https://selinwilliams.github.io" target="_blank" rel="noopener noreferrer" title="Portfolio">
                            <i className="fas fa-globe"></i>
                        </a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <nav className="footer-nav">
                        <Link to="/">Home</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/centers">Distribution Centers</Link>
                    </nav>
                </div>

                <div className="footer-section">
                    <h4>For Users</h4>
                    <nav className="footer-nav">
                        {/* <Link to="/providers">Food Providers</Link>
                        <Link to="/recipients">Food Recipients</Link> */}
                        <Link to="/listings">Available Food</Link>

                    </nav>
                </div>

                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <div className="contact-info">
                        <p><i className="fas fa-envelope"></i> selin.williams.tx@gmail.com</p>
                        <p><i className="fas fa-phone"></i> (650) 617-5475</p>
                        <p><i className="fas fa-map-marker-alt"></i> Houston, TX</p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} FoodBridge. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
