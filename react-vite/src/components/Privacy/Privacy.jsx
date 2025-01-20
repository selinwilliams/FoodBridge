import React from 'react';
import './Privacy.css';

const Privacy = () => {
    return (
        <div className="privacy-container">
            <div className="privacy-header">
                <h1><i className="fas fa-shield-alt"></i> Privacy Policy</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="privacy-content">
                <section className="policy-section">
                    <h2><i className="fas fa-info-circle"></i> Information We Collect</h2>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul>
                        <li>Name and contact information</li>
                        <li>Business details for food providers</li>
                        <li>Location data for distribution centers</li>
                        <li>Account credentials</li>
                        <li>Food listing information</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2><i className="fas fa-lock"></i> How We Protect Your Data</h2>
                    <p>We implement appropriate security measures to protect your personal information:</p>
                    <ul>
                        <li>Secure SSL encryption for all data transmission</li>
                        <li>Regular security audits and updates</li>
                        <li>Restricted access to personal information</li>
                        <li>Secure data storage practices</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2><i className="fas fa-share-alt"></i> Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul>
                        <li>Food providers and recipients (as necessary for service)</li>
                        <li>Distribution centers</li>
                        <li>Service providers who assist our operations</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2><i className="fas fa-cookie-bite"></i> Cookies and Tracking</h2>
                    <p>We use cookies and similar technologies to:</p>
                    <ul>
                        <li>Maintain your session and preferences</li>
                        <li>Understand how you use our platform</li>
                        <li>Improve our services</li>
                        <li>Ensure platform security</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2><i className="fas fa-user-shield"></i> Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Correct inaccurate information</li>
                        <li>Request data deletion</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Lodge a complaint with supervisory authorities</li>
                    </ul>
                </section>

                <section className="policy-section">
                    <h2><i className="fas fa-envelope"></i> Contact Us</h2>
                    <p>For any privacy-related questions or concerns, please contact us at:</p>
                    <div className="contact-info">
                        <p><i className="fas fa-envelope"></i> selin.williams.tx@gmail.com</p>
                        <p><i className="fas fa-phone"></i> (650) 617-5475</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Privacy; 