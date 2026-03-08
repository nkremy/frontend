import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import { Modal, ConfirmModal } from "../../components/Modal/Modal";
import "./ProspectDetail.css";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function typeBadge(type) {
  const map = {
    EMAIL:    "badge--blue",
    WHATSAPP: "badge--green",
    FACEBOOK: "badge--blue",
    SMS:      "badge--orange",
    APPEL:    "badge--pink",
  };
  return map[type?.toUpperCase()] || "badge--gray";
}

export function ProspectDetail() {
  const { id } = useParams();
  const [prospect, setProspect] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("messages");
  const [search, setSearch] = useState("");

  // Modals
  const [showAddMsg, setShowAddMsg] = useState(false);
  const [showAddBesoin, setShowAddBesoin] = useState(false);
  const [editMsg, setEditMsg] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        apiFetch(`/prospects/${id}`),
        apiFetch("/services"),
      ]);
      setProspect(p);
      setServices(s);
    } catch (err) {
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMessage(form) {
    try {
      const data = await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify({ ...form, prospectId: Number(id) }),
      });
      setProspect((p) => ({ ...p, messages: [...(p.messages || []), data] }));
      setShowAddMsg(false);
      toast.success("Message enregistré !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout du message");
    }
  }

  async function handleUpdateMessage(form, msgId) {
    try {
      const data = await apiFetch(`/messages/${msgId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setProspect((p) => ({
        ...p,
        messages: p.messages.map((m) => (m.id === msgId ? data : m)),
      }));
      setEditMsg(null);
      toast.success("Message modifié !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification");
    }
  }

  async function handleDeleteMessage(msgId) {
    try {
      await apiFetch(`/messages/${msgId}`, { method: "DELETE" });
      setProspect((p) => ({
        ...p,
        messages: p.messages.filter((m) => m.id !== msgId),
      }));
      setDeleteMsg(null);
      toast.success("Message supprimé");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  }

  async function handleAddBesoin(form) {
    try {
      const data = await apiFetch("/besoins", {
        method: "POST",
        body: JSON.stringify({ ...form, prospect_id: Number(id) }),
      });
      setProspect((p) => ({ ...p, besoins: [...(p.besoins || []), data] }));
      setShowAddBesoin(false);
      toast.success("Besoin enregistré !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout du besoin");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-container">
          <div className="spinner" />
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Prospect introuvable</p>
          <Link to="/prospects" className="btn btn--primary btn--sm">Retour</Link>
        </div>
      </div>
    );
  }

  const messages = prospect.messages || [];
  const besoins = prospect.besoins || [];

  const filteredMessages = messages.filter(
    (m) =>
      m.contenu?.toLowerCase().includes(search.toLowerCase()) ||
      m.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* Back */}
      <Link to="/prospects" className="back-link">
        ← Retour aux prospects
      </Link>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-card__avatar">
          {(prospect.name || prospect.email || "?").charAt(0).toUpperCase()}
        </div>
        <div className="profile-card__info">
          <h1 className="profile-card__name">{prospect.name || "Sans nom"}</h1>
          <div className="profile-card__details">
            <span>📧 {prospect.email}</span>
            {prospect.phone && <span>📞 {prospect.phone}</span>}
            <span>📅 Inscrit le {formatDate(prospect.dateCreation)}</span>
          </div>
          <div className="profile-card__stats">
            <div className="profile-stat">
              <span className="profile-stat__val">{messages.length}</span>
              <span className="profile-stat__lbl">Messages</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__val">{besoins.length}</span>
              <span className="profile-stat__lbl">Besoins</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat__val">
                {besoins.reduce((s, b) => s + (b.services?.length || 0), 0)}
              </span>
              <span className="profile-stat__lbl">Services liés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "messages" ? "tab-btn--active" : ""}`}
          onClick={() => setTab("messages")}
        >
          Messages ({messages.length})
        </button>
        <button
          className={`tab-btn ${tab === "besoins" ? "tab-btn--active" : ""}`}
          onClick={() => setTab("besoins")}
        >
          Besoins ({besoins.length})
        </button>
      </div>

      {/* Tab : Messages */}
      {tab === "messages" && (
        <div>
          <div className="toolbar">
            <div className="search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9090a8" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                placeholder="Rechercher dans les messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => setShowAddMsg(true)}>
              ＋ Nouveau message
            </button>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Aucun message pour ce prospect</p>
              <button className="btn btn--primary btn--sm" onClick={() => setShowAddMsg(true)}>
                Enregistrer un message
              </button>
            </div>
          ) : (
            <div className="card-list">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  className="card msg-card card--clickable"
                  onClick={() => setSelectedMsg(m)}
                >
                  <div className="msg-card__inner">
                    <div className="msg-card__left">
                      <span className={`badge ${typeBadge(m.type)}`}>{m.type}</span>
                      <p className="msg-card__content">{m.contenu}</p>
                      <span className="msg-card__date">{formatDate(m.dateCreation)}</span>
                    </div>
                    <div className="msg-card__right" onClick={(e) => e.stopPropagation()}>
                      {m.reponses?.length > 0 && (
                        <span className="badge badge--green">
                          {m.reponses.length} réponse{m.reponses.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {m.analyse && (
                        <span className="badge badge--orange">Analysé</span>
                      )}
                      <button className="btn btn--icon" title="Modifier" onClick={() => setEditMsg(m)}>✏️</button>
                      <button className="btn btn--icon" title="Supprimer" onClick={() => setDeleteMsg(m)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab : Besoins */}
      {tab === "besoins" && (
        <div>
          <div className="toolbar">
            <button className="btn btn--primary btn--sm" onClick={() => setShowAddBesoin(true)}>
              ＋ Nouveau besoin
            </button>
          </div>

          {besoins.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                <path d="M9 11l3 3L22 4"/>
              </svg>
              <p>Aucun besoin identifié pour ce prospect</p>
              <button className="btn btn--primary btn--sm" onClick={() => setShowAddBesoin(true)}>
                Ajouter un besoin
              </button>
            </div>
          ) : (
            <div className="card-list">
              {besoins.map((b) => (
                <div key={b.id} className="card besoin-card">
                  <div className="besoin-card__inner">
                    <div className="besoin-card__header">
                      <h3 className="besoin-card__name">{b.name}</h3>
                      <span className="besoin-card__date">{formatDate(b.date)}</span>
                    </div>
                    <p className="besoin-card__desc">{b.description}</p>
                    {b.services?.length > 0 && (
                      <div className="tag-list" style={{ marginTop: 8 }}>
                        {b.services.map((s) => (
                          <span key={s.id} className="badge badge--pink">{s.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Voir message */}
      {selectedMsg && (
        <Modal title="Détail du message" onClose={() => setSelectedMsg(null)} size="lg">
          <div className="msg-detail">
            <div className="msg-detail__row">
              <span className="msg-detail__label">Canal</span>
              <span className={`badge ${typeBadge(selectedMsg.type)}`}>{selectedMsg.type}</span>
            </div>
            <div className="msg-detail__row">
              <span className="msg-detail__label">Date</span>
              <span>{formatDate(selectedMsg.dateCreation)}</span>
            </div>
            {selectedMsg.gmailId && (
              <div className="msg-detail__row">
                <span className="msg-detail__label">Gmail ID</span>
                <span className="msg-detail__mono">{selectedMsg.gmailId}</span>
              </div>
            )}
            <div className="msg-detail__row msg-detail__row--col">
              <span className="msg-detail__label">Contenu</span>
              <div className="msg-detail__content">{selectedMsg.contenu}</div>
            </div>
            {selectedMsg.analyse && (
              <div className="msg-detail__row msg-detail__row--col">
                <span className="msg-detail__label">Analyse</span>
                <div className="msg-detail__analyse">
                  <div><strong>Catégorie :</strong> {selectedMsg.analyse.categories}</div>
                  <div><strong>Description :</strong> {selectedMsg.analyse.description}</div>
                  <div>
                    <strong>Confiance :</strong>{" "}
                    <span className="badge badge--green">
                      {Math.round((selectedMsg.analyse.confiance || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            {selectedMsg.reponses?.length > 0 && (
              <div className="msg-detail__row msg-detail__row--col">
                <span className="msg-detail__label">Réponses ({selectedMsg.reponses.length})</span>
                <div className="msg-detail__reponses">
                  {selectedMsg.reponses.map((r) => (
                    <div key={r.id} className="msg-detail__reponse">
                      <div className="msg-detail__reponse-header">
                        <span className={`badge ${typeBadge(r.type)}`}>{r.type}</span>
                        <span className="msg-card__date">{formatDate(r.dateEnvoi)}</span>
                      </div>
                      <p>{r.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Ajouter message */}
      {showAddMsg && (
        <Modal title="Enregistrer un message" onClose={() => setShowAddMsg(false)}>
          <MessageForm onSubmit={handleAddMessage} onCancel={() => setShowAddMsg(false)} />
        </Modal>
      )}

      {/* Modal: Modifier message */}
      {editMsg && (
        <Modal title="Modifier le message" onClose={() => setEditMsg(null)}>
          <MessageForm
            initial={editMsg}
            onSubmit={(form) => handleUpdateMessage(form, editMsg.id)}
            onCancel={() => setEditMsg(null)}
          />
        </Modal>
      )}

      {/* Confirm delete message */}
      {deleteMsg && (
        <ConfirmModal
          message={`Supprimer ce message "${deleteMsg.contenu?.slice(0, 60)}..." ?`}
          onConfirm={() => handleDeleteMessage(deleteMsg.id)}
          onCancel={() => setDeleteMsg(null)}
        />
      )}

      {/* Modal: Ajouter besoin */}
      {showAddBesoin && (
        <Modal title="Ajouter un besoin" onClose={() => setShowAddBesoin(false)}>
          <BesoinForm
            services={services}
            onSubmit={handleAddBesoin}
            onCancel={() => setShowAddBesoin(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function MessageForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type: initial.type || "EMAIL",
    contenu: initial.contenu || "",
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (form.contenu) onSubmit(form); }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div className="form-group">
        <label>Canal de réception</label>
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
          <option value="EMAIL">Email</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="SMS">SMS</option>
          <option value="APPEL">Appel téléphonique</option>
        </select>
      </div>
      <div className="form-group">
        <label>Contenu du message *</label>
        <textarea
          placeholder="Saisir le contenu du message reçu..."
          value={form.contenu}
          required
          onChange={(e) => setForm((p) => ({ ...p, contenu: e.target.value }))}
        />
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary">Enregistrer</button>
      </div>
    </form>
  );
}

function BesoinForm({ services, onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: "", description: "", serviceIds: [] });

  function toggleService(sid) {
    const idStr = String(sid);
    setForm((p) => ({
      ...p,
      serviceIds: p.serviceIds.includes(idStr)
        ? p.serviceIds.filter((s) => s !== idStr)
        : [...p.serviceIds, idStr],
    }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (form.name) onSubmit(form); }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div className="form-group">
        <label>Nom du besoin *</label>
        <input
          type="text"
          placeholder="Ex : Création de site web"
          value={form.name}
          required
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Décrivez le besoin exprimé par le prospect..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>
      {services.length > 0 && (
        <div className="form-group">
          <label>Services associés</label>
          <div className="service-checkboxes">
            {services.map((s) => (
              <label key={s.id} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={form.serviceIds.includes(String(s.id))}
                  onChange={() => toggleService(s.id)}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="modal__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary">Enregistrer</button>
      </div>
    </form>
  );
}
