import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();
    const user = useSelector((store) => store.session.user);
    const [showContactModal, setShowContactModal] = useState(false);

    const handleContactClick = () => {
        setShowContactModal(true);
    };

    const handleGetStarted = () => {
        navigate('/signup');
    };

    const handleHowItWorks = () => {
        navigate('/how-it-works');
        window.scrollTo(0, 0);
    };

    return (
        <div className="landing-page">
            <div className="landing-container">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Reduce food waste,<br />feed a community</h1>
                        <p>Connect surplus food with communities in need through our simple platform</p>
                        <button onClick={handleGetStarted} className="hero-button">
                            Get Started
                        </button>
                    </div>
                    <div className="hero-illustrations">
                        <div className="food-illustration bread-basket">
                            <img 
                                src="/anime-food.jpg" 
                                alt="Anime style food illustration"
                                className="food-image"
                            />
                        </div>
                        <div className="food-illustration fruits-bowl">
                            <img 
                                src="/japan.avif" 
                                alt="Various delicious foods"
                                className="food-image"
                            />
                        </div>
                        <div className="food-illustration veggies-crate">
                            <img 
                                src="/anime-girls.avif" 
                                alt="Anime girl with food"
                                className="food-image"
                            />
                        </div>
                    </div>
                </section>

                <div className="info-sections">
                    <section className="info-section" id="about">
                        <div className="section-icon about-icon">
                            <img 
                                src="/reduce.jpg" 
                                alt="Bowl of delicious noodles"
                                className="icon-image"
                            />
                        </div>
                        <h3>About Us</h3>
                        <p>Building bridges between food surplus and community needs</p>
                        <button onClick={() => navigate('/about')} className="section-button">
                            Learn More
                        </button>
                    </section>

                    <section className="info-section" id="join">
                        <div className="section-icon join-icon">
                            <img 
                                src="/japan.avif" 
                                alt="Japanese convenience store"
                                className="icon-image"
                            />
                        </div>
                        <h3>Join Us</h3>
                        <p>Make a difference in your local community today</p>
                        <button onClick={handleGetStarted} className="section-button">
                            Get Started
                        </button>
                    </section>

                    <section className="info-section" id="how">
                        <div className="section-icon how-icon">
                            <img 
                                src="/zero.jpg" 
                                alt="Group sharing food"
                                className="icon-image"
                            />
                        </div>
                        <h3>How it Works</h3>
                        <p>Simple steps to connect and distribute food</p>
                        <button onClick={handleHowItWorks} className="section-button">
                            See More
                        </button>
                    </section>

                    <section className="info-section" id="contact">
                        <div className="section-icon contact-icon">
                            <img 
                                src="/selin.jpg" 
                                alt="Delicious food spread"
                                className="icon-image"
                            />
                        </div>
                        <h3>Contact</h3>
                        <p>Questions? We're here to help</p>
                        <button onClick={handleContactClick} className="section-button">
                            Reach Out
                        </button>
                    </section>
                </div>
            </div>

            {showContactModal && (
                <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
                    <div className="contact-modal" onClick={e => e.stopPropagation()}>
                        <h2>Get in Touch</h2>
                        <form className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" rows="4" required></textarea>
                            </div>
                            <button type="submit" className="submit-button">Send Message</button>
                        </form>
                        <button className="close-button" onClick={() => setShowContactModal(false)}>×</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LandingPage;
