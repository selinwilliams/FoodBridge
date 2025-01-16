import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';
import LandingPage from '../components/LandingPage/LandingPage';
import { Admin, Provider, Recipient } from '../components/Dashboard';
import FoodListing from '../components/FoodListing/FoodListing';
import DistributionCenters from '../components/DistributionCenters/DistributionCenters';
import ProviderProfile from '../components/ProviderProfile/ProviderProfile';
import NearbyProviders from '../components/NearbyProviders/NearbyProviders';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Dashboard wrapper component to handle the default route
const Dashboard = () => {
    return (
        <ProtectedRoute>
            <Provider />
        </ProtectedRoute>
    );
};

export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <LandingPage />,
            },
            {
                path: "login",
                element: <LoginFormPage />,
            },
            {
                path: "signup",
                element: <SignupFormPage />,
            },
            {
                path: "listings",
                element: <ProtectedRoute><FoodListing /></ProtectedRoute>,
            },
            {
                path: "centers",
                element: <ProtectedRoute><DistributionCenters /></ProtectedRoute>,
            },
            {
                path: "providers",
                children: [
                    {
                        path: "nearby",
                        element: <NearbyProviders />,
                    },
                    {
                        path: ":id",
                        element: <ProtectedRoute><ProviderProfile /></ProtectedRoute>,
                    }
                ]
            },
            {
                path: "dashboard",
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: "admin",
                        element: <ProtectedRoute userType="admin"><Admin /></ProtectedRoute>,
                    },
                    {
                        path: "provider",
                        element: <ProtectedRoute userType="provider"><Provider /></ProtectedRoute>,
                    },
                    {
                        path: "recipient",
                        element: <ProtectedRoute userType="recipient"><Recipient /></ProtectedRoute>,
                    }
                ]
            },
            {
                path: "provider/profile",
                element: <ProtectedRoute><ProviderProfile /></ProtectedRoute>,
            }
        ],
    },
]);