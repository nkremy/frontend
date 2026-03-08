import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import "./Dashboard.css";

// ── Icônes ────────────────────────────────────────────────────
function IconUsers()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconMsg()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconBrain()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/></svg>; }
function IconReply()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>; }
function IconAlert()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function IconCheck()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>; }
function IconClock()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IconNeeds()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }

// ── Helpers ───────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, to }) {
  const content = (
    <div className={`dash-stat-card dash-stat-card--${color}`}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{value ?? "—"}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="dash-stat-link">{content}</Link> : content;
}

function ConfianceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 75 ? "success" : pct >= 50 ? "warning" : "danger";
  return (
    <div className="dash-confiance-wrap">
      <span className="dash-confiance-label">Confiance moyenne agent</span>
      <div className="dash-confiance-track">
        <div className={`dash-confiance-fill dash-confiance-fill--${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`dash-confiance-pct dash-confiance-pct--${color}`}>{pct}%</span>
    </div>
  );
}

function MessageStatutBar({ stats }) {
  const total = stats.totalMessages || 1;
  const items = [
    { key: "messagesRecus",     label: "Reçus",       color: "#94a3b8" },
    { key: "messagesEnAnalyse", label: "En analyse",  color: "#f59e0b" },
    { key: "messagesAnalyses",  label: "Analysés",    color: "#6366f1" },
    { key: "messagesRepondus",  label: "Répondus",    color: "#22c55e" },
    { key: "messagesAlerte",    label: "Alerte",      color: "#ef4444" },
  ];
  return (
    <div className="dash-statut-section">
      <h3 className="dash-section-title"><IconMsg /> Répartition des messages par statut</h3>
      <div className="dash-statut-bar">
        {items.map(item => {
          const val = stats[item.key] || 0;
          const pct = (val / total) * 100;
          return pct > 0 ? (
            <div
              key={item.key}
              className="dash-statut-segment"
              style={{ width: `${pct}%`, background: item.color }}
              title={`${item.label} : ${val}`}
            />
          ) : null;
        })}
      </div>
      <div className="dash-statut-legend">
        {items.map(item => (
          <div key={item.key} className="dash-legend-item">
            <span className="dash-legend-dot" style={{ background: item.color }} />
            <span className="dash-legend-label">{item.label}</span>
            <span className="dash-legend-count">{stats[item.key] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page Dashboard ────────────────────────────────────────────
export function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/dashboard")
      .then(data => setStats(data))
      .catch(() => toast.error("Impossible de charger le tableau de bord"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner" />
          <span>Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const hasAlertes = (stats.messagesAlerte || 0) > 0;

  return (
    <div className="page-container">

      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue d'ensemble du CRM et des décisions de l'agent IA</p>
        </div>
        {hasAlertes && (
          <div className="dash-alerte-banner">
            <IconAlert />
            <span>
              <strong>{stats.messagesAlerte}</strong> message{stats.messagesAlerte > 1 ? "s" : ""} nécessite{stats.messagesAlerte > 1 ? "nt" : ""} votre attention
            </span>
            <Link to="/messages" className="btn btn-sm btn-danger">Voir</Link>
          </div>
        )}
      </div>

      {/* Grille principale des statistiques */}
      <div className="dash-stats-grid">
        <StatCard
          icon={<IconUsers />}
          label="Prospects"
          value={stats.totalProspects}
          sub="enregistrés"
          color="primary"
          to="/prospects"
        />
        <StatCard
          icon={<IconMsg />}
          label="Messages"
          value={stats.totalMessages}
          sub={`${stats.messagesRecus || 0} non traité${stats.messagesRecus > 1 ? "s" : ""}`}
          color="blue"
          to="/messages"
        />
        <StatCard
          icon={<IconBrain />}
          label="Analyses IA"
          value={stats.totalAnalyses}
          sub={`${stats.totalAlertes || 0} alerte${stats.totalAlertes > 1 ? "s" : ""}`}
          color="purple"
          to="/analyses"
        />
        <StatCard
          icon={<IconReply />}
          label="Réponses envoyées"
          value={stats.totalReponses}
          color="green"
        />
        <StatCard
          icon={<IconNeeds />}
          label="Besoins identifiés"
          value={stats.totalBesoins}
          color="orange"
          to="/besoins"
        />
        <StatCard
          icon={<IconAlert />}
          label="Alertes actives"
          value={stats.messagesAlerte || 0}
          sub="nécessitent action humaine"
          color="danger"
          to="/messages"
        />
      </div>

      {/* Barre de progression agent IA */}
      <div className="dash-agent-card">
        <div className="dash-agent-header">
          <div className="dash-agent-icon"><IconBrain /></div>
          <div>
            <h3 className="dash-agent-title">Performance de l'agent IA</h3>
            <p className="dash-agent-sub">Basé sur {stats.totalAnalyses} analyse{stats.totalAnalyses !== 1 ? "s" : ""} enregistrée{stats.totalAnalyses !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="dash-agent-metrics">
          <ConfianceBar value={stats.confianceMoyenne} />
          <div className="dash-agent-chips">
            <div className="dash-chip dash-chip--success">
              <IconCheck />
              <span>{stats.messagesRepondus || 0} répondus automatiquement</span>
            </div>
            <div className="dash-chip dash-chip--warning">
              <IconClock />
              <span>{stats.messagesAnalyses || 0} en attente de réponse</span>
            </div>
            {hasAlertes && (
              <div className="dash-chip dash-chip--danger">
                <IconAlert />
                <span>{stats.messagesAlerte} alerte{stats.messagesAlerte > 1 ? "s" : ""} à traiter</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre de statut messages */}
      <div className="dash-card">
        <MessageStatutBar stats={stats} />
      </div>

      {/* Liens rapides */}
      <div className="dash-quicklinks">
        <h3 className="dash-section-title">Accès rapides</h3>
        <div className="dash-quicklinks-grid">
          {[
            { to: "/prospects", label: "Gérer les prospects",   icon: <IconUsers />,  color: "primary" },
            { to: "/messages",  label: "Voir les messages",      icon: <IconMsg />,    color: "blue"    },
            { to: "/analyses",  label: "Suivre les analyses IA", icon: <IconBrain />,  color: "purple"  },
            { to: "/besoins",   label: "Consulter les besoins",  icon: <IconNeeds />,  color: "orange" },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`dash-quicklink dash-quicklink--${item.color}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
