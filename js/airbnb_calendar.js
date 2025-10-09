document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("datePicker") || document.querySelector("input[name*='date']");
    if (!input) return;

    var fp = flatpickr(input, {
        locale: "fr",
        dateFormat: "d/m/Y",
        mode: "range",
        minDate: "today",
        maxDate: new Date().fp_incr(365),
        disable: [], 
        onClose: function (selectedDates) {
            if (selectedDates.length === 2) {
                const diffTime = Math.abs(selectedDates[1] - selectedDates[0]);
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays > 2) {
                    alert("La durée maximale est de 2 nuits.");
                    this.clear();
                }
            }
        }
    });

    // Récupération des dates Airbnb via Netlify
    fetch("/.netlify/functions/ical-proxy")
        .then(res => res.json())
        .then(data => {
            if (data && data.unavailable) {
                fp.set("disable", data.unavailable.map(d => new Date(d)));
            }
        })
        .catch(err => console.error("Erreur récupération iCal Airbnb :", err));
});