/* ==========================================================================
   Eaglescliffe & Yarm Handyman — Concept C Single-Page App Controller
   - Tappable "+ Add to list" rows synced with Step 1 checkboxes & localStorage
   - Category row filter pills
   - Mobbin-style 3-Step Progressive Inline Stepper (Steps 1 -> 2 -> 3)
   - 1-tap visit timing chips + client-side validation + exact demo string
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ey_demo_jobs_v2";
  var EXACT_SUBMIT_MSG = "Demo only – in the live site this would go straight to Eaglescliffe & Yarm Handyman.";
  var memoryList = [];
  var currentStep = 1;

  function loadJobs() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          memoryList = parsed.slice();
          return parsed;
        }
      }
    } catch (_) {}
    return memoryList.slice();
  }

  function saveJobs(list) {
    var clean = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && clean.indexOf(list[i]) === -1) {
        clean.push(list[i]);
      }
    }
    memoryList = clean.slice();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
    return clean;
  }

  function syncAllJobControls() {
    var jobs = loadJobs();

    var counters = document.querySelectorAll("[data-list-count]");
    for (var i = 0; i < counters.length; i++) {
      counters[i].textContent = String(jobs.length);
    }

    var addBtns = document.querySelectorAll("[data-add-job]");
    for (var b = 0; b < addBtns.length; b++) {
      var val = addBtns[b].getAttribute("data-add-job");
      var added = jobs.indexOf(val) !== -1;
      addBtns[b].setAttribute("aria-pressed", added ? "true" : "false");
      addBtns[b].textContent = added ? "✓ Added" : "+ Add to list";
    }

    var checks = document.querySelectorAll("[data-step-job]");
    for (var c = 0; c < checks.length; c++) {
      checks[c].checked = jobs.indexOf(checks[c].value) !== -1;
    }

    updateReviewSummary();
  }

  function toggleJob(jobTitle, forceState) {
    var current = loadJobs();
    var idx = current.indexOf(jobTitle);
    var shouldAdd = typeof forceState === "boolean" ? forceState : idx === -1;
    if (shouldAdd && idx === -1) {
      current.push(jobTitle);
    } else if (!shouldAdd && idx !== -1) {
      current.splice(idx, 1);
    }
    saveJobs(current);
    syncAllJobControls();
  }

  /* 1. Tappable Job Rows & Step 1 Checkboxes */
  var rowAddBtns = document.querySelectorAll("[data-add-job]");
  for (var i = 0; i < rowAddBtns.length; i++) {
    rowAddBtns[i].addEventListener("click", function () {
      toggleJob(this.getAttribute("data-add-job"));
    });
  }

  var stepChecks = document.querySelectorAll("[data-step-job]");
  for (var c = 0; c < stepChecks.length; c++) {
    stepChecks[c].addEventListener("change", function () {
      toggleJob(this.value, this.checked);
      setErr("step-1-err", "");
    });
  }

  /* 2. Category Filter Chips */
  var catBtns = document.querySelectorAll("[data-cat-filter]");
  var jobRows = document.querySelectorAll(".job-row[data-job-cat]");
  for (var f = 0; f < catBtns.length; f++) {
    catBtns[f].addEventListener("click", function () {
      var cat = this.getAttribute("data-cat-filter");
      for (var k = 0; k < catBtns.length; k++) {
        var active = catBtns[k] === this;
        catBtns[k].classList.toggle("is-active", active);
        catBtns[k].setAttribute("aria-pressed", active ? "true" : "false");
      }
      for (var r = 0; r < jobRows.length; r++) {
        var match = cat === "all" || jobRows[r].getAttribute("data-job-cat") === cat;
        jobRows[r].hidden = !match;
      }
    });
  }

  /* 3. Sticky Pill Nav Active State */
  var navPills = document.querySelectorAll("[data-nav-pill]");
  for (var n = 0; n < navPills.length; n++) {
    navPills[n].addEventListener("click", function () {
      for (var j = 0; j < navPills.length; j++) {
        navPills[j].classList.toggle("is-active", navPills[j] === this);
      }
    });
  }

  /* 4. Jump from Area Cards into Step 2 of Stepper */
  var areaJumpBtns = document.querySelectorAll("[data-jump-area]");
  var areaSelect = document.getElementById("c-area");
  for (var aj = 0; aj < areaJumpBtns.length; aj++) {
    areaJumpBtns[aj].addEventListener("click", function () {
      var which = this.getAttribute("data-jump-area");
      if (areaSelect) {
        areaSelect.value = which === "yarm" ? "Yarm (TS15)" : "Eaglescliffe (TS16)";
      }
      var docketSec = document.getElementById("docket");
      if (docketSec) {
        docketSec.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* 5. 1-Tap Timing Chips in Step 2 */
  var timingChips = document.querySelectorAll("[data-timing-chip]");
  var timingInput = document.getElementById("c-timing-input");
  for (var t = 0; t < timingChips.length; t++) {
    timingChips[t].addEventListener("click", function () {
      var val = this.getAttribute("data-timing-chip");
      for (var m = 0; m < timingChips.length; m++) {
        var sel = timingChips[m] === this;
        timingChips[m].classList.toggle("is-selected", sel);
        timingChips[m].setAttribute("aria-pressed", sel ? "true" : "false");
      }
      if (timingInput) timingInput.value = val;
      updateReviewSummary();
    });
  }

  /* 6. 3-Step Progressive Inline Stepper */
  var statusLine = document.getElementById("stepper-status-line");
  var progressBar = document.getElementById("stepper-progress-bar");
  var stepNodes = document.querySelectorAll("[data-step-target]");
  var panes = document.querySelectorAll("[data-step-pane]");

  var STATUS_LABELS = {
    1: "Step 1 of 3 — Select the odd jobs on your list",
    2: "Step 2 of 3 — Choose your TS16/TS15 area & preferred timing",
    3: "Step 3 of 3 — Confirm your contact details & send docket"
  };

  function setErr(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  }

  function updateReviewSummary() {
    var revJobs = document.getElementById("rev-jobs");
    var revArea = document.getElementById("rev-area-timing");
    var jobs = loadJobs();
    var otherVal = ((document.getElementById("c-other-job") || {}).value || "").trim();
    var combined = jobs.slice();
    if (otherVal) combined.push(otherVal);

    if (revJobs) {
      revJobs.textContent = combined.length ? combined.join(", ") : "None ticked yet";
    }
    if (revArea) {
      var aVal = ((document.getElementById("c-area") || {}).value || "Area to select");
      var tVal = ((document.getElementById("c-timing-input") || {}).value || "Flexible");
      revArea.textContent = aVal + " · " + tVal;
    }
  }

  function validateStep1() {
    var jobs = loadJobs();
    var otherVal = ((document.getElementById("c-other-job") || {}).value || "").trim();
    if (jobs.length === 0 && !otherVal) {
      setErr("step-1-err", "Please tick at least one job or enter a custom odd job to continue.");
      return false;
    }
    setErr("step-1-err", "");
    return true;
  }

  function validateStep2() {
    var ok = true;
    var aVal = ((document.getElementById("c-area") || {}).value || "").trim();
    var nVal = ((document.getElementById("c-notes") || {}).value || "").trim();

    if (!aVal) {
      setErr("c-area-err", "Please select your town or village.");
      ok = false;
    } else {
      setErr("c-area-err", "");
    }

    if (!nVal) {
      setErr("c-notes-err", "Please add a short note about your job(s).");
      ok = false;
    } else {
      setErr("c-notes-err", "");
    }
    return ok;
  }

  function goToStep(stepNum) {
    currentStep = stepNum;
    for (var p = 0; p < panes.length; p++) {
      var num = Number(panes[p].getAttribute("data-step-pane"));
      panes[p].hidden = num !== stepNum;
    }
    for (var s = 0; s < stepNodes.length; s++) {
      var target = Number(stepNodes[s].getAttribute("data-step-target"));
      stepNodes[s].classList.toggle("is-current", target === stepNum);
      stepNodes[s].classList.toggle("is-done", target < stepNum);
    }
    if (progressBar) {
      progressBar.style.width = (stepNum * 33.333).toFixed(2) + "%";
    }
    if (statusLine) {
      statusLine.textContent = STATUS_LABELS[stepNum] || "";
    }
    updateReviewSummary();
  }

  var toStep2Btn = document.getElementById("to-step-2-btn");
  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", function () {
      if (validateStep1()) goToStep(2);
    });
  }

  var backTo1Btn = document.getElementById("back-to-step-1-btn");
  if (backTo1Btn) {
    backTo1Btn.addEventListener("click", function () {
      goToStep(1);
    });
  }

  var toStep3Btn = document.getElementById("to-step-3-btn");
  if (toStep3Btn) {
    toStep3Btn.addEventListener("click", function () {
      if (validateStep2()) goToStep(3);
    });
  }

  var backTo2Btn = document.getElementById("back-to-step-2-btn");
  if (backTo2Btn) {
    backTo2Btn.addEventListener("click", function () {
      goToStep(2);
    });
  }

  for (var sn = 0; sn < stepNodes.length; sn++) {
    stepNodes[sn].addEventListener("click", function () {
      var target = Number(this.getAttribute("data-step-target"));
      if (target === 1) {
        goToStep(1);
      } else if (target === 2 && validateStep1()) {
        goToStep(2);
      } else if (target === 3 && validateStep1() && validateStep2()) {
        goToStep(3);
      }
    });
  }

  var stepperForm = document.getElementById("c-stepper-form");
  var successBox = document.getElementById("c-submit-success");
  var successDetail = document.getElementById("c-submit-detail");
  var editAgainBtn = document.getElementById("c-edit-again-btn");

  if (stepperForm) {
    stepperForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep1()) {
        goToStep(1);
        return;
      }
      if (!validateStep2()) {
        goToStep(2);
        return;
      }

      var nameVal = ((document.getElementById("c-name") || {}).value || "").trim();
      var contactVal = ((document.getElementById("c-contact") || {}).value || "").trim();
      var valid3 = true;

      if (!nameVal) {
        setErr("c-name-err", "Please enter your name.");
        valid3 = false;
      } else {
        setErr("c-name-err", "");
      }

      if (!contactVal) {
        setErr("c-contact-err", "Please enter your phone number or email.");
        valid3 = false;
      } else {
        setErr("c-contact-err", "");
      }

      if (!valid3) {
        if (!nameVal) document.getElementById("c-name").focus();
        else document.getElementById("c-contact").focus();
        return;
      }

      var exactEl = successBox.querySelector(".submit-success__exact");
      if (exactEl) exactEl.textContent = EXACT_SUBMIT_MSG;

      var jobs = loadJobs();
      var areaText = document.getElementById("c-area").value;
      var timingText = document.getElementById("c-timing-input").value;
      if (successDetail) {
        successDetail.textContent = "Preview summary for " + nameVal + " (" + areaText + " · " + timingText + "): " + (jobs.length ? jobs.length + " listed job(s)" : "custom repair note") + ".";
      }

      stepperForm.hidden = true;
      successBox.hidden = false;
      successBox.focus();
    });
  }

  if (editAgainBtn) {
    editAgainBtn.addEventListener("click", function () {
      successBox.hidden = true;
      stepperForm.hidden = false;
      goToStep(1);
    });
  }

  syncAllJobControls();
})();
