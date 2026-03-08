import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import { Modal, ConfirmModal } from "../../components/Modal/Modal";
import "./Prospects.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(name, email) {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

export function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadProspects();
  }, []);

  async function loadProspects() {
    setLoading(true);
    try {
      const data = await apiFetch("/prospects");
      setProspects(data);
    } catch (err) {
      toast.error("Impossible de charger les prospects");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(form) {
    try {
      const data = await apiFetch("/prospects", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setProspects((prev) => [...prev, data]);
      setShowAdd(false);
      toast.success("Prospect ajouté avec succès !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout");
    }
  }

  async function handleUpdate(form, id) {
    try {
      const data = await apiFetch(`/prospects/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setProspects((prev) => prev.map((p) => (p.id === id ? data : p)));
      setEditItem(null);
      toast.success("Prospect modifié avec succès !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification");
    }
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/prospects/${id}`, { method: "DELETE" });
      setProspects((prev) => prev.filter((p) => p.id !== id));
      setDeleteItem(null);
      toast.success("Prospect supprimé");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  }

  const filtered = prospects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Prospects</h1>
          <p className="page-subtitle">
            Gérez vos prospects et suivez leurs interactions
          </p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          <span>＋</span> Nouveau prospect
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <div className="stat-card__value">{prospects.length}</div>
            <div className="stat-card__label">Total prospects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div className="stat-card__value">
              {prospects.reduce((s, p) => s + (p.messages?.length || 0), 0)}
            </div>
            <div className="stat-card__label">Messages reçus</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M9 11l3 3L22 4"/>
            </svg>
          </div>
          <div>
            <div className="stat-card__value">
              {prospects.reduce((s, p) => s + (p.besoins?.length || 0), 0)}
            </div>
            <div className="stat-card__label">Besoins identifiés</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9090a8" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Rechercher un prospect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <span className="badge badge--gray">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Chargement des prospects...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="52" height="52">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <p>
            {search ? "Aucun prospect ne correspond à votre recherche" : "Aucun prospect enregistré"}
          </p>
          {!search && (
            <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
              Ajouter le premier prospect
            </button>
          )}
        </div>
      ) : (
        <div className="card-list">
          {filtered.map((p) => (
            <div key={p.id} className="card prospect-card">
              <div className="prospect-card__inner">
                <div className="prospect-card__avatar">
                  {getInitials(p.name, p.email)}
                </div>
                <div className="prospect-card__info">
                  <Link to={`/prospects/${p.id}`} className="prospect-card__name">
                    {p.name || "Sans nom"}
                  </Link>
                  <span className="prospect-card__email">{p.email}</span>
                  <div className="prospect-card__meta">
                    <span className="badge badge--blue">
                      {p.messages?.length || 0} message{(p.messages?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="badge badge--pink">
                      {p.besoins?.length || 0} besoin{(p.besoins?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="prospect-card__date">
                      Inscrit le {formatDate(p.dateCreation)}
                    </span>
                  </div>
                </div>
                <div className="prospect-card__actions">
                  <Link to={`/prospects/${p.id}`} className="btn btn--sm btn--outline">
                    Voir détails
                  </Link>
                  <button
                    className="btn btn--icon btn--sm"
                    title="Modifier"
                    onClick={() => setEditItem(p)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn--icon btn--sm"
                    title="Supprimer"
                    onClick={() => setDeleteItem(p)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <Modal title="Ajouter un prospect" onClose={() => setShowAdd(false)}>
          <ProspectForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editItem && (
        <Modal title="Modifier le prospect" onClose={() => setEditItem(null)}>
          <ProspectForm
            initial={editItem}
            onSubmit={(form) => handleUpdate(form, editItem.id)}
            onCancel={() => setEditItem(null)}
          />
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Voulez-vous vraiment supprimer le prospect "${deleteItem.name || deleteItem.email}" ? Cette action est irréversible.`}
          onConfirm={() => handleDelete(deleteItem.id)}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}

function ProspectForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="form-row">
        <div className="form-group">
          <label>Nom complet</label>
          <input
            type="text"
            placeholder="Jean Dupont"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="tel"
            placeholder="+237 6XX XXX XXX"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input
          type="email"
          placeholder="contact@exemple.cm"
          value={form.email}
          required
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div className="modal__actions" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn--outline" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn--primary">
          {initial.id ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
