import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/AuthContext";
import { useToast } from "../../components/Toast/Toast";
import "./Login.css";

export function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Connexion réussie !");
      navigate("/prospects");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">G</div>
          <h1>GNO Solutions</h1>
          <p>Système de gestion des prospects et de la communication client</p>
        </div>
        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature__icon">👥</span>
            <span>Gestion centralisée des prospects</span>
          </div>
          <div className="login-feature">
            <span className="login-feature__icon">💬</span>
            <span>Suivi des messages et échanges</span>
          </div>
          <div className="login-feature">
            <span className="login-feature__icon">📋</span>
            <span>Analyse des besoins clients</span>
          </div>
          <div className="login-feature">
            <span className="login-feature__icon">⚙️</span>
            <span>Gestion des services offerts</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card__header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace de gestion</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Adresse email</label>
              <input
                type="email"
                placeholder="admin@gno.cm"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn--primary login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="login-hint">
            <p>
              <strong>Démo :</strong> admin@gno.cm / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
