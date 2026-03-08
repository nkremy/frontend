import { useEffect, useState } from "react";
import "./Formulaire.css";

const API_BASE = "http://localhost:8080/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

// ── Étapes du formulaire ──────────────────────────────────────
const ETAPES = [
  { id: 1, label: "Identification" },
  { id: 2, label: "Vos besoins"   },
  { id: 3, label: "Détails"       },
  { id: 4, label: "Confirmation"  },
];

const URGENCES = [
  { value: "NORMAL",      label: "Normal",      desc: "Pas de délai particulier", color: "#22c55e" },
  { value: "URGENT",      label: "Urgent",      desc: "Dans les prochains jours",  color: "#f59e0b" },
  { value: "TRES_URGENT", label: "Très urgent", desc: "Le plus tôt possible",      color: "#ef4444" },
];

const CANAUX = [
  { value: "EMAIL",    label: "📧 Email"    },
  { value: "WHATSAPP", label: "💬 WhatsApp" },
  { value: "FACEBOOK", label: "👥 Facebook" },
  { value: "SMS",      label: "📱 SMS"      },
  { value: "APPEL",    label: "📞 Appel"    },
];

const SOURCES = [
  "Recommandation d'un proche",
  "Réseaux sociaux",
  "Site internet",
  "Bouche à oreille",
  "Publicité",
  "Autre",
];

