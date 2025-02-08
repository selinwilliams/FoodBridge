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
    <nav className="navigation">
      <div className="nav-container">
        <NavLink to="/" className="logo-container">
          <span className="logo-text">FoodBridge</span>
        </NavLink>

        <button 
          className="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="hamburger-icon"></span>
        </button>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          {user && dashboardUrl && (
            <li className="nav-item">
              <NavLink 
                to={dashboardUrl}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                Dashboard
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink 
              to="/listings" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Food Listings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/centers" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Distribution Centers
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              About
            </NavLink>
          </li>
        </ul>

        <ProfileButton />
      </div>
    </nav>
  );
}

export default Navigation;
