import React, { useState } from 'react';
import './FAQ.css';

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "What is FoodBridge?",
            answer: "FoodBridge is a platform that connects food providers with communities in need, helping to reduce food waste and combat hunger by facilitating the distribution of surplus food to those who need it most."
        },
        {
            question: "How does FoodBridge work?",
            answer: "Food providers can list their surplus food on our platform. Recipients can browse these listings and reserve food items. Distribution centers help facilitate the pickup and delivery process, ensuring food reaches those in need efficiently."
        },
        {
            question: "Who can use FoodBridge?",
            answer: "FoodBridge serves three main user groups: Food Providers (restaurants, grocery stores, etc.), Recipients (individuals or organizations in need), and Distribution Centers. Anyone can sign up and participate based on their role."
        },
        {
            question: "Is FoodBridge free to use?",
            answer: "Yes, FoodBridge is completely free to use for all users. Our mission is to reduce food waste and help communities, so we don't charge any fees for our service."
        },
        {
            question: "How do I list food items?",
            answer: "Food providers can easily list items by logging in, navigating to the Food Listings section, and clicking 'Create New Listing.' You'll need to provide details about the food, quantity, pickup window, and any special instructions."
        },
        {
            question: "How do I find food near me?",
            answer: "You can browse available food listings in your area by visiting the Food Listings page. Use the search and filter options to find specific items or locations. You can also find nearby distribution centers on our Distribution Centers page."
        },
        {
            question: "What safety measures are in place?",
            answer: "We ensure food safety by requiring providers to follow proper food handling guidelines, providing clear expiration dates, and maintaining quality standards. Distribution centers also help verify and maintain food safety protocols."
        },
        {
            question: "How can I become a distribution center?",
            answer: "Organizations interested in becoming distribution centers can contact our admin team through the Contact form. We'll review your application and work with you to set up your distribution center profile."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-container">
            <div className="faq-header">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about FoodBridge</p>
            </div>

            <div className="faq-content">
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                        >
                            <div className="faq-question">
                                <h3>{faq.question}</h3>
                                <span className="faq-icon">
                                    <i className={`fas fa-chevron-${activeIndex === index ? 'up' : 'down'}`}></i>
                                </span>
                            </div>
                            <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="contact-section">
                    <h2>Still have questions?</h2>
                    <p>Can't find the answer you're looking for? Please reach out to our support team.</p>
                    <button className="contact-button">
                        <i className="fas fa-envelope"></i>
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FAQ; 