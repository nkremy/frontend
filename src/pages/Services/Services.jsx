import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useToast } from "../../components/Toast/Toast";
import { Modal, ConfirmModal } from "../../components/Modal/Modal";
import "./Services.css";

export function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const toast = useToast();

  useEffect(() => { loadServices(); }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const data = await apiFetch("/services");
      setServices(data);
    } catch (err) {
      toast.error("Impossible de charger les services");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(form) {
    try {
      const data = await apiFetch("/services", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setServices((p) => [...p, data]);
      setShowAdd(false);
      toast.success("Service ajouté !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'ajout");
    }
  }

  async function handleUpdate(form, id) {
    try {
      const data = await apiFetch(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setServices((p) => p.map((s) => (s.id === id ? data : s)));
      setEditItem(null);
      toast.success("Service modifié !");
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification");
    }
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/services/${id}`, { method: "DELETE" });
      setServices((p) => p.filter((s) => s.id !== id));
      setDeleteItem(null);
      toast.success("Service supprimé");
    } catch (err) {
      toast.error(err.message || "Erreur de suppression");
    }
  }

  const filtered = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">Catalogue des services proposés par GNO Solutions</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAdd(true)}>
          ＋ Nouveau service
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
          </div>
          <div>
            <div className="stat-card__value">{services.length}</div>
            <div className="stat-card__label">Services actifs</div>
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
              {services.reduce((s, svc) => s + (svc.besoins?.length || 0), 0)}
            </div>
            <div className="stat-card__label">Demandes reçues</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9090a8" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Rechercher un service..."
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

      {loading ? (
        <div className="loading-container"><div className="spinner" /><span>Chargement...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
          </svg>
          <p>{search ? "Aucun service ne correspond" : "Aucun service enregistré"}</p>
          {!search && (
            <button className="btn btn--primary btn--sm" onClick={() => setShowAdd(true)}>
              Ajouter le premier service
            </button>
          )}
        </div>
      ) : (
        <div className="services-grid">
          {filtered.map((s) => (
            <div key={s.id} className="service-card card">
              <div className="service-card__icon">
                {s.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div className="service-card__body">
                <h3 className="service-card__name">{s.name}</h3>
                <p className="service-card__desc">
                  {s.description || <em style={{ color: "#b0b0c8" }}>Aucune description</em>}
                </p>
                {s.besoins?.length > 0 && (
                  <span className="badge badge--pink" style={{ marginTop: 6 }}>
                    {s.besoins.length} demande{s.besoins.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="service-card__actions">
                <button className="btn btn--icon" title="Modifier" onClick={() => setEditItem(s)}>✏️</button>
                <button className="btn btn--icon" title="Supprimer" onClick={() => setDeleteItem(s)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Ajouter un service" onClose={() => setShowAdd(false)}>
          <ServiceForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editItem && (
        <Modal title="Modifier le service" onClose={() => setEditItem(null)}>
          <ServiceForm
            initial={editItem}
            onSubmit={(form) => handleUpdate(form, editItem.id)}
            onCancel={() => setEditItem(null)}
          />
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Supprimer le service "${deleteItem.name}" ? Tous les besoins associés seront impactés.`}
          onConfirm={() => handleDelete(deleteItem.id)}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}

function ServiceForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    description: initial.description || "",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (form.name) onSubmit(form); }}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="form-group">
        <label>Nom du service *</label>
        <input type="text" placeholder="Ex : Développement web" value={form.name} required
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea placeholder="Décrivez ce service..." value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="modal__actions">
        <button type="button" className="btn btn--outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary">{initial.id ? "Enregistrer" : "Ajouter"}</button>
      </div>
    </form>
  );
}
