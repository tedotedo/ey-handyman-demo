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
  var toastTimer = null;

  var C_BUNDLES = {
    "moving-in": {
      label: "Moving-In 4-Job List",
      jobs: [
        "Flat-pack wardrobe / chest assembly",
        "Hang heavy mirror, blinds or TV bracket",
        "Put up alcove shelving",
        "Wall-anchor tall furniture or fit key safe"
      ]
    },
    "doors-shelving": {
      label: "Doors & Shelving Pair",
      jobs: [
        "Ease sticking internal door",
        "Put up alcove shelving"
      ]
    },
    "reseal-tidy": {
      label: "Reseal & Fixtures Tidy",
      jobs: [
        "Fix dripping tap or re-silicone bath",
        "Draught-proofing & door furniture",
        "Hang heavy mirror, blinds or TV bracket"
      ]
    }
  };

  function getVisitScope(count) {
    if (count <= 0) return "Select 1+ jobs";
    if (count === 1) return "Quick Single Repair";
    if (count <= 3) return "2\u20133 Hr Visit";
    return "Half-Day Odd-Job Blitz";
  }

  function showMicroToast(msg) {
    var toast = document.getElementById("c-micro-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "c-micro-toast";
      toast.className = "micro-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

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

    var scopeText = getVisitScope(jobs.length);
    document.querySelectorAll("[data-visit-scope]").forEach(function (el) {
      el.textContent = scopeText;
      el.classList.toggle("is-active", jobs.length > 0);
    });

    document.querySelectorAll("[data-c-bundle]").forEach(function (btn) {
      var key = btn.getAttribute("data-c-bundle");
      var def = C_BUNDLES[key];
      if (!def) return;
      var active = def.jobs.every(function (j) { return jobs.indexOf(j) !== -1; });
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

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
    var saved = saveJobs(current);
    syncAllJobControls();
    showMicroToast((shouldAdd ? "\u2713 Added: " : "Removed: ") + jobTitle + " \u00B7 " + getVisitScope(saved.length));
  }

  document.querySelectorAll("[data-c-bundle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-c-bundle");
      var def = C_BUNDLES[key];
      if (!def) return;
      var current = loadJobs();
      var allActive = def.jobs.every(function (j) { return current.indexOf(j) !== -1; });
      var updated;
      if (allActive) {
        updated = current.filter(function (j) { return def.jobs.indexOf(j) === -1; });
      } else {
        updated = current.slice();
        def.jobs.forEach(function (j) {
          if (updated.indexOf(j) === -1) updated.push(j);
        });
      }
      var saved = saveJobs(updated);
      syncAllJobControls();
      setErr("step-1-err", "");
      showMicroToast((allActive ? "Cleared " : "\u26A1 Bundled ") + def.label + " \u00B7 " + getVisitScope(saved.length));
    });
  });

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
      var otherJobVal = ((document.getElementById("c-other-job") || {}).value || "").trim();
      var allJobs = jobs.slice();
      if (otherJobVal) allJobs.push(otherJobVal);
      var areaText = document.getElementById("c-area").value;
      var postcodeVal = ((document.getElementById("c-postcode") || {}).value || "").trim();
      var postcodeSuffix = postcodeVal ? " (" + postcodeVal.toUpperCase() + ")" : "";
      var timingText = document.getElementById("c-timing-input").value;
      var notesVal = ((document.getElementById("c-notes") || {}).value || "").trim();
      var scopeBadge = getVisitScope(allJobs.length || 1);
      var jobsJoined = allJobs.length ? allJobs.join(" \u00B7 ") : "Custom odd-job repair";
      var refCode = "EY-" + String(3000 + ((nameVal.length * 149 + notesVal.length * 41) % 6999));

      var setTxt = function (id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setTxt("c-ticket-ref", "REF #" + refCode);
      setTxt("c-ticket-name", nameVal);
      setTxt("c-ticket-contact", contactVal);
      setTxt("c-ticket-area", areaText + postcodeSuffix + " \u2014 " + timingText);
      setTxt("c-ticket-scope", scopeBadge);
      setTxt("c-ticket-jobs", jobsJoined);
      setTxt("c-ticket-notes", notesVal);

      stepperForm.dataset.plainReceipt = [
        "Eaglescliffe & Yarm Handyman — Enquiry Receipt (#" + refCode + ")",
        "Customer: " + nameVal,
        "Contact: " + contactVal,
        "Area & Timing: " + areaText + postcodeSuffix + " — " + timingText,
        "Visit Scope: " + scopeBadge,
        "Selected Odd Jobs: " + jobsJoined,
        "Job Notes: " + notesVal
      ].join("\n");

      if (successDetail) {
        successDetail.textContent = "On the live website, this 3-step docket goes straight to the owner\u2019s inbox.";
      }

      stepperForm.hidden = true;
      successBox.hidden = false;
      successBox.focus();
      showMicroToast("\u2713 Demo docket sent (#" + refCode + ")");
    });
  }

  var copySummaryBtn = document.getElementById("c-copy-summary-btn");
  if (copySummaryBtn && stepperForm) {
    copySummaryBtn.addEventListener("click", function () {
      var text = stepperForm.dataset.plainReceipt || "";
      if (navigator.clipboard && navigator.clipboard.writeText && text) {
        navigator.clipboard.writeText(text).then(function () {
          copySummaryBtn.textContent = "\u2713 Summary Copied";
          showMicroToast("\u2713 Summary copied to clipboard");
          window.setTimeout(function () { copySummaryBtn.textContent = "Copy Summary"; }, 2200);
        }).catch(function () {
          showMicroToast("Summary ready");
        });
      } else {
        copySummaryBtn.textContent = "\u2713 Summary Ready";
        showMicroToast("\u2713 Summary ready");
      }
    });
  }

  var resetDemoBtn = document.getElementById("c-reset-demo-btn");
  if (resetDemoBtn && stepperForm) {
    resetDemoBtn.addEventListener("click", function () {
      stepperForm.reset();
      var tInput = document.getElementById("c-timing-input");
      if (tInput) tInput.value = "Flexible \u2014 next available slot";
      saveJobs([]);
      syncAllJobControls();
      successBox.hidden = true;
      stepperForm.hidden = false;
      goToStep(1);
      showMicroToast("Demo docket reset");
    });
  }

  if (editAgainBtn) {
    editAgainBtn.addEventListener("click", function () {
      successBox.hidden = true;
      stepperForm.hidden = false;
      goToStep(1);
    });
  }

  /* 7. Scroll-Progress Hairline */
  var cProgress = document.getElementById("c-scroll-progress");
  if (cProgress) {
    var progTick = false;
    var updateCProg = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      cProgress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      progTick = false;
    };
    window.addEventListener("scroll", function () {
      if (!progTick) {
        progTick = true;
        window.requestAnimationFrame(updateCProg);
      }
    }, { passive: true });
    updateCProg();
  }

  /* 8. Native <dialog> Photo Lightbox */
  var lbTriggers = document.querySelectorAll("[data-lightbox-trigger]");
  if (lbTriggers.length > 0 && typeof HTMLDialogElement !== "undefined") {
    var lbDialog = document.createElement("dialog");
    lbDialog.className = "photo-lightbox";
    lbDialog.id = "c-photo-lightbox";
    lbDialog.setAttribute("aria-label", "Workshop photograph close-up");
    lbDialog.innerHTML =
      '<div class="photo-lightbox__bar">' +
        '<span class="photo-lightbox__spec" data-lb-spec>WORKSHOP PHOTO</span>' +
        '<button type="button" class="photo-lightbox__close" data-lb-close aria-label="Close photo preview">\u2715</button>' +
      '</div>' +
      '<div class="photo-lightbox__stage">' +
        '<img data-lb-img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="">' +
      '</div>' +
      '<div class="photo-lightbox__foot">' +
        '<div class="photo-lightbox__meta">' +
          '<p class="photo-lightbox__caption" data-lb-caption></p>' +
          '<div><span class="illus-tag illus-tag--inline">Illustrative image</span></div>' +
        '</div>' +
        '<a class="btn btn--green btn--compact" data-lb-cta href="#docket">Jump to 3-Step Docket \u2193</a>' +
      '</div>';
    document.body.appendChild(lbDialog);

    var lbImg = lbDialog.querySelector("[data-lb-img]");
    var lbSpec = lbDialog.querySelector("[data-lb-spec]");
    var lbCap = lbDialog.querySelector("[data-lb-caption]");
    var lbClose = lbDialog.querySelector("[data-lb-close]");
    var lbCta = lbDialog.querySelector("[data-lb-cta]");
    var lastEl = null;

    var openLb = function (el) {
      lastEl = el;
      if (lbImg) {
        lbImg.src = el.getAttribute("data-lightbox-src") || "";
        lbImg.alt = el.getAttribute("data-lightbox-alt") || "";
      }
      if (lbSpec) lbSpec.textContent = el.getAttribute("data-lightbox-spec") || "WORKSHOP PHOTO";
      if (lbCap) lbCap.textContent = el.getAttribute("data-lightbox-caption") || "";
      if (typeof lbDialog.showModal === "function" && !lbDialog.open) {
        lbDialog.showModal();
      }
    };

    var closeLb = function () {
      if (lbDialog.open) lbDialog.close();
      if (lastEl && typeof lastEl.focus === "function") lastEl.focus();
    };

    lbClose.addEventListener("click", closeLb);
    lbCta.addEventListener("click", function () {
      if (lbDialog.open) lbDialog.close();
    });
    lbDialog.addEventListener("click", function (ev) {
      if (ev.target === lbDialog) closeLb();
    });

    lbTriggers.forEach(function (el) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return;
        openLb(el);
      });
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openLb(el);
        }
      });
    });
  }

  /* 9. Frosted Mobile Dock Smart Form/Footer Auto-Clearance */
  var mobileBar = document.querySelector(".mobile-bottom-bar");
  if (mobileBar && "IntersectionObserver" in window) {
    var activeZones = new Set();
    var barObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) activeZones.add(entry.target);
          else activeZones.delete(entry.target);
        });
        mobileBar.classList.toggle("is-cleared", activeZones.size > 0);
      },
      { threshold: 0.06 }
    );
    var stepperTarget = document.getElementById("c-stepper-form");
    var successTarget = document.getElementById("c-submit-success");
    var footerTarget = document.querySelector(".sunlit-footer");
    if (stepperTarget) barObs.observe(stepperTarget);
    if (successTarget) barObs.observe(successTarget);
    if (footerTarget) barObs.observe(footerTarget);
  }

  syncAllJobControls();
})();
