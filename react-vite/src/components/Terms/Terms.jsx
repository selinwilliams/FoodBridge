import React from 'react';
import './Terms.css';

const Terms = () => {
    return (
        <div className="terms-container">
            <div className="terms-header">
                <h1><i className="fas fa-file-contract"></i> Terms of Service</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="terms-content">
                <section className="terms-section">
                    <h2><i className="fas fa-handshake"></i> Agreement to Terms</h2>
                    <p>By accessing or using FoodBridge, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-user-check"></i> User Responsibilities</h2>
                    <p>As a user of FoodBridge, you agree to:</p>
                    <ul>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account</li>
                        <li>Not misuse or abuse the platform</li>
                        <li>Follow food safety guidelines and regulations</li>
                        <li>Respect other users and their rights</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-box-open"></i> Food Provider Terms</h2>
                    <p>Food providers must:</p>
                    <ul>
                        <li>Ensure food safety and quality</li>
                        <li>Provide accurate listing information</li>
                        <li>Follow local food handling regulations</li>
                        <li>Maintain proper storage conditions</li>
                        <li>Honor commitments to recipients</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-hands-helping"></i> Recipient Terms</h2>
                    <p>Food recipients must:</p>
                    <ul>
                        <li>Pick up food within agreed timeframes</li>
                        <li>Handle food safely after pickup</li>
                        <li>Report any issues promptly</li>
                        <li>Not resell received food items</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-exclamation-triangle"></i> Disclaimers</h2>
                    <p>FoodBridge:</p>
                    <ul>
                        <li>Does not guarantee food quality or safety</li>
                        <li>Is not responsible for user interactions</li>
                        <li>May modify services without notice</li>
                        <li>Reserves the right to terminate accounts</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-gavel"></i> Dispute Resolution</h2>
                    <p>Any disputes will be resolved through:</p>
                    <ul>
                        <li>Direct communication between parties</li>
                        <li>Platform mediation when necessary</li>
                        <li>Applicable legal channels</li>
                    </ul>
                </section>

                <section className="terms-section">
                    <h2><i className="fas fa-envelope"></i> Contact Information</h2>
                    <p>For questions about these terms, please contact:</p>
                    <div className="contact-info">
                        <p><i className="fas fa-envelope"></i> selin.williams.tx@gmail.com</p>
                        <p><i className="fas fa-phone"></i> (650) 617-5475</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Terms; 