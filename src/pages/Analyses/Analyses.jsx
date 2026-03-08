import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import "./Analyses.css";

// ── Icônes SVG inline ──────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
function IconBrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04"/>
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconReply() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function confianceColor(val) {
  if (val >= 0.75) return "badge-success";
  if (val >= 0.5)  return "badge-warning";
  return "badge-danger";
}

function confianceLabel(val) {
  if (val >= 0.75) return "Haute";
  if (val >= 0.5)  return "Moyenne";
  return "Faible";
}

function canalBadge(type) {
  const map = {
    EMAIL: "badge-email",
    WHATSAPP: "badge-whatsapp",
    FACEBOOK: "badge-facebook",
    SMS: "badge-sms",
    APPEL: "badge-appel",
  };
  return map[(type || "").toUpperCase()] || "badge-default";
}

// ── Composant Détail Analyse (modal) ──────────────────────────
function AnalyseDetail({ analyse, onClose }) {
  const message  = analyse.message;
  const prospect = message?.prospect;
  const reponses = message?.reponses || [];

  return (
    <div className="analyse-modal-overlay" onClick={onClose}>
      <div className="analyse-modal-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="amodal-header">
          <div className="amodal-header-left">
            <div className="amodal-icon"><IconBrain /></div>
            <div>
              <h2 className="amodal-title">Analyse #{analyse.id}</h2>
              <span className="amodal-date">{formatDate(analyse.dateAnalyse)}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><IconClose /></button>
        </div>

        <div className="amodal-body">

          {/* Bloc Analyse */}
          <section className="amodal-section">
            <h3 className="amodal-section-title">🧠 Résultat de l'analyse</h3>
            <div className="amodal-analyse-grid">
              <div className="amodal-field">
                <span className="amodal-label">Catégories</span>
                <div className="amodal-cats">
                  {analyse.categories
                    ? analyse.categories.split(",").map((c, i) => (
                        <span key={i} className="cat-tag">{c.trim()}</span>
                      ))
                    : <span className="text-muted">—</span>}
                </div>
              </div>
              <div className="amodal-field">
                <span className="amodal-label">Niveau de confiance</span>
                <div className="confiance-bar-wrap">
                  <span className={`badge ${confianceColor(analyse.confiance)}`}>
                    {confianceLabel(analyse.confiance)} ({Math.round((analyse.confiance || 0) * 100)}%)
                  </span>
                  <div className="confiance-bar">
                    <div
                      className={`confiance-fill ${confianceColor(analyse.confiance)}`}
                      style={{ width: `${Math.round((analyse.confiance || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {analyse.description && (
              <div className="amodal-field" style={{ marginTop: "1rem" }}>
                <span className="amodal-label">Description</span>
                <p className="amodal-desc">{analyse.description}</p>
              </div>
            )}
          </section>

          {/* Bloc Message source */}
          {message && (
            <section className="amodal-section">
              <h3 className="amodal-section-title"><IconMessage /> Message analysé</h3>
              <div className="amodal-message-card">
                <div className="amodal-message-meta">
                  <span className={`badge ${canalBadge(message.type)}`}>{message.type}</span>
                  <span className="text-muted">{formatDate(message.dateCreation)}</span>
                  {prospect && (
                    <Link
                      to={`/prospects/${prospect.id}`}
                      className="amodal-prospect-link"
                      onClick={onClose}
                    >
                      <IconUser /> {prospect.name}
                    </Link>
                  )}
                </div>
                <p className="amodal-message-contenu">{message.contenu}</p>
              </div>
            </section>
          )}

          {/* Bloc Réponses */}
          <section className="amodal-section">
            <h3 className="amodal-section-title">
              <IconReply /> Réponses ({reponses.length})
            </h3>
            {reponses.length === 0 ? (
              <p className="text-muted amodal-empty">Aucune réponse associée à ce message.</p>
            ) : (
              <div className="amodal-reponses-list">
                {reponses.map((rep) => (
                  <div key={rep.id} className="amodal-reponse-card">
                    <div className="amodal-reponse-header">
                      <span className={`badge ${canalBadge(rep.type)}`}>{rep.type || "—"}</span>
                      <span className="text-muted">{formatDate(rep.dateEnvoi)}</span>
                    </div>
                    <p className="amodal-reponse-contenu">{rep.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

// ── Page principale Analyses ───────────────────────────────────
export function Analyses() {
  const { toast } = useToast();
  const [analyses, setAnalyses]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [dateDebut, setDateDebut]   = useState("");
  const [dateFin, setDateFin]       = useState("");
  const [selected, setSelected]     = useState(null);

  // Charger toutes les analyses
  useEffect(() => {
    setLoading(true);
    apiFetch("/analyses")
      .then(data => {
        setAnalyses(data);
        setFiltered(data);
      })
      .catch(() => toast.error("Erreur lors du chargement des analyses"))
      .finally(() => setLoading(false));
  }, []);

  // Filtrer en temps réel
  useEffect(() => {
    let result = [...analyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        (a.categories || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q) ||
        (a.message?.contenu || "").toLowerCase().includes(q) ||
        (a.message?.prospect?.name || "").toLowerCase().includes(q) ||
        (a.message?.type || "").toLowerCase().includes(q)
      );
    }

    if (dateDebut) {
      result = result.filter(a => new Date(a.dateAnalyse) >= new Date(dateDebut));
    }
    if (dateFin) {
      // inclure toute la journée de fin
      const fin = new Date(dateFin);
      fin.setHours(23, 59, 59, 999);
      result = result.filter(a => new Date(a.dateAnalyse) <= fin);
    }

    setFiltered(result);
  }, [search, dateDebut, dateFin, analyses]);

  // Stats
  const stats = {
    total: analyses.length,
    haute:   analyses.filter(a => (a.confiance || 0) >= 0.75).length,
    moyenne: analyses.filter(a => (a.confiance || 0) >= 0.5 && (a.confiance || 0) < 0.75).length,
    faible:  analyses.filter(a => (a.confiance || 0) < 0.5).length,
  };

  const resetFiltres = () => {
    setSearch("");
    setDateDebut("");
    setDateFin("");
  };

  const hasFiltres = search || dateDebut || dateFin;

  return (
    <div className="page-container">

      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyses IA</h1>
          <p className="page-subtitle">Résultats générés automatiquement par l'agent</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total analyses</div>
        </div>
        <div className="stat-card stat-card--success">
          <div className="stat-number">{stats.haute}</div>
          <div className="stat-label">Confiance haute ≥75%</div>
        </div>
        <div className="stat-card stat-card--warning">
          <div className="stat-number">{stats.moyenne}</div>
          <div className="stat-label">Confiance moyenne</div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-number">{stats.faible}</div>
          <div className="stat-label">Confiance faible</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <IconSearch />
          <input
            className="search-input"
            type="text"
            placeholder="Rechercher par catégorie, description, message, prospect..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="date-filters">
          <div className="date-filter-group">
            <label className="date-label">Du</label>
            <input
              type="date"
              className="input date-input"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
            />
          </div>
          <div className="date-filter-group">
            <label className="date-label">Au</label>
            <input
              type="date"
              className="input date-input"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
            />
          </div>
          {hasFiltres && (
            <button className="btn btn-secondary btn-sm" onClick={resetFiltres}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="results-info">
        <span><IconFilter /> {filtered.length} analyse{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Chargement des analyses...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <h3>Aucune analyse trouvée</h3>
          <p>{hasFiltres ? "Essayez d'autres critères de recherche." : "Aucune analyse n'a encore été générée."}</p>
        </div>
      ) : (
        <div className="analyses-grid">
          {filtered.map(analyse => {
            const message  = analyse.message;
            const prospect = message?.prospect;
            const nbRep    = message?.reponses?.length || 0;
            return (
              <div
                key={analyse.id}
                className="analyse-card"
                onClick={() => setSelected(analyse)}
              >
                {/* Header card */}
                <div className="acard-header">
                  <div className="acard-id">#{analyse.id}</div>
                  <span className={`badge ${confianceColor(analyse.confiance)}`}>
                    {confianceLabel(analyse.confiance)} — {Math.round((analyse.confiance || 0) * 100)}%
                  </span>
                </div>

                {/* Barre de confiance */}
                <div className="acard-confiance-bar">
                  <div
                    className={`confiance-fill ${confianceColor(analyse.confiance)}`}
                    style={{ width: `${Math.round((analyse.confiance || 0) * 100)}%` }}
                  />
                </div>

                {/* Catégories */}
                <div className="acard-cats">
                  {(analyse.categories || "").split(",").slice(0, 3).map((c, i) => (
                    <span key={i} className="cat-tag">{c.trim()}</span>
                  ))}
                </div>

                {/* Description */}
                {analyse.description && (
                  <p className="acard-desc">{analyse.description}</p>
                )}

                {/* Message source */}
                {message && (
                  <div className="acard-message">
                    <div className="acard-message-meta">
                      <span className={`badge badge-sm ${canalBadge(message.type)}`}>{message.type}</span>
                      {prospect && (
                        <span className="acard-prospect">
                          <IconUser /> {prospect.name}
                        </span>
                      )}
                    </div>
                    <p className="acard-message-preview">{message.contenu}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="acard-footer">
                  <span className="acard-date">{formatDate(analyse.dateAnalyse)}</span>
                  <span className="acard-reponses">
                    <IconReply /> {nbRep} réponse{nbRep !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <AnalyseDetail analyse={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
