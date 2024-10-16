import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
// import Admin from './pages/admin.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
// import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AppStateProvider } from './context/AppContext.tsx';
import { LoginRedirectToOauth } from './pages/login.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppStateProvider><App /></AppStateProvider>,
  },
  // {
  //   path: "/admin",
  //   element: <ProtectedRoute><AppStateProvider><Admin /></AppStateProvider></ProtectedRoute>,
  // },
  {
    path: "/login",
    element: <LoginRedirectToOauth to={import.meta.env.VITE_API_URL + "/oauth2/login"} />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
