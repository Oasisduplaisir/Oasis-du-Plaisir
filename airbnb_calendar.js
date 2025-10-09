
document.addEventListener("DOMContentLoaded", function(){
  var input = document.getElementById("dateSouhaitee") || document.querySelector("input[name*='date']");
  if(!input) return;

  // First, init flatpickr in basic mode so the field opens even before fetch returns
  var fp = flatpickr(input, {
    locale: "fr",
    mode: "range",
    dateFormat: "d/m/Y",
    minDate: "today",
    // No message; just clear if > 2 nights
    onClose: function(selectedDates, dateStr, instance){
      if(selectedDates.length===2){
        var diff = (selectedDates[1]-selectedDates[0])/(1000*60*60*24);
        if(diff>2){ instance.clear(); }
      }
    }
  });

  // Then load Airbnb iCal via Netlify function and disable occupied dates
  fetch("/.netlify/functions/ical-proxy", {cache:"no-store"})
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(!data || !Array.isArray(data.disabled)) return;
      // Update config with disabled dates (array of "YYYY-MM-DD")
      fp.set("disable", data.disabled);
    })
    .catch(function(err){
      console.warn("Impossible de charger l'iCal Airbnb :", err);
    });
});
