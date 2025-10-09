document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/ical-proxy")
    .then((r) => r.json())
    .then((data) => {
      flatpickr("#datePicker", {
        locale: "fr",
        dateFormat: "d/m/Y",
        mode: "range",
        minDate: "today",
        disable: data.busyDates.map(date => date) ,        onClose: function (selectedDates) {
          if (selectedDates.length === 2) {
            var diff = (selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24);
            if (diff > 2) {
              alert("Séjour limité à 2 nuits maximum");
              this.clear();
            }
          }
        },
      });
    })
    .catch((err) => console.error("Erreur de calendrier Airbnb :", err));
});
