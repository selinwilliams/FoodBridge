import { NavLink } from "react-router-dom";
import { useState } from "react";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" style={{ color: "#4A3427" }}>
          FoodBridge
        </NavLink>

        <button 
          className="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}got this
        >
          <span className="hamburger-icon"></span>
        </button>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <NavLink 
            to="/listings" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Food Listings
          </NavLink>
          <NavLink 
            to="/centers" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Distribution Centers
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            About
          </NavLink>
        </div>

        <div className="navbar-profile">
          <ProfileButton />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
