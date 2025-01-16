import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import Layout from './Layout';
import LandingPage from '../components/LandingPage/LandingPage';
import { Admin, Provider, Recipient } from '../components/Dashboard';
import FoodListing from '../components/FoodListing/FoodListing';
import DistributionCenters from '../components/DistributionCenters/DistributionCenters';

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
        element: <FoodListing />,
      },
      {
        path: "centers",
        element: <DistributionCenters />,
      },
      {
        path: "dashboard",
        children: [
          {
            path: "admin",
            element: <Admin />,
          },
          {
            path: "provider",
            element: <Provider />,
          },
          {
            path: "recipient",
            element: <Recipient />,
          }
        ]
      }
    ],
  },
]
// // {
// //   future: {
// //     v7_startTransition: true,
// //     v7_relativeSplatPath: true
//  }
// }
);