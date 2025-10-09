// /js/airbnb_calendar.js — initialise Flatpickr après récupération des plages Airbnb
document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/ical-proxy", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {
      const disabledRanges = Array.isArray(data?.ranges) && data.ranges.length
        ? data.ranges.map(r => ({ from: r.from, to: r.to }))
        : (Array.isArray(data?.busyDates) ? data.busyDates : []);

      // Détruit une éventuelle instance existante (si l'index a déjà initialisé Flatpickr)
      if (window._fp && typeof window._fp.destroy === "function") {
        try { window._fp.destroy(); } catch(e) {}
      }

      window._fp = flatpickr("#datePicker", {
        locale: "fr",
        dateFormat: "d/m/Y",
        mode: "range",
        minDate: "today",
        disable: disabledRanges,
        onClose: function (selectedDates) {
          if (selectedDates.length === 2) {
            const diff = (selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24);
            if (diff > 2) {
              alert("Séjour limité à 2 nuits maximum");
              this.clear();
            }
          }
        }
      });
    })
    .catch(err => {
      console.error("Erreur proxy iCal:", err);
      // Fallback : initialiser sans désactivation si l'API échoue
      window._fp = flatpickr("#datePicker", {
        locale: "fr",
        dateFormat: "d/m/Y",
        mode: "range",
        minDate: "today",
        onClose: function (selectedDates) {
          if (selectedDates.length === 2) {
            const diff = (selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24);
            if (diff > 2) { this.clear(); }
          }
        }
      });
    });
});