import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Wifi, Check, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { GuestCounter } from '../components/GuestCounter';
import { AnimatedDropdown } from '../components/AnimatedDropdown';
import { ReservationCalendar } from '../components/ReservationCalendar';

const TIME_OPTIONS = [
  { value: '08:30', label: '08:30 (Matinée calme)' },
  { value: '10:30', label: '10:30 (Pause Café)' },
  { value: '12:00', label: '12:00 (Déjeuner & Brunch)' },
  { value: '14:00', label: '14:00 (Après-midi)' },
  { value: '16:00', label: '16:00 (Goûter Latte)' },
  { value: '17:30', label: '17:30 (Fin de journée)' }
];

const TABLE_OPTIONS = [
  { value: 'Intime', label: 'Table Intime en retrait' },
  { value: 'Baie Vitrée', label: 'Près de la Baie Vitrée' },
  { value: 'Coworking', label: 'Espace Bureau Coworking' }
];

export const Reservation = () => {
  const { showToast } = useToast();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: defaultDate,
    time: '10:30',
    guests: '1',
    tableType: 'Intime',
    notes: ''
  });

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingPass = {
      bookingId: 'RES-' + Math.floor(10000 + Math.random() * 90000),
      ...formData,
      timestamp: new Date().toLocaleString('fr-FR')
    };

    setConfirmedBooking(bookingPass);
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}

    showToast(`Merci **${formData.name}** ! Votre réservation pour ${formData.guests} pers. est confirmée.`);
  };

  return (
    <div className="reservation-page">
      {/* Header */}
      <header className="page-header">
        <div className="container">
          <h1 className="page-title">Réservation & Horaires</h1>
          <p className="page-desc">
            Planifiez votre visite pour une pause gourmande, un déjeuner brunch ou une session de coworking au calme.
          </p>
        </div>
      </header>

      {/* Reservation Section */}
      <section className="reservation-section">
        <div className="container reservation-grid">
          {/* Hours & Location Info */}
          <div className="hours-info-card">
            <h3>Horaires & Adresse</h3>
            <p className="address-text">
              <MapPin size={16} /> Angle Rue Jean Jaurès & Rue Moussa Ibn Noussair, Gauthier, Casablanca
            </p>

            <ul className="hours-list">
              <li className="hours-item">
                <span className="day">Lundi - Vendredi</span>
                <span className="time">08h00 - 19h00</span>
              </li>
              <li className="hours-item">
                <span className="day">Samedi</span>
                <span className="time">09h00 - 20h00</span>
              </li>
              <li className="hours-item">
                <span className="day">Dimanche (Brunch)</span>
                <span className="time">09h30 - 18h30</span>
              </li>
            </ul>

            <div className="wifi-card">
              <div className="wifi-icon">
                <Wifi size={24} />
              </div>
              <div className="wifi-text">
                <h5>Espace Coworking & Wi-Fi Fibre</h5>
                <p>Prises individuelles, chaises ergonomiques et atmosphère feutrée.</p>
              </div>
            </div>
          </div>

          {/* Booking Form or Digital Pass */}
          <div className="booking-form-box">
            {confirmedBooking ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-rose-subtle)',
                    color: 'var(--brand-burgundy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: '1.8rem', color: 'var(--brand-burgundy-dark)', marginBottom: '0.5rem' }}>
                  Table Confirmée !
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Référence : <strong>{confirmedBooking.bookingId}</strong>
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--brand-cream)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'left',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Nom :</span>
                    <strong>{confirmedBooking.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Date & Heure :</span>
                    <strong>{confirmedBooking.date} à {confirmedBooking.time}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Invités :</span>
                    <strong>{confirmedBooking.guests} Personnes ({confirmedBooking.tableType})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Confirmation envoyée :</span>
                    <span>{confirmedBooking.email}</span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmedBooking(null)}
                  style={{ width: '100%' }}
                >
                  Réserver une autre table
                </button>
              </div>
            ) : (
              <>
                <h3>Réserver une Table</h3>

                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="resName">Nom & Prénom</label>
                      <input
                        type="text"
                        id="resName"
                        className="form-control"
                        placeholder="Nom Prénom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="resEmail">Email</label>
                      <input
                        type="email"
                        id="resEmail"
                        className="form-control"
                        placeholder="email@exemple.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="resDate">Date</label>
                      <ReservationCalendar
                        id="resDate"
                        value={formData.date}
                        minDate={new Date().toISOString().split('T')[0]}
                        onChange={(date) => setFormData({ ...formData, date })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="resTime">Heure</label>
                      <AnimatedDropdown
                        id="resTime"
                        icon={Clock}
                        options={TIME_OPTIONS}
                        value={formData.time}
                        onChange={(time) => setFormData({ ...formData, time })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="resGuests">Invités</label>
                      <GuestCounter
                        id="resGuests"
                        value={formData.guests}
                        min={1}
                        max={10}
                        onChange={(guests) => setFormData({ ...formData, guests })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="resTable">Emplacement souhaité</label>
                      <AnimatedDropdown
                        id="resTable"
                        icon={MapPin}
                        options={TABLE_OPTIONS}
                        value={formData.tableType}
                        onChange={(tableType) => setFormData({ ...formData, tableType })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="resNotes">Demande spécifique (optionnel)</label>
                    <textarea
                      id="resNotes"
                      className="form-control"
                      rows="2"
                      placeholder="Intolérances, poussette, chaise haute..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Check size={18} />
                    <span>Confirmer la Réservation</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
