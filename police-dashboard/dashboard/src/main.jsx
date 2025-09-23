import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import Layout from './layout';
import Overview from './pages/Overview';
import Alerts from './pages/Alerts';
import PoliceMap from './pages/PoliceMap';  // This is your Tourists page
import Reports from './pages/Reports';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'alerts', element: <Alerts /> },
      { path: 'tourists', element: <PoliceMap /> }, // PoliceMap loads when clicking "Manage Tourists"
      { path: 'reports', element: <Reports /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);