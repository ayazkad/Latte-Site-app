import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check, Clock } from 'lucide-react';

const MONTH_NAMES_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const MONTH_NAMES_CAP_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const FRENCH_MONTHS_MAP = {
  janvier: 0,
  février: 1,
  fevrier: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  aout: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
  decembre: 11
};

export const isPeriodExpired = (badgeText, explicitEndDate) => {
  if (!badgeText && !explicitEndDate) return false;

  // 1. If explicit end date is provided
  if (explicitEndDate) {
    const end = new Date(explicitEndDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      return new Date() > end;
    }
  }

  // 2. Parse French date expressions, e.g. "Du 15 au 30 août"
  if (typeof badgeText === 'string') {
    const clean = badgeText.toLowerCase().trim();

    // Check for DD/MM/YYYY or DD/MM
    const slashMatch = clean.match(/(?:au\s+)?(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (slashMatch) {
      const now = new Date();
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10) - 1;
      const year = slashMatch[3] ? (slashMatch[3].length === 2 ? 2000 + parseInt(slashMatch[3], 10) : parseInt(slashMatch[3], 10)) : now.getFullYear();
      const end = new Date(year, month, day, 23, 59, 59, 999);
      if (!isNaN(end.getTime())) {
        return now > end;
      }
    }

    let match = clean.match(/(?:au|jusqu'au)\s+(\d{1,2})\s+([a-zàâéèêëîïôûùüç]+)(?:\s+(\d{4}))?/i);
    if (!match) {
      // Find the last date pattern in string
      const allDateMatches = [...clean.matchAll(/(\d{1,2})\s+([a-zàâéèêëîïôûùüç]+)(?:\s+(\d{4}))?/gi)];
      if (allDateMatches.length > 0) {
        match = allDateMatches[allDateMatches.length - 1];
      }
    }

    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].trim();
      const monthIdx = FRENCH_MONTHS_MAP[monthName];

      if (monthIdx !== undefined) {
        const now = new Date();
        const year = match[3] ? parseInt(match[3], 10) : now.getFullYear();
        const endDate = new Date(year, monthIdx, day, 23, 59, 59, 999);
        return now > endDate;
      }
    }
  }

  return false;
};

export const formatRangeToFrench = (start, end) => {
  if (!start && !end) return '';
  if (start && !end) {
    return `À partir du ${start.getDate()} ${MONTH_NAMES_FR[start.getMonth()]}`;
  }
  if (start && end) {
    const isSameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
    if (isSameMonth) {
      return `Du ${start.getDate()} au ${end.getDate()} ${MONTH_NAMES_FR[end.getMonth()]}`;
    }
    return `Du ${start.getDate()} ${MONTH_NAMES_FR[start.getMonth()]} au ${end.getDate()} ${MONTH_NAMES_FR[end.getMonth()]}`;
  }
  return '';
};

export const CalendarRangePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Current calendar view month/year
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Selected date range
  const [startDate, setStartDate] = useState(() => {
    return today;
  });

  const [endDate, setEndDate] = useState(() => {
    const end = new Date(today);
    end.setDate(today.getDate() + 14);
    return end;
  });

  const [hoverDate, setHoverDate] = useState(null);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Navigate months
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Generate calendar days for current month view
  const getDaysForMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    // In French week starts on Monday (0 is Sunday, so convert Sunday to 6, Mon to 0)
    const normalizedStartDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = normalizedStartDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isBetween = (target, d1, d2) => {
    if (!target || !d1 || !d2) return false;
    const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const start = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const end = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    return t > Math.min(start, end) && t < Math.max(start, end);
  };

  const emitChange = (start, end) => {
    if (onChange && start && end) {
      onChange(formatRangeToFrench(start, end), {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
    }
  };

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      // Start a new range
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        // Inverted range
        setStartDate(date);
        setEndDate(startDate);
        emitChange(date, startDate);
      } else {
        setEndDate(date);
        emitChange(startDate, date);
      }
    }
  };

  // Quick Preset Selection
  const applyPreset = (daysCount) => {
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(today.getDate() + daysCount);

    setStartDate(start);
    setEndDate(end);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));

    emitChange(start, end);
  };

  const applyFullMonth = (offsetMonth = 0) => {
    const targetMonth = today.getMonth() + offsetMonth;
    const start = new Date(today.getFullYear(), targetMonth, 1);
    const end = new Date(today.getFullYear(), targetMonth + 1, 0);

    setStartDate(start);
    setEndDate(end);
    setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));

    emitChange(start, end);
  };

  return (
    <div className="appica-calendar-wrapper" ref={containerRef}>
      {/* Input Display Trigger */}
      <div
        className={`appica-calendar-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Cliquer pour choisir la période sur le calendrier"
      >
        <div className="appica-trigger-content">
          <CalendarIcon size={17} className="appica-trigger-icon" />
          <span className="appica-trigger-text">
            {value || 'Sélectionner la période (ex: Du 15 au 30 août)'}
          </span>
        </div>
        <div className="appica-trigger-badge">
          {isOpen ? 'Fermer' : 'Choisir la période'}
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="appica-calendar-popover">
          {/* Quick Presets Bar */}
          <div className="appica-presets-bar">
            <span className="appica-presets-title">Périodes suggérées :</span>
            <div className="appica-presets-chips">
              <button
                type="button"
                className="appica-preset-btn"
                onClick={() => applyPreset(7)}
              >
                7 jours
              </button>
              <button
                type="button"
                className="appica-preset-btn"
                onClick={() => applyPreset(14)}
              >
                15 jours
              </button>
              <button
                type="button"
                className="appica-preset-btn"
                onClick={() => applyPreset(30)}
              >
                30 jours
              </button>
              <button
                type="button"
                className="appica-preset-btn"
                onClick={() => applyFullMonth(0)}
              >
                Ce mois
              </button>
              <button
                type="button"
                className="appica-preset-btn"
                onClick={() => applyFullMonth(1)}
              >
                Mois prochain
              </button>
            </div>
          </div>

          {/* Header Navigation */}
          <div className="appica-calendar-header">
            <button
              type="button"
              className="appica-nav-btn"
              onClick={prevMonth}
              aria-label="Mois précédent"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="appica-month-year-label">
              {MONTH_NAMES_CAP_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>

            <button
              type="button"
              className="appica-nav-btn"
              onClick={nextMonth}
              aria-label="Mois suivant"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="appica-weekdays-grid">
            {DAYS_SHORT_FR.map((d, i) => (
              <div key={i} className="appica-weekday-cell">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="appica-days-grid">
            {getDaysForMonth().map((item, idx) => {
              const { date, isCurrentMonth } = item;
              const isStart = isSameDay(date, startDate);
              const isEnd = isSameDay(date, endDate);
              const isSelected = isStart || isEnd;
              const inRange = isBetween(date, startDate, endDate || hoverDate);
              const isToday = isSameDay(date, today);

              let cellClass = 'appica-day-btn';
              if (!isCurrentMonth) cellClass += ' outside-month';
              if (isSelected) cellClass += ' selected';
              if (isStart) cellClass += ' range-start';
              if (isEnd) cellClass += ' range-end';
              if (inRange) cellClass += ' in-range';
              if (isToday) cellClass += ' is-today';

              return (
                <div key={idx} className={`appica-day-cell ${inRange ? 'in-range-wrapper' : ''} ${isStart ? 'start-wrapper' : ''} ${isEnd ? 'end-wrapper' : ''}`}>
                  <button
                    type="button"
                    className={cellClass}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => {
                      if (startDate && !endDate) {
                        setHoverDate(date);
                      }
                    }}
                  >
                    {date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer with Selected Range Summary & Apply */}
          <div className="appica-calendar-footer">
            <div className="appica-range-summary">
              {startDate && endDate ? (
                <span className="appica-summary-text">
                  <Check size={14} color="#2e7d32" />
                  <strong>{formatRangeToFrench(startDate, endDate)}</strong>
                </span>
              ) : startDate ? (
                <span className="appica-summary-text hint">
                  Sélectionnez la date de fin sur le calendrier...
                </span>
              ) : (
                <span className="appica-summary-text hint">
                  Cliquez sur la date de début
                </span>
              )}
            </div>

            <button
              type="button"
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => {
                if (startDate && endDate) {
                  onChange(formatRangeToFrench(startDate, endDate), {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                  });
                }
                setIsOpen(false);
              }}
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
