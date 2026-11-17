/* Eaglescliffe & Yarm Handyman — Concept D: Send a photo, get a price (demo only) */
(function () {
  'use strict';

  /* Ticket number: looks alive, means nothing */
  var no = 'D-' + String(1000 + Math.floor(Math.random() * 9000));
  document.querySelector('[data-ticket-no]').textContent = no;

  /* Photo previews stay on the device; nothing is uploaded */
  var input = document.getElementById('job-photos');
  var thumbs = document.querySelector('[data-thumbs]');
  var count = 0;
  input.addEventListener('change', function () {
    thumbs.textContent = '';
    var files = Array.prototype.slice.call(input.files, 0, 4);
    count = files.length;
    files.forEach(function (f, i) {
      var li = document.createElement('li');
      var img = document.createElement('img');
      img.alt = 'Photo ' + (i + 1) + ' of your job';
      img.src = URL.createObjectURL(f);
      li.appendChild(img);
      thumbs.appendChild(li);
    });
  });

  var form = document.querySelector('[data-job-form]');
  var err = document.querySelector('[data-job-error]');
  var done = document.querySelector('[data-job-done]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    if (!f.name.value.trim() || !f.phone.value.trim()) { err.hidden = false; done.hidden = true; return; }
    err.hidden = true;
    done.hidden = false;
    done.textContent = 'Ticket ' + no + ' · ' + count + (count === 1 ? ' photo' : ' photos') + ' · ' + f.area.value +
      ' — demo only, nothing has been sent.';
    tearOff(f);
  });

  /* Customer copy: tears off the ticket and gets stamped with the next free slot */
  function tearOff(f) {
    var stub = document.querySelector('[data-stub]');
    var next = document.querySelector('[data-week] .next');
    var slot = next ? next.querySelector('.d').textContent + ' · ' + next.querySelector('.s').textContent.replace(' free', '') : 'We\'ll ring you';
    stub.innerHTML =
      '<div class="stub__head"><span>Customer copy</span><b></b></div>' +
      '<ul class="stub__pics"></ul>' +
      '<p class="stub__job"></p>' +
      '<p class="stub__who"></p>' +
      '<div class="stub__stamp" aria-hidden="true"><span>Received</span><b></b><small>Next free</small></div>' +
      '<p class="stub__fine">Demo only, nothing has been sent.</p>';
    stub.querySelector('.stub__head b').textContent = 'No. ' + no;
    var pics = stub.querySelector('.stub__pics');
    Array.prototype.forEach.call(thumbs.querySelectorAll('img'), function (im, i) {
      if (i > 2) return; var li = document.createElement('li'); var c = document.createElement('img'); c.src = im.src; c.alt = ''; li.appendChild(c); pics.appendChild(li);
    });
    if (!pics.children.length) pics.remove();
    stub.querySelector('.stub__job').textContent = f.note.value.trim() || 'Job described on the phone';
    stub.querySelector('.stub__who').textContent = f.name.value.trim() + ' · ' + f.area.value;
    stub.querySelector('.stub__stamp b').textContent = slot;
    stub.setAttribute('aria-label', 'Customer copy ' + no + ', next free ' + slot);
    stub.hidden = false; stub.classList.remove('is-torn'); void stub.offsetWidth; stub.classList.add('is-torn');
    if (window.matchMedia('(max-width: 859px)').matches) setTimeout(function () { stub.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 250);
  }

  /* Next free slot: illustrative pattern over the next six working days */
  var week = document.querySelector('[data-week]');
  var pattern = ['Full', 'PM free', 'Full', 'AM free', 'All day', 'AM free'];
  var day = new Date();
  var shown = 0, firstFree = false;
  while (shown < 6) {
    day.setDate(day.getDate() + 1);
    if (day.getDay() === 0) continue; // no Sundays
    var label = pattern[shown];
    var li = document.createElement('li');
    var free = label !== 'Full';
    li.className = free ? 'free' : 'full';
    if (free && !firstFree) { li.className += ' next'; firstFree = true; }
    li.innerHTML = '<span class="d"></span><span class="s"></span>';
    li.querySelector('.d').textContent = day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
    li.querySelector('.s').textContent = label;
    week.appendChild(li);
    shown++;
  }

  /* Before / after slider */
  var ba = document.querySelector('[data-ba]');
  ba.querySelector('.ba__range').addEventListener('input', function (e) {
    ba.style.setProperty('--pos', e.target.value + '%');
  });
})();
