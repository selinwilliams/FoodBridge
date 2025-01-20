import React, { useEffect } from 'react';
import './HowItWorks.css';
import { GiSuspensionBridge } from "react-icons/gi";

const HowItWorks = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="how-it-works-container">
            <div className="how-it-works-header">
                <h1><GiSuspensionBridge className="bridge-icon" /> How FoodBridge Works</h1>
                <p>A simple process to connect food providers with those in need</p>
            </div>

            <div className="steps-container">
                <div className="step">
                    <div className="step-number">1</div>
                    <h2>Sign Up as a Provider or Recipient</h2>
                    <p>Create your account and specify whether you're a food provider 
                    (restaurant, grocery store, etc.) or a recipient organization.</p>
                    <img src="/anime-food.jpg" alt="Sign up process" className="step-image" />
                </div>

                <div className="step">
                    <div className="step-number">2</div>
                    <h2>List Available Food</h2>
                    <p>Providers can easily list surplus food items, including details about 
                    quantity, pickup times, and expiration dates.</p>
                    <img src="/japan.avif" alt="Food listing process" className="step-image" />
                </div>

                <div className="step">
                    <div className="step-number">3</div>
                    <h2>Connect and Coordinate</h2>
                    <p>Recipients can browse available food listings and coordinate pickup 
                    times with providers through our platform.</p>
                    <img src="/anime-girls.avif" alt="Coordination process" className="step-image" />
                </div>

                <div className="step">
                    <div className="step-number">4</div>
                    <h2>Complete the Transfer</h2>
                    <p>Meet at the specified time and location to complete the food transfer. 
                    Track and manage all your donations through your dashboard.</p>
                    <img src="/reduce.jpg" alt="Transfer completion" className="step-image" />
                </div>
            </div>

            <div className="benefits-section">
                <h2>Benefits of Using FoodBridge</h2>
                <div className="benefits-grid">
                    <div className="benefit">
                        <i className="fas fa-leaf"></i>
                        <h3>Reduce Food Waste</h3>
                        <p>Help minimize environmental impact by ensuring surplus food reaches those who need it.</p>
                    </div>
                    <div className="benefit">
                        <i className="fas fa-hands-helping"></i>
                        <h3>Support Community</h3>
                        <p>Make a direct impact in your local community by connecting resources with needs.</p>
                    </div>
                    <div className="benefit">
                        <i className="fas fa-clock"></i>
                        <h3>Save Time</h3>
                        <p>Streamlined process makes food donation and collection quick and efficient.</p>
                    </div>
                    <div className="benefit">
                        <i className="fas fa-chart-line"></i>
                        <h3>Track Impact</h3>
                        <p>Monitor your contributions and see the difference you're making.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks; 