import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Token temporaire — sera remplacé par JWT réel du backend
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMH0.fake_signature";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(email, password) {
    // Simulation authentification — à remplacer par appel API JWT réel
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "admin@gno.cm" && password === "admin123") {
          const userData = { name: "Administrateur", email, role: "ADMIN" };
          localStorage.setItem("token", FAKE_TOKEN);
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          resolve(userData);
        } else {
          reject(new Error("Email ou mot de passe incorrect"));
        }
      }, 800);
    });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
