import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const WEEKDAY_NAMES_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const ReservationCalendar = ({ value, onChange, minDate, id = 'resDate' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef(null);

  // Parse current value or fallback to tomorrow
  const selectedDate = value ? new Date(value + 'T12:00:00') : new Date();

  // Calendar month view
  const [viewDate, setViewDate] = useState(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  // Keep viewDate in sync when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      if (!isNaN(d.getTime())) {
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  // Month navigation with slide direction
  const prevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Generate days for grid
  const getDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    // Monday is index 0 in French week
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i, 12, 0, 0);
      days.push({ date, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d, 12, 0, 0);
      days.push({ date, isCurrentMonth: true });
    }

    // Next month padding
    const remainder = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainder; i++) {
      const date = new Date(year, month + 1, i, 12, 0, 0);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleSelectDate = (date) => {
    // Format YYYY-MM-DD in local time
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const isoString = `${y}-${m}-${d}`;
    onChange(isoString);
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return 'Choisir une date';
    const d = new Date(val + 'T12:00:00');
    if (isNaN(d.getTime())) return val;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const setPreset = (offsetDays) => {
    const target = new Date();
    target.setDate(today.getDate() + offsetDays);
    setDirection(target > viewDate ? 1 : -1);
    handleSelectDate(target);
  };

  const setNextSaturday = () => {
    const target = new Date();
    const day = target.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    target.setDate(target.getDate() + diff);
    setDirection(target > viewDate ? 1 : -1);
    handleSelectDate(target);
  };

  const days = getDays();

  // Slide animation variants for days grid
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0
    })
  };

  // Title vertical slide variants
  const titleVariants = {
    enter: (dir) => ({
      y: dir > 0 ? 12 : -12,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (dir) => ({
      y: dir > 0 ? -12 : 12,
      opacity: 0
    })
  };

  return (
    <div className={`reservation-calendar-wrapper ${isOpen ? 'open' : ''}`} ref={containerRef} id={id}>
      {/* Trigger Bar: Fixed in flow, never resizes or pushes the parent window */}
      <button
        type="button"
        className="reservation-calendar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="animated-dropdown-trigger-left">
          <CalendarIcon size={16} className="dropdown-leading-icon" />
          <span className="dropdown-selected-label">{formatDisplay(value)}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="dropdown-chevron-box"
        >
          <ChevronDown size={17} />
        </motion.div>
      </button>

      {/* Floating Popover: Passes OVER everything with high z-index without pushing form fields */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="calendar-popover"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="reservation-calendar-popover"
          >
            {/* Quick Presets */}
            <div className="calendar-quick-presets">
              <button
                type="button"
                className="calendar-preset-chip"
                onClick={() => setPreset(0)}
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                className="calendar-preset-chip"
                onClick={() => setPreset(1)}
              >
                Demain
              </button>
              <button
                type="button"
                className="calendar-preset-chip"
                onClick={() => setNextSaturday()}
              >
                Ce Samedi
              </button>
            </div>

            {/* Month Navigation with animated title */}
            <div className="calendar-month-header">
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                className="calendar-nav-btn"
                onClick={prevMonth}
                aria-label="Mois précédent"
              >
                <ChevronLeft size={16} />
              </motion.button>

              <div className="calendar-month-title-wrap">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                  <motion.span
                    key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
                    custom={direction}
                    variants={titleVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="calendar-month-title"
                  >
                    {MONTH_NAMES_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                className="calendar-nav-btn"
                onClick={nextMonth}
                aria-label="Mois suivant"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>

            {/* Weekdays Row (Static) */}
            <div className="calendar-weekdays-row">
              {WEEKDAY_NAMES_FR.map((wd) => (
                <span key={wd} className="calendar-weekday-cell">
                  {wd}
                </span>
              ))}
            </div>

            {/* Sliding Months Viewport: Current month slides out, new month slides in */}
            <div className="calendar-slider-viewport">
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                  key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="calendar-slide-content"
                >
                  <div className="calendar-days-grid">
                    {days.map(({ date, isCurrentMonth }, idx) => {
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, today);
                      const isPast = date < min;

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isPast}
                          className={`calendar-day-cell ${
                            isSelected ? 'selected' : ''
                          } ${isToday ? 'today' : ''} ${
                            !isCurrentMonth ? 'other-month' : ''
                          } ${isPast ? 'disabled' : ''}`}
                          onClick={() => handleSelectDate(date)}
                        >
                          <span className="day-number">{date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
