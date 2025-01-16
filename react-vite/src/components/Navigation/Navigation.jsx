import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector(state => state.session.user);

  // Function to determine dashboard URL based on user type
  const getDashboardUrl = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'provider':
        return '/dashboard/provider';
      case 'recipient':
        return '/dashboard/recipient';
      default:
        return '/dashboard/recipient'; // Default to recipient dashboard
    }
  };

  const dashboardUrl = getDashboardUrl();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" style={{ color: "#4A3427" }}>
          FoodBridge
        </NavLink>

        <button 
          className="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="hamburger-icon"></span>
        </button>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          {user && dashboardUrl && (
            <NavLink 
              to={dashboardUrl}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Dashboard
            </NavLink>
          )}
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
