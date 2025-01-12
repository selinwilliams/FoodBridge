import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import heroImage from '../../assets/food-waste-hero.jpg';

function LandingPage() {
    const navigate = useNavigate();
    const user = useSelector((store) => store.session.user)

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="nav-left">
                    <h1>FoodBridge</h1>
                </div>
                <div className="nav-right">
                    {!user && (
                        <>
                            <button onClick={() => navigate('/login')} className="nav-button">Login</button>
                            <button onClick={() => navigate('/signup')} className="nav-button signup">Sign Up</button>
                        </>
                    )}
                </div>
            </nav>

            <section className="hero-section">
                <div 
                    className="hero-image" 
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                    <h1>Bridge the Gap Between Surplus & Need</h1>
                    <p>Connect food providers with distribution centers to reduce waste and feed communities</p>
                    <button onClick={() => navigate('/signup')} className="cta-button">Get Started</button>
                </div>
            </section>

            <div className="info-sections">
                <section className="info-section">
                    <h2>For Providers</h2>
                    <p>Easily donate surplus food to those who need it most. Reduce waste and make a difference in your community.</p>
                    <button onClick={() => navigate('/provider-signup')} className="section-button">Join as Provider</button>
                </section>

                <section className="info-section">
                    <h2>For Distribution Centers</h2>
                    <p>Access fresh food donations and efficiently distribute them to your communities in need.</p>
                    <button onClick={() => navigate('/center-signup')} className="section-button">Join as Center</button>
                </section>

                <section className="info-section">
                    <h2>How It Works</h2>
                    <p>Our platform connects food providers with distribution centers, making food donation simple and efficient.</p>
                    <button className="section-button">Learn More</button>
                </section>
            </div>
        </div>
    );
}

export default LandingPage;
