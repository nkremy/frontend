import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import { Modal, ConfirmModal } from "../../components/Modal/Modal";
import "./Messages.css";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function typeBadge(type) {
  const map = { EMAIL: "badge--blue", WHATSAPP: "badge--green", FACEBOOK: "badge--purple", SMS: "badge--orange", APPEL: "badge--pink" };
  return map[type?.toUpperCase()] || "badge--gray";
}
function typeIcon(type) {
  return { EMAIL: "📧", WHATSAPP: "💬", FACEBOOK: "👥", SMS: "📱", APPEL: "📞" }[type?.toUpperCase()] || "✉️";
}

const STATUTS = {
  RECU:       { label: "Reçu",       css: "statut--recu",       dot: "#94a3b8" },
  EN_ANALYSE: { label: "En analyse", css: "statut--en-analyse", dot: "#f59e0b" },
  ANALYSE:    { label: "Analysé",    css: "statut--analyse",    dot: "#6366f1" },
  REPONDU:    { label: "Répondu",    css: "statut--repondu",    dot: "#22c55e" },
  ALERTE:     { label: "⚠ Alerte",   css: "statut--alerte",     dot: "#ef4444" },
};

function StatutBadge({ statut }) {
  const s = STATUTS[statut] || STATUTS.RECU;
  return (
    <span className={"statut-badge " + s.css}>
      <span className="statut-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function MessageDetailModal({ message, onClose }) {
  const { toast } = useToast();
  const [analyse, setAnalyse]   = useState(null);
  const [reponses, setReponses] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoadingDetails(true);
      try {
        const [ana, reps] = await Promise.allSettled([
          apiFetch("/messages/" + message.id + "/analyse"),
          apiFetch("/messages/" + message.id + "/reponses"),
        ]);
        if (ana.status === "fulfilled")  setAnalyse(ana.value);
        if (reps.status === "fulfilled") setReponses(reps.value);
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [message.id]);

  return (
    <Modal title={"Message #" + message.id} onClose={onClose} size="lg">
      <div className="msg-detail">
        <div className="msg-detail-meta">
          <span className={"badge " + typeBadge(message.type)}>{typeIcon(message.type)} {message.type}</span>
          <StatutBadge statut={message.statut || "RECU"} />
          <span className="text-muted">{formatDate(message.dateCreation)}</span>
        </div>
        {message.prospect && (
          <div className="msg-detail-prospect">
            <span className="msg-detail-field-label">Prospect</span>
            <Link to={"/prospects/" + message.prospect.id} className="msg-detail-prospect-link" onClick={onClose}>
              {message.prospect.name || message.prospect.email}
            </Link>
          </div>
        )}
        <div className="msg-detail-section">
          <span className="msg-detail-section-title">📨 Contenu du message</span>
          <div className="msg-detail-contenu">{message.contenu}</div>
        </div>
        <div className="msg-detail-section">
          <span className="msg-detail-section-title">🧠 Analyse de l'agent IA</span>
          {loadingDetails ? (
            <div className="msg-detail-loading"><div className="spinner spinner--sm" /> Chargement...</div>
          ) : analyse ? (
            <div className="msg-detail-analyse">
              <div className="msg-detail-analyse-row">
                <div className="msg-detail-field">
                  <span className="msg-detail-field-label">Catégories</span>
                  <div className="msg-detail-cats">
                    {(analyse.categories || "").split(",").map((c, i) => <span key={i} className="cat-tag">{c.trim()}</span>)}
                  </div>
                </div>
                <div className="msg-detail-field">
                  <span className="msg-detail-field-label">Confiance</span>
                  <div className="msg-detail-confiance">
                    <div className="mini-bar">
                      <div className="mini-bar-fill" style={{
                        width: Math.round((analyse.confiance || 0) * 100) + "%",
                        background: analyse.confiance >= 0.75 ? "#22c55e" : analyse.confiance >= 0.5 ? "#f59e0b" : "#ef4444",
                      }} />
                    </div>
                    <span>{Math.round((analyse.confiance || 0) * 100)}%</span>
                  </div>
                </div>
              </div>
              {analyse.alerteResponsable && (
                <div className="msg-detail-alerte-box">
                  ⚠️ <strong>Alerte :</strong> {analyse.raisonAlerte || "Intervention humaine requise"}
                </div>
              )}
              {analyse.description && (
                <div className="msg-detail-field" style={{ marginTop: "0.5rem" }}>
                  <span className="msg-detail-field-label">Description de l'analyse</span>
                  <p className="msg-detail-analyse-desc">{analyse.description}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted msg-detail-empty">Aucune analyse disponible pour ce message.</p>
          )}
        </div>
        <div className="msg-detail-section">
          <span className="msg-detail-section-title">💬 Réponses envoyées ({reponses.length})</span>
          {loadingDetails ? (
            <div className="msg-detail-loading"><div className="spinner spinner--sm" /> Chargement...</div>
          ) : reponses.length === 0 ? (
            <p className="text-muted msg-detail-empty">Aucune réponse envoyée.</p>
          ) : (
            <div className="msg-detail-reponses">
              {reponses.map(rep => (
                <div key={rep.id} className="msg-detail-reponse">
                  <div className="msg-detail-reponse-header">
                    <span className={"badge badge--sm " + typeBadge(rep.type)}>{rep.type || "—"}</span>
                    <span className="text-muted">{formatDate(rep.dateEnvoi)}</span>
                  </div>
                  <p className="msg-detail-reponse-contenu">{rep.contenu}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function Messages() {
  const [messages, setMessages]   = useState([]);
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterType, setFilterType]     = useState("TOUS");
  const [filterStatut, setFilterStatut] = useState("TOUS");
  const [showAdd, setShowAdd]         = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [deleteMsg, setDeleteMsg]     = useState(null);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [msgs, pros] = await Promise.all([apiFetch("/messages"), apiFetch("/prospects")]);
      setMessages(msgs); setProspects(pros);
    } catch { toast.error("Impossible de charger les messages"); }
    finally { setLoading(false); }
  }

  async function handleAdd(form) {
    try {
      const data = await apiFetch("/messages", { method: "POST", body: JSON.stringify(form) });
      setMessages(p => [data, ...p]); setShowAdd(false);
      toast.success("Message enregistré !");
    } catch (err) { toast.error(err.message || "Erreur"); }
  }

  async function handleDelete(id) {
    try {
      await apiFetch("/messages/" + id, { method: "DELETE" });
      setMessages(p => p.filter(m => m.id !== id)); setDeleteMsg(null);
      toast.success("Message supprimé");
    } catch (err) { toast.error(err.message || "Erreur"); }
  }

  const types   = ["TOUS", "EMAIL", "WHATSAPP", "FACEBOOK", "SMS", "APPEL"];
  const statuts = ["TOUS", "RECU", "EN_ANALYSE", "ANALYSE", "REPONDU", "ALERTE"];
  const alerteCount = messages.filter(m => m.statut === "ALERTE").length;

  const filtered = messages.filter(m => {
    const matchType   = filterType === "TOUS"   || m.type?.toUpperCase() === filterType;
    const matchStatut = filterStatut === "TOUS" || m.statut === filterStatut;
    const matchSearch = !search ||
      m.contenu?.toLowerCase().includes(search.toLowerCase()) ||
      m.prospect?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.prospect?.email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatut && matchSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Historique de tous les messages reçus</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Nouveau message</button>
      </div>

      {alerteCount > 0 && (
        <div className="messages-alerte-banner">
          ⚠️ <strong>{alerteCount}</strong> message{alerteCount > 1 ? "s" : ""} nécessite{alerteCount > 1 ? "nt" : ""} votre attention
          <button className="btn btn-sm btn-danger" onClick={() => setFilterStatut("ALERTE")}>Voir les alertes</button>
        </div>
      )}

      <div className="stats-grid">
        {types.filter(t => t !== "TOUS").map(t => (
          <div key={t} className={"stat-card" + (filterType === t ? " stat-card--active" : "")}
            style={{ cursor: "pointer" }} onClick={() => setFilterType(filterType === t ? "TOUS" : t)}>
            <div className="stat-number">{typeIcon(t)} {messages.filter(m => m.type?.toUpperCase() === t).length}</div>
            <div className="stat-label">{t}</div>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="Rechercher un message ou prospect..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="statut-filter-tabs">
          {statuts.map(s => (
            <button key={s}
              className={"statut-filter-tab" + (filterStatut === s ? " statut-filter-tab--active" : "") + (s === "ALERTE" && alerteCount > 0 ? " statut-filter-tab--danger" : "")}
              onClick={() => setFilterStatut(filterStatut === s ? "TOUS" : s)}>
              {s === "TOUS" ? "Tous" : (STATUTS[s]?.label || s)}
              {s !== "TOUS" && <span className="statut-filter-count">{messages.filter(m => m.statut === s).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="results-info">{filtered.length} message{filtered.length !== 1 ? "s" : ""}</div>

      {loading ? (
        <div className="loading-container"><div className="spinner"/><span>Chargement...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💬</div><h3>Aucun message trouvé</h3><p>Essayez d'autres filtres.</p></div>
      ) : (
        <div className="messages-list">
          {filtered.map(m => (
            <div key={m.id} className={"message-row" + (m.statut === "ALERTE" ? " message-row--alerte" : "")} onClick={() => setSelectedMsg(m)}>
              <div className="message-row-left">
                <span className={"badge " + typeBadge(m.type)}>{typeIcon(m.type)} {m.type}</span>
                <StatutBadge statut={m.statut || "RECU"} />
              </div>
              <div className="message-row-center">
                {m.prospect && (
                  <Link to={"/prospects/" + m.prospect.id} className="message-row-prospect" onClick={e => e.stopPropagation()}>
                    {m.prospect.name || m.prospect.email}
                  </Link>
                )}
                <p className="message-row-contenu">{m.contenu}</p>
              </div>
              <div className="message-row-right">
                <span className="message-row-date">{formatDate(m.dateCreation)}</span>
                <div className="message-row-indicators">
                  {m.analyse && <span className="indicator" title="Analysé">🧠</span>}
                  {m.reponses?.length > 0 && <span className="indicator" title="Réponses">{m.reponses.length} 💬</span>}
                </div>
                <button className="btn btn-icon" onClick={e => { e.stopPropagation(); setDeleteMsg(m); }} title="Supprimer">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMsg && <MessageDetailModal message={selectedMsg} onClose={() => setSelectedMsg(null)} />}
      {showAdd && <Modal title="Enregistrer un message" onClose={() => setShowAdd(false)}><AddMessageForm prospects={prospects} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} /></Modal>}
      {deleteMsg && <ConfirmModal message="Supprimer ce message ?" onConfirm={() => handleDelete(deleteMsg.id)} onCancel={() => setDeleteMsg(null)} />}
    </div>
  );
}

function AddMessageForm({ prospects, onSubmit, onCancel }) {
  const [form, setForm] = useState({ type: "EMAIL", contenu: "", prospectId: "" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Prospect *</label>
        <select className="input" value={form.prospectId} required onChange={e => setForm(p => ({ ...p, prospectId: e.target.value }))}>
          <option value="">-- Sélectionner un prospect --</option>
          {prospects.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Canal</label>
        <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
          <option value="EMAIL">📧 Email</option>
          <option value="WHATSAPP">💬 WhatsApp</option>
          <option value="FACEBOOK">👥 Facebook</option>
          <option value="SMS">📱 SMS</option>
          <option value="APPEL">📞 Appel téléphonique</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Contenu *</label>
        <textarea className="input" rows="4" placeholder="Saisir le contenu du message..." value={form.contenu} required onChange={e => setForm(p => ({ ...p, contenu: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn btn-primary" onClick={() => { if (form.contenu && form.prospectId) onSubmit(form); }}>Enregistrer</button>
      </div>
    </div>
  );
}
