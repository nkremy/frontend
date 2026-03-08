import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext/AuthContext";
import { ToastProvider } from "./components/Toast/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { Layout } from "./components/Layout/Layout";
import { Login } from "./pages/Login/Login";
import { Prospects } from "./pages/Prospects/Prospects";
import { ProspectDetail } from "./pages/ProspectDetail/ProspectDetail";
import { Messages } from "./pages/Messages/Messages";
import { Besoins } from "./pages/Besoins/Besoins";
import { Services } from "./pages/Services/Services";
import { Analyses } from "./pages/Analyses/Analyses";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { Formulaire } from "./pages/Formulaire/Formulaire";
import "./index.css";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <ProtectedLayout><Dashboard /></ProtectedLayout> },
  { path: "/login", element: <Login /> },
  { path: "/formulaire", element: <Formulaire /> },   // Page publique — pas de ProtectedRoute
  { path: "/prospects", element: <ProtectedLayout><Prospects /></ProtectedLayout> },
  { path: "/prospects/:id", element: <ProtectedLayout><ProspectDetail /></ProtectedLayout> },
  { path: "/messages", element: <ProtectedLayout><Messages /></ProtectedLayout> },
  { path: "/besoins", element: <ProtectedLayout><Besoins /></ProtectedLayout> },
  { path: "/services", element: <ProtectedLayout><Services /></ProtectedLayout> },
  { path: "/analyses", element: <ProtectedLayout><Analyses /></ProtectedLayout> },
]);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
