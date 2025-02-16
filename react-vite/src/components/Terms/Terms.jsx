import React from 'react';
import './Terms.css';

const Terms = () => {
    return (
        <div className="terms-container">
            <div className="terms-header">
                <h1>
                    <i className="fas fa-file-contract"></i>
                    Terms of Service
                </h1>
                <p>Please read these terms carefully before using FoodBridge</p>
            </div>

            <div className="terms-content">
                <section className="terms-section">
                    <h2>
                        <i className="fas fa-handshake"></i>
                        Agreement to Terms
                    </h2>
                    <p>
                        By accessing or using FoodBridge, you agree to be bound by these Terms of Service. 
                        If you disagree with any part of these terms, you may not access the service.
                    </p>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-user-check"></i>
                        User Responsibilities
                    </h2>
                    <p>As a user of FoodBridge, you agree to:</p>
                    <ul>
                        <li>Provide accurate and complete information when creating your account</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Not misuse or abuse the platform's services</li>
                        <li>Follow all applicable food safety guidelines and regulations</li>
                        <li>Respect the rights and privacy of other users</li>
                        <li>Report any suspicious or inappropriate behavior</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-box-open"></i>
                        Food Provider Terms
                    </h2>
                    <p>Food providers must adhere to the following guidelines:</p>
                    <ul>
                        <li>Ensure all food items meet safety and quality standards</li>
                        <li>Provide accurate and detailed listing information</li>
                        <li>Follow local food handling and storage regulations</li>
                        <li>Maintain appropriate storage conditions for food items</li>
                        <li>Honor all commitments made to food recipients</li>
                        <li>Promptly update listing status when items are no longer available</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-hands-helping"></i>
                        Recipient Terms
                    </h2>
                    <p>Food recipients are expected to:</p>
                    <ul>
                        <li>Pick up food items within the agreed timeframe</li>
                        <li>Handle and store received food items safely</li>
                        <li>Report any quality or safety concerns immediately</li>
                        <li>Not resell or commercially distribute received items</li>
                        <li>Respect pickup locations and provider guidelines</li>
                        <li>Cancel reservations if unable to pick up items</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-shield-alt"></i>
                        Platform Policies
                    </h2>
                    <p>FoodBridge reserves the right to:</p>
                    <ul>
                        <li>Modify or terminate services at any time</li>
                        <li>Remove users who violate these terms</li>
                        <li>Update these terms with reasonable notice</li>
                        <li>Monitor and moderate platform activity</li>
                        <li>Share information with law enforcement if required</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-exclamation-triangle"></i>
                        Disclaimers
                    </h2>
                    <p>Important information about our service:</p>
                    <ul>
                        <li>FoodBridge is a platform facilitator, not a food provider</li>
                        <li>We do not guarantee food quality or safety</li>
                        <li>Users interact at their own risk</li>
                        <li>We are not responsible for user disputes</li>
                        <li>Service availability is not guaranteed</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2>
                        <i className="fas fa-envelope"></i>
                        Contact Information
                    </h2>
                    <p>For questions about these terms or to report violations, please contact us:</p>
                    <div className="contact-info">
                        <p>
                            <i className="fas fa-envelope"></i>
                            selin.williams.tx@gmail.com
                        </p>
                        <p>
                            <i className="fas fa-phone"></i>
                            (650) 617-5475
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Terms; 