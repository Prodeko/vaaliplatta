import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Admin from './pages/admin.tsx';
import Login from './pages/login.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AppStateProvider } from './context/AppContext.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppStateProvider><App /></AppStateProvider>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute><Admin /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <Login />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