// ── Composant ProgressBar ─────────────────────────────────────
function ProgressBar({ etape, total }) {
  return (
    <div className="form-progress">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const done    = n < etape;
        const current = n === etape;
        return (
          <div key={n} className="form-progress-step">
            <div className={`form-progress-dot ${done ? "done" : current ? "current" : ""}`}>
              {done ? "✓" : n}
            </div>
            <span className={`form-progress-label ${current ? "current" : ""}`}>
              {ETAPES[i].label}
            </span>
            {i < total - 1 && <div className={`form-progress-line ${done ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export function Formulaire() {
  const [etape, setEtape]       = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  // Données du formulaire
  const [form, setForm] = useState({
    // Étape 1 — Identification
    email:       "",
    nom:         "",
    telephone:   "",
    canal:       "EMAIL",
    source:      "",

    // Étape 2 — Besoins
    servicesSelectionnes: [],   // ids des services choisis
    descriptionLibre:     "",   // besoin en texte libre

    // Étape 3 — Détails
    urgence:     "NORMAL",
    message:     "",            // message d'introduction / contexte
    disponibilite: "",          // quand le prospect est disponible

    // Consentement
    accepte: false,
  });

  // Charger les services disponibles
  useEffect(() => {
    apiFetch("/services")
      .then(data => setServices(data || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleService(id) {
    const sel = form.servicesSelectionnes;
    set("servicesSelectionnes",
      sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]
    );
  }

  // Validation par étape
  function canNext() {
    if (etape === 1) return form.email.trim() && form.email.includes("@");
    if (etape === 2) return form.servicesSelectionnes.length > 0 || form.descriptionLibre.trim().length >= 10;
    if (etape === 3) return true;
    return true;
  }

  // Soumission finale
  async function handleSubmit() {
    if (!form.accepte) { setError("Veuillez accepter les conditions d'utilisation."); return; }
    setError("");
    setSubmitting(true);
    try {
      // 1. Trouver ou créer le prospect par email
      let prospect;
      try {
        prospect = await apiFetch(`/prospects/email/${encodeURIComponent(form.email)}`);
      } catch {
        // Prospect inexistant → le créer
        prospect = await apiFetch("/prospects", {
          method: "POST",
          body: JSON.stringify({ email: form.email, name: form.nom || form.email }),
        });
      }

      // 2. Enregistrer un message récapitulatif
      const contenuMessage = buildContenuMessage(form, services);
      await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify({
          type:       form.canal,
          contenu:    contenuMessage,
          prospectId: prospect.id,
        }),
      });

      // 3. Créer un besoin pour chaque service sélectionné
      const servicesSelectionnes = services.filter(s => form.servicesSelectionnes.includes(s.id));
      if (servicesSelectionnes.length > 0) {
        for (const svc of servicesSelectionnes) {
          await apiFetch("/besoins", {
            method: "POST",
            body: JSON.stringify({
              name:        svc.name,
              description: form.descriptionLibre || `Intérêt pour le service : ${svc.name}`,
              prospectId:  prospect.id,
              serviceIds:  [svc.id],
            }),
          });
        }
      } else if (form.descriptionLibre.trim()) {
        // Besoin libre sans service identifié — l'agent analysera
        await apiFetch("/besoins", {
          method: "POST",
          body: JSON.stringify({
            name:        "Besoin à qualifier",
            description: form.descriptionLibre,
            prospectId:  prospect.id,
            serviceIds:  [],
          }),
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  function buildContenuMessage(form, services) {
    const lignes = [
      `FORMULAIRE DE DEMANDE — ${new Date().toLocaleDateString("fr-FR")}`,
      ``,
      `Nom : ${form.nom || "Non renseigné"}`,
      `Email : ${form.email}`,
      `Téléphone : ${form.telephone || "Non renseigné"}`,
      `Canal préféré : ${form.canal}`,
      `Source : ${form.source || "Non renseignée"}`,
      ``,
      `URGENCE : ${URGENCES.find(u => u.value === form.urgence)?.label}`,
      ``,
    ];
    const svcsSelectionnes = services.filter(s => form.servicesSelectionnes.includes(s.id));
    if (svcsSelectionnes.length > 0) {
      lignes.push(`SERVICES SOUHAITÉS :`);
      svcsSelectionnes.forEach(s => lignes.push(`  - ${s.name}`));
      lignes.push(``);
    }
    if (form.descriptionLibre) {
      lignes.push(`DESCRIPTION DU BESOIN :`);
      lignes.push(form.descriptionLibre);
      lignes.push(``);
    }
    if (form.message) {
      lignes.push(`MESSAGE COMPLÉMENTAIRE :`);
      lignes.push(form.message);
      lignes.push(``);
    }
    if (form.disponibilite) {
      lignes.push(`DISPONIBILITÉ : ${form.disponibilite}`);
    }
    return lignes.join("\n");
  }

  // ── Rendu : succès ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="formulaire-page">
        <div className="formulaire-success">
          <div className="success-icon">✅</div>
          <h2>Demande envoyée avec succès !</h2>
          <p>
            Merci <strong>{form.nom || form.email}</strong>. Votre demande a bien été enregistrée.
            L'équipe GNO Solutions va l'analyser et vous recontactera très prochainement
            via <strong>{CANAUX.find(c => c.value === form.canal)?.label}</strong>.
          </p>
          {form.urgence !== "NORMAL" && (
            <p className="success-urgence">
              ⚡ Votre demande est marquée comme <strong>{URGENCES.find(u => u.value === form.urgence)?.label}</strong> — elle sera traitée en priorité.
            </p>
          )}
          <div className="success-ref">
            Référence : <code>{form.email}-{Date.now().toString().slice(-6)}</code>
          </div>
        </div>
      </div>
    );
  }

  // ── Rendu : formulaire ──────────────────────────────────────
  return (
    <div className="formulaire-page">
      <div className="formulaire-container">

        {/* En-tête */}
        <div className="formulaire-header">
          <div className="formulaire-logo">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#e91e8c"/>
              <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">G</text>
            </svg>
          </div>
          <div>
            <h1 className="formulaire-title">GNO Solutions</h1>
            <p className="formulaire-subtitle">Formulaire de demande de service</p>
          </div>
        </div>

        {/* Barre de progression */}
        <ProgressBar etape={etape} total={4} />

        {/* Corps du formulaire */}
        <div className="formulaire-body">

          {/* ── ÉTAPE 1 : Identification ── */}
          {etape === 1 && (
            <div className="form-etape">
              <h2 className="form-etape-title">👤 Qui êtes-vous ?</h2>
              <p className="form-etape-desc">Ces informations nous permettent de vous identifier et de vous recontacter.</p>

              <div className="form-field">
                <label className="form-field-label">Adresse email <span className="required">*</span></label>
                <input
                  type="email" className="form-input" placeholder="votre@email.com"
                  value={form.email} onChange={e => set("email", e.target.value)}
                />
                <span className="form-field-hint">Votre email est utilisé pour identifier votre dossier.</span>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-field-label">Nom complet</label>
                  <input type="text" className="form-input" placeholder="Jean Dupont"
                    value={form.nom} onChange={e => set("nom", e.target.value)} />
                </div>
                <div className="form-field">
                  <label className="form-field-label">Téléphone</label>
                  <input type="tel" className="form-input" placeholder="+237 6XX XXX XXX"
                    value={form.telephone} onChange={e => set("telephone", e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-field-label">Comment préférez-vous être contacté ?</label>
                <div className="canal-grid">
                  {CANAUX.map(c => (
                    <button
                      key={c.value} type="button"
                      className={"canal-btn" + (form.canal === c.value ? " selected" : "")}
                      onClick={() => set("canal", c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-field-label">Comment avez-vous connu GNO Solutions ?</label>
                <select className="form-select" value={form.source} onChange={e => set("source", e.target.value)}>
                  <option value="">-- Sélectionner --</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Besoins ── */}
          {etape === 2 && (
            <div className="form-etape">
              <h2 className="form-etape-title">🎯 Que recherchez-vous ?</h2>
              <p className="form-etape-desc">
                Sélectionnez les services qui vous intéressent <em>et/ou</em> décrivez votre besoin avec vos propres mots.
              </p>

              {/* Sélection services */}
              <div className="form-field">
                <label className="form-field-label">Services disponibles</label>
                {loading ? (
                  <p className="form-loading">Chargement des services...</p>
                ) : services.length === 0 ? (
                  <p className="form-hint">Aucun service disponible pour le moment.</p>
                ) : (
                  <div className="services-grid">
                    {services.map(svc => {
                      const selected = form.servicesSelectionnes.includes(svc.id);
                      return (
                        <div
                          key={svc.id}
                          className={"service-card" + (selected ? " selected" : "")}
                          onClick={() => toggleService(svc.id)}
                        >
                          <div className="service-card-check">{selected ? "✓" : ""}</div>
                          <div className="service-card-name">{svc.name}</div>
                          {svc.description && (
                            <div className="service-card-desc">{svc.description}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Séparateur */}
              <div className="form-separator">
                <span>ou décrivez librement</span>
              </div>

              {/* Description libre */}
              <div className="form-field">
                <label className="form-field-label">Décrivez votre besoin en vos propres mots</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Ex : J'ai besoin d'un site internet pour mon restaurant, avec une page de commande en ligne..."
                  value={form.descriptionLibre}
                  onChange={e => set("descriptionLibre", e.target.value)}
                />
                <span className="form-field-hint">
                  Si vous ne trouvez pas le service qui vous correspond, décrivez votre besoin ici. Notre équipe vous orientera.
                </span>
              </div>

              {/* Validation */}
              {!canNext() && (
                <div className="form-warning">
                  ⚠️ Sélectionnez au moins un service <strong>ou</strong> décrivez votre besoin (minimum 10 caractères).
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 3 : Détails ── */}
          {etape === 3 && (
            <div className="form-etape">
              <h2 className="form-etape-title">📋 Un peu plus de détails</h2>
              <p className="form-etape-desc">Ces informations aideront notre équipe à mieux préparer votre dossier.</p>

              {/* Urgence */}
              <div className="form-field">
                <label className="form-field-label">Niveau d'urgence</label>
                <div className="urgence-grid">
                  {URGENCES.map(u => (
                    <button
                      key={u.value} type="button"
                      className={"urgence-btn" + (form.urgence === u.value ? " selected" : "")}
                      style={form.urgence === u.value ? { borderColor: u.color, background: u.color + "15" } : {}}
                      onClick={() => set("urgence", u.value)}
                    >
                      <span className="urgence-label" style={form.urgence === u.value ? { color: u.color } : {}}>
                        {u.label}
                      </span>
                      <span className="urgence-desc">{u.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Disponibilité */}
              <div className="form-field">
                <label className="form-field-label">Quand êtes-vous disponible pour un rendez-vous ?</label>
                <input type="text" className="form-input"
                  placeholder="Ex : Lundi-Vendredi, 8h-17h / Samedi matin..."
                  value={form.disponibilite}
                  onChange={e => set("disponibilite", e.target.value)} />
              </div>

              {/* Message complémentaire */}
              <div className="form-field">
                <label className="form-field-label">Message complémentaire <span className="optional">(optionnel)</span></label>
                <textarea
                  className="form-textarea" rows={3}
                  placeholder="Toute information supplémentaire que vous souhaitez partager..."
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : Confirmation ── */}
          {etape === 4 && (
            <div className="form-etape">
              <h2 className="form-etape-title">✅ Récapitulatif</h2>
              <p className="form-etape-desc">Vérifiez vos informations avant d'envoyer votre demande.</p>

              <div className="recap-card">
                <div className="recap-section">
                  <h4 className="recap-section-title">👤 Vos coordonnées</h4>
                  <div className="recap-row"><span>Email</span><strong>{form.email}</strong></div>
                  {form.nom && <div className="recap-row"><span>Nom</span><strong>{form.nom}</strong></div>}
                  {form.telephone && <div className="recap-row"><span>Téléphone</span><strong>{form.telephone}</strong></div>}
                  <div className="recap-row"><span>Contact préféré</span><strong>{CANAUX.find(c => c.value === form.canal)?.label}</strong></div>
                </div>

                <div className="recap-section">
                  <h4 className="recap-section-title">🎯 Vos besoins</h4>
                  {form.servicesSelectionnes.length > 0 && (
                    <div className="recap-row">
                      <span>Services</span>
                      <div className="recap-tags">
                        {services.filter(s => form.servicesSelectionnes.includes(s.id)).map(s => (
                          <span key={s.id} className="recap-tag">{s.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.descriptionLibre && (
                    <div className="recap-row recap-row--col">
                      <span>Description</span>
                      <p className="recap-text">{form.descriptionLibre}</p>
                    </div>
                  )}
                </div>

                <div className="recap-section">
                  <h4 className="recap-section-title">📋 Détails</h4>
                  <div className="recap-row">
                    <span>Urgence</span>
                    <strong style={{ color: URGENCES.find(u => u.value === form.urgence)?.color }}>
                      {URGENCES.find(u => u.value === form.urgence)?.label}
                    </strong>
                  </div>
                  {form.disponibilite && <div className="recap-row"><span>Disponibilité</span><strong>{form.disponibilite}</strong></div>}
                </div>
              </div>

              {/* Consentement */}
              <div className="form-consent">
                <input
                  type="checkbox" id="consent"
                  checked={form.accepte}
                  onChange={e => set("accepte", e.target.checked)}
                />
                <label htmlFor="consent">
                  J'accepte que GNO Solutions conserve mes informations pour traiter ma demande et me recontacter.
                </label>
              </div>

              {error && <div className="form-error">{error}</div>}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="formulaire-nav">
          {etape > 1 && (
            <button className="btn-form btn-form--back" onClick={() => setEtape(e => e - 1)}>
              ← Retour
            </button>
          )}
          <div style={{ flex: 1 }} />
          {etape < 4 ? (
            <button
              className={"btn-form btn-form--next" + (!canNext() ? " disabled" : "")}
              onClick={() => { if (canNext()) setEtape(e => e + 1); }}
            >
              Suivant →
            </button>
          ) : (
            <button
              className={"btn-form btn-form--submit" + (submitting ? " loading" : "")}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Envoi en cours..." : "📤 Envoyer ma demande"}
            </button>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="formulaire-footer">
        <p>© 2026 GNO Solutions — Douala, Cameroun</p>
        <p>contact@gnosolutions.fr · +237 699 056 302</p>
      </div>
    </div>
  );
}
