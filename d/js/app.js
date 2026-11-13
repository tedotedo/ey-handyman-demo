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
      img.onload = function () { URL.revokeObjectURL(img.src); };
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
  });

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
