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
import About from '../components/About/About';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import Privacy from '../components/Privacy/Privacy';
import Terms from '../components/Terms/Terms';
import FAQ from '../components/FAQ/FAQ';

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
                path: "signup",
                element: <SignupFormPage />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "how-it-works",
                element: <HowItWorks />,
            },
            {
                path: "privacy",
                element: <Privacy />,
            },
            {
                path: "terms",
                element: <Terms />,
            },
            {
                path: "faq",
                element: <FAQ />,
            },
            {
                path: "listings",
                element: <FoodListing />,
            },
            {
                path: "centers",
                element: <DistributionCenters />,
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