/* ==========================================================================
   Eaglescliffe & Yarm Handyman — Concept B Interactive Controller
   - Snap Tool-Drawer tap-to-bundle chips + category presets
   - Horizontal scroll-snap category buttons
   - Instant TS16 / TS15 area selector syncing with industrial docket form
   - Client-side validation + exact demo confirmation string
   - Zero external network requests · Safe localStorage/sessionStorage fallback
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ey_demo_jobs_v2";
  var EXACT_SUBMIT_MSG = "Demo only – in the live site this would go straight to Eaglescliffe & Yarm Handyman.";
  var memoryBundle = [];

  var AREA_INFO = {
    "eaglescliffe": {
      stamp: "CORE PATCH · TS16 EAGLESCLIFFE",
      desc: "Covering Yarm Road, Orchard Estate, Swinburne Road, Albert Road, Egglescliffe Village and modern residential avenues.",
      ph: "[Exact TS16 sub-areas – owner to confirm]"
    },
    "yarm": {
      stamp: "CORE PATCH · TS15 YARM",
      desc: "Covering Yarm High Street cottages and wynds, Layfield, Spitalfields, Green Lane, Conyers, Levendale and Mount Leven.",
      ph: "[Exact TS15 sub-areas – owner to confirm]"
    },
    "egglescliffe-preston": {
      stamp: "CORE PATCH · EGGLESCLIFFE & PRESTON-ON-TEES",
      desc: "Covering historic Egglescliffe Village green right by Yarm Bridge and avenues north into Preston-on-Tees.",
      ph: "[Exact TS16 / TS18 boundary – owner to confirm]"
    },
    "kirklevington": {
      stamp: "NEARBY VILLAGE · KIRKLEVINGTON TS15",
      desc: "Just south of Yarm along the A67 — ideal for half-day odd-job bundles and home maintenance lists.",
      ph: "[Surrounding villages & travel radius – owner to confirm]"
    },
    "aislaby": {
      stamp: "NEARBY VILLAGE · AISLABY TS16",
      desc: "Just west along Aislaby Road from Eaglescliffe & Yarm — pop your docket across to confirm next slot.",
      ph: "[Surrounding villages & travel radius – owner to confirm]"
    },
    "nearby": {
      stamp: "SURROUNDING TEESSIDE VILLAGES",
      desc: "Live in Ingleby Barwick, Hilton, Maltby, Hartburn or Hutton Rudby? Send your job list to check availability.",
      ph: "[Surrounding villages & travel radius – owner to confirm]"
    }
  };

  function loadJobs() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryBundle = parsed.slice();
          return parsed;
        }
      }
    } catch (_) {}
    return memoryBundle.slice();
  }

  function saveJobs(list) {
    var clean = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && clean.indexOf(list[i]) === -1) {
        clean.push(list[i]);
      }
    }
    memoryBundle = clean.slice();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
    return clean;
  }

  function renderBundleUI() {
    var jobs = loadJobs();
    var countEls = document.querySelectorAll("[data-bundle-count]");
    for (var i = 0; i < countEls.length; i++) {
      countEls[i].textContent = String(jobs.length);
    }

    var wordEls = document.querySelectorAll("[data-bundle-word]");
    for (var w = 0; w < wordEls.length; w++) {
      wordEls[w].textContent = jobs.length === 1 ? "job" : "jobs";
    }

    var chips = document.querySelectorAll("[data-job-chip]");
    for (var c = 0; c < chips.length; c++) {
      var val = chips[c].getAttribute("data-job-chip");
      var active = jobs.indexOf(val) !== -1;
      chips[c].setAttribute("aria-pressed", active ? "true" : "false");
      var ind = chips[c].querySelector(".job-chip__indicator");
      if (ind) {
        ind.textContent = active ? "✓" : "+";
      }
    }

    var presetBtns = document.querySelectorAll("[data-bundle-preset]");
    for (var p = 0; p < presetBtns.length; p++) {
      var parts = (presetBtns[p].getAttribute("data-bundle-preset") || "").split("|");
      var allPresent = parts.length > 0 && parts.every(function (item) {
        return jobs.indexOf(item) !== -1;
      });
      presetBtns[p].classList.toggle("is-bundled", allPresent);
    }

    var summaryEl = document.getElementById("drawer-live-summary");
    if (summaryEl) {
      if (jobs.length === 0) {
        summaryEl.textContent = "No chips bundled yet — tap any jobs above or describe your repair directly in the docket below.";
      } else {
        summaryEl.textContent = jobs.length + (jobs.length === 1 ? " job" : " jobs") + " ready in your quote docket: " + jobs.join(" · ");
      }
    }

    var manifestContainer = document.getElementById("docket-bundled-tags");
    if (manifestContainer) {
      manifestContainer.innerHTML = "";
      if (jobs.length === 0) {
        var emptySpan = document.createElement("span");
        emptySpan.className = "bundled-manifest__empty";
        emptySpan.textContent = "No chips selected yet — tap chips in the Tool-Drawer or describe your job below.";
        manifestContainer.appendChild(emptySpan);
      } else {
        jobs.forEach(function (jobName) {
          var pill = document.createElement("button");
          pill.type = "button";
          pill.className = "manifest-pill";
          pill.setAttribute("aria-label", "Remove " + jobName + " from docket");
          var txt = document.createElement("span");
          txt.textContent = jobName;
          var closeMark = document.createElement("span");
          closeMark.setAttribute("aria-hidden", "true");
          closeMark.textContent = "✕";
          pill.appendChild(txt);
          pill.appendChild(closeMark);
          pill.addEventListener("click", function () {
            var next = loadJobs().filter(function (j) { return j !== jobName; });
            saveJobs(next);
            renderBundleUI();
          });
          manifestContainer.appendChild(pill);
        });
      }
    }
  }

  /* 1. Chip Toggles & Category Presets */
  var chipBtns = document.querySelectorAll("[data-job-chip]");
  for (var i = 0; i < chipBtns.length; i++) {
    chipBtns[i].addEventListener("click", function () {
      var val = this.getAttribute("data-job-chip");
      var current = loadJobs();
      var idx = current.indexOf(val);
      if (idx === -1) {
        current.push(val);
      } else {
        current.splice(idx, 1);
      }
      saveJobs(current);
      renderBundleUI();
    });
  }

  var categoryPresetBtns = document.querySelectorAll("[data-bundle-preset]");
  for (var k = 0; k < categoryPresetBtns.length; k++) {
    categoryPresetBtns[k].addEventListener("click", function () {
      var items = (this.getAttribute("data-bundle-preset") || "").split("|");
      var current = loadJobs();
      items.forEach(function (it) {
        if (it && current.indexOf(it) === -1) {
          current.push(it);
        }
      });
      saveJobs(current);
      renderBundleUI();
      var drawerSection = document.getElementById("tool-drawer");
      if (drawerSection) {
        drawerSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  var sampleBtn = document.getElementById("preset-fridge-btn");
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      saveJobs([
        "Ease sticking internal door",
        "Put up alcove shelving",
        "Fix dripping tap or re-silicone bath"
      ]);
      renderBundleUI();
    });
  }

  var clearBtn = document.getElementById("clear-drawer-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      saveJobs([]);
      renderBundleUI();
    });
  }

  /* 2. Horizontal Category Scroll-Snap Buttons */
  var snapRail = document.getElementById("category-snap-rail");
  var snapBtns = document.querySelectorAll("[data-snap-dir]");
  if (snapRail && snapBtns.length) {
    for (var s = 0; s < snapBtns.length; s++) {
      snapBtns[s].addEventListener("click", function () {
        var dir = Number(this.getAttribute("data-snap-dir")) || 1;
        var card = snapRail.querySelector(".snap-card");
        var step = card ? card.getBoundingClientRect().width + 16 : 300;
        snapRail.scrollBy({ left: dir * step, behavior: "smooth" });
      });
    }
  }

  /* 3. TS16 / TS15 Area Selector */
  var areaPills = document.querySelectorAll("[data-area-pick]");
  var areaSelect = document.getElementById("b-area");
  var stampEl = document.getElementById("area-readout-stamp");
  var descEl = document.getElementById("area-readout-desc");
  var phEl = document.getElementById("area-readout-ph");

  for (var a = 0; a < areaPills.length; a++) {
    areaPills[a].addEventListener("click", function () {
      var key = this.getAttribute("data-area-pick");
      for (var j = 0; j < areaPills.length; j++) {
        var match = areaPills[j] === this;
        areaPills[j].classList.toggle("is-selected", match);
        areaPills[j].setAttribute("aria-pressed", match ? "true" : "false");
      }
      var info = AREA_INFO[key];
      if (info && stampEl && descEl && phEl) {
        stampEl.textContent = info.stamp;
        descEl.textContent = info.desc;
        phEl.textContent = info.ph;
      }
      if (areaSelect) {
        areaSelect.value = key;
      }
    });
  }

  /* 4. Industrial Docket Form Validation & Dummy Submit */
  var form = document.getElementById("industrial-docket-form");
  var confirmBox = document.getElementById("b-demo-confirm");
  var recapEl = document.getElementById("b-demo-recap");

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var areaVal = (document.getElementById("b-area").value || "").trim();
      var notesVal = (document.getElementById("b-notes").value || "").trim();
      var nameVal = (document.getElementById("b-name").value || "").trim();
      var contactVal = (document.getElementById("b-contact").value || "").trim();

      if (!areaVal) {
        setErr("b-area-err", "Please select your town or village.");
        valid = false;
      } else {
        setErr("b-area-err", "");
      }

      if (!notesVal) {
        setErr("b-notes-err", "Please add a short description of your repair(s).");
        valid = false;
      } else {
        setErr("b-notes-err", "");
      }

      if (!nameVal) {
        setErr("b-name-err", "Please enter your name.");
        valid = false;
      } else {
        setErr("b-name-err", "");
      }

      if (!contactVal) {
        setErr("b-contact-err", "Please enter a phone number or email address.");
        valid = false;
      } else {
        setErr("b-contact-err", "");
      }

      if (!valid) {
        var firstInvalid = form.querySelector("[aria-describedby]");
        if (!areaVal) firstInvalid = document.getElementById("b-area");
        else if (!notesVal) firstInvalid = document.getElementById("b-notes");
        else if (!nameVal) firstInvalid = document.getElementById("b-name");
        else if (!contactVal) firstInvalid = document.getElementById("b-contact");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var jobs = loadJobs();
      var exactP = confirmBox.querySelector(".demo-confirm__exact");
      if (exactP) exactP.textContent = EXACT_SUBMIT_MSG;

      if (recapEl) {
        var jobSummary = jobs.length ? jobs.length + " bundled job(s) (" + jobs.join(", ") + ")" : "custom job note";
        recapEl.textContent = "Docket logged in preview for " + nameVal + " (" + areaVal.toUpperCase() + ") — " + jobSummary + ".";
      }

      confirmBox.hidden = false;
      confirmBox.focus();
    });
  }

  renderBundleUI();
})();
