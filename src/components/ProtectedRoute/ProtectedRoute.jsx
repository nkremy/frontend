import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        <span>Chargement...</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
