
document.addEventListener('DOMContentLoaded', function(){
  flatpickr("#datepicker", {
    dateFormat: "d/m/Y",
    minDate: "today",
    disable: [],
    onChange: function(selectedDates, dateStr, instance){
      // placeholder for future date conflict checks
    }
  });

  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('formMessage');
  form.addEventListener('submit', function(e){
    // simple demo: prevent real submission to demonstrate
    // allow Formspree if action set to real endpoint
    // Here we show a confirmation message
    msg.textContent = 'Votre demande a bien été enregistrée (démo). Vous recevrez une confirmation par email si le formulaire est connecté.';
  });
});


// --- slider autoplay ---
(function(){ 
  var slider = document.querySelector('.slider');
  if (slider) {
    var files = ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg", "photo4.jpeg", "photo5.jpeg", "photo6.jpeg", "photo7.jpeg", "photo8.jpeg", "photo9.jpeg", "photo10.jpeg", "photo11.jpeg", "photo12.jpeg", "photo13.jpeg", "photo14.jpeg"];
    files.forEach(function(src, i){
      var img = document.createElement('img');
      img.src = 'images/' + src;
      if(i===0) img.classList.add('active');
      slider.appendChild(img);
    });
    var idx = 0;
    setInterval(function(){
      var imgs = slider.querySelectorAll('img');
      if (imgs.length===0) return;
      imgs[idx].classList.remove('active');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('active');
    }, 5000);
  }
})();

// --- burger menu ---
(function(){
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('sideMenu');
  if(btn && menu){
    btn.addEventListener('click', function(){
      menu.classList.toggle('show');
    });
  }
})();
