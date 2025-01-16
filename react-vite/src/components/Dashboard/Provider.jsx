import React, { useState, useEffect } from 'react';
import './Provider.css';
import { useSelector } from 'react-redux';

const Provider = () => {
    const [version] = useState('2.8.38');
    const [donations, setDonations] = useState({
        total: 156,
        pending: 12,
        completed: 144
    });
    const [deductions, setDeductions] = useState(3250);
    const [donationHistory, setDonationHistory] = useState([
        {
            id: 1,
            title: 'Fresh Produce Bundle',
            date: '2024-03-15',
            status: 'completed'
        },
        {
            id: 2,
            title: 'Bakery Items',
            date: '2024-03-14',
            status: 'pending'
        },
        {
            id: 3,
            title: 'Canned Goods Collection',
            date: '2024-03-13',
            status: 'completed'
        }
    ]);
    
    const sessionUser = useSelector(state => state.session.user);

    useEffect(() => {
        // Fetch donations and deductions data
        // This will be implemented with actual API calls
    }, []);

    return (
        <div className="provider-dashboard">
            <div className="provider-header">
                <div className="provider-profile">
                    <img src={sessionUser?.profile_image || '/default-avatar.png'} alt="Provider" />
                    <div className="provider-info">
                        <h2>Welcome, {sessionUser?.username || 'Provider'}</h2>
                        <span className="version">v{version}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards">
                <div className="card food-donations">
                    <h3>Food Donations</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">{donations.total}</span>
                            <span className="label">Total Donations</span>
                        </div>
                        <div className="metric">
                            <span className="value">{donations.pending}</span>
                            <span className="label">Pending</span>
                        </div>
                        <div className="metric">
                            <span className="value">{donations.completed}</span>
                            <span className="label">Completed</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="add-btn">Add Donation</button>
                    </div>
                </div>

                <div className="card deductions">
                    <h3>Tax Deductions</h3>
                    <div className="deduction-info">
                        <div className="deduction-amount">
                            <span className="value">${deductions.toLocaleString()}</span>
                            <span className="label">Total Deductions</span>
                        </div>
                        <div className="chart">
                            {/* Placeholder for deductions chart */}
                        </div>
                    </div>
                    <div className="actions">
                        <button className="add-btn">View Details</button>
                    </div>
                </div>

                <div className="card donation-history">
                    <h3>Donation History</h3>
                    <div className="history-list">
                        {donationHistory.map((donation) => (
                            <div key={donation.id} className="history-item">
                                <div className="history-info">
                                    <span className="history-title">{donation.title}</span>
                                    <span className="history-date">{donation.date}</span>
                                </div>
                                <span className={`history-status ${donation.status}`}>
                                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="actions">
                        <button className="add-btn">View All History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Provider;
