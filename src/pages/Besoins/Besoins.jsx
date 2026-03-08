import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import { Modal, ConfirmModal } from "../../components/Modal/Modal";
import "./Besoins.css";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function Besoins() {
  const [besoins, setBesoins] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [b, p, s] = await Promise.all([
        apiFetch("/besoins"),
        apiFetch("/prospects"),
        apiFetch("/services"),
      ]);
      setBesoins(b);
      setProspects(p);
      setServices(s);
    } catch (err) {
      toast.error("Impossible de charger les besoins");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(form) {
    try {
      const data = await apiFetch("/besoins", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setBesoins((p) => [...p, data]);
      setShowAdd(false);
      toast.success("Besoin ajouté !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout");
    }
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/besoins/${id}`, { method: "DELETE" });
      setBesoins((p) => p.filter((b) => b.id !== id));
      setDeleteItem(null);
      toast.success("Besoin supprimé");
    } catch (err) {
      toast.error(err.message || "Erreur de suppression");
    }
  }

  const filtered = besoins.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase()) ||
      b.prospect?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.prospect?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Besoins</h1>
          <p className="page-subtitle">Besoins exprimés par les prospects</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          ＋ Nouveau besoin
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__icon">📋</div>
          <div>
            <div className="stat-card__value">{besoins.length}</div>
            <div className="stat-card__label">Total besoins</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">⚙️</div>
          <div>
            <div className="stat-card__value">
              {besoins.reduce((s, b) => s + (b.services?.length || 0), 0)}
            </div>
            <div className="stat-card__label">Associations services</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">👥</div>
          <div>
            <div className="stat-card__value">
              {new Set(besoins.map((b) => b.prospect?.id).filter(Boolean)).size}
            </div>
            <div className="stat-card__label">Prospects concernés</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9090a8" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Rechercher un besoin ou prospect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Chargement...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p>Aucun besoin trouvé</p>
          {!search && (
            <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
              Ajouter le premier besoin
            </button>
          )}
        </div>
      ) : (
        <div className="card-list">
          {filtered.map((b) => (
            <div key={b.id} className="card besoin-row">
              <div className="besoin-row__inner">
                <div className="besoin-row__header">
                  <div>
                    <h3 className="besoin-row__name">{b.name}</h3>
                    {b.prospect && (
                      <Link to={`/prospects/${b.prospect.id}`} className="besoin-row__prospect">
                        👤 {b.prospect.name || b.prospect.email}
                      </Link>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="besoin-row__date">{formatDate(b.date)}</span>
                    <button className="btn btn--icon btn--sm" onClick={() => setDeleteItem(b)}>🗑️</button>
                  </div>
                </div>
                {b.description && (
                  <p className="besoin-row__desc">{b.description}</p>
                )}
                {b.services?.length > 0 && (
                  <div className="tag-list">
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

      {showAdd && (
        <Modal title="Ajouter un besoin" onClose={() => setShowAdd(false)}>
          <BesoinForm
            prospects={prospects}
            services={services}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Supprimer le besoin "${deleteItem.name}" ?`}
          onConfirm={() => handleDelete(deleteItem.id)}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}

function BesoinForm({ prospects, services, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "", description: "", prospect_id: "", serviceIds: [],
  });

  function toggleService(sid) {
    const s = String(sid);
    setForm((p) => ({
      ...p,
      serviceIds: p.serviceIds.includes(s)
        ? p.serviceIds.filter((x) => x !== s)
        : [...p.serviceIds, s],
    }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (form.name && form.prospect_id) onSubmit(form); }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-group">
        <label>Prospect *</label>
        <select value={form.prospect_id} required
          onChange={(e) => setForm((p) => ({ ...p, prospect_id: e.target.value }))}>
          <option value="">-- Sélectionner un prospect --</option>
          {prospects.map((p) => (
            <option key={p.id} value={p.id}>{p.name || p.email}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Nom du besoin *</label>
        <input type="text" placeholder="Ex : Création d'application mobile" value={form.name} required
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea placeholder="Décrivez le besoin..." value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>
      {services.length > 0 && (
        <div className="form-group">
          <label>Services associés</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto" }}>
            {services.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: "0.92rem" }}>
                <input type="checkbox" checked={form.serviceIds.includes(String(s.id))}
                  onChange={() => toggleService(s.id)} style={{ accentColor: "#e91e8c" }} />
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
