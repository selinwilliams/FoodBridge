import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>FoodBridge</h4>
                        <p>Connecting surplus food with communities in need. Making a difference, one meal at a time.</p>
                        <div className="social-links">
                            <a href="https://github.com/selinwilliams" className="social-link">
                                <i className="fab fa-github"></i>
                            </a>
                            <a href="https://www.linkedin.com/in/selinwilliams/" className="social-link">
                                <i className="fab fa-linkedin"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-twitter"></i>
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/how-it-works">How It Works</a></li>
                            <li><a href="/listings">Food Listings</a></li>
                            <li><a href="/centers">Distribution Centers</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="/faq">FAQ</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Newsletter</h4>
                        <p>Stay updated with our latest initiatives</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Enter your email" />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 FoodBridge. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="/privacy">Privacy</a>
                        <a href="/terms">Terms</a>
                        <a href="/contact">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
