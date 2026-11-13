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
  var toastTimer = null;

  var QUICK_BUNDLES = {
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
    var toast = document.getElementById("b-micro-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "b-micro-toast";
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

    var scopeText = getVisitScope(jobs.length);
    document.querySelectorAll("[data-visit-scope]").forEach(function (el) {
      el.textContent = scopeText;
      el.classList.toggle("is-active", jobs.length > 0);
    });

    document.querySelectorAll("[data-quick-bundle]").forEach(function (btn) {
      var key = btn.getAttribute("data-quick-bundle");
      var def = QUICK_BUNDLES[key];
      if (!def) return;
      var active = def.jobs.every(function (j) { return jobs.indexOf(j) !== -1; });
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

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
      var added = idx === -1;
      if (added) {
        current.push(val);
      } else {
        current.splice(idx, 1);
      }
      var nextList = saveJobs(current);
      renderBundleUI();
      showMicroToast((added ? "\u2713 Added: " : "Removed: ") + val + " \u00B7 " + getVisitScope(nextList.length));
    });
  }

  document.querySelectorAll("[data-quick-bundle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-quick-bundle");
      var def = QUICK_BUNDLES[key];
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
      renderBundleUI();
      showMicroToast((allActive ? "Cleared " : "\u26A1 Bundled ") + def.label + " \u00B7 " + getVisitScope(saved.length));
    });
  });

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
      var saved = saveJobs(current);
      renderBundleUI();
      showMicroToast("\u2713 Category jobs bundled \u00B7 " + getVisitScope(saved.length));
      var drawerSection = document.getElementById("tool-drawer");
      if (drawerSection) {
        drawerSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  var clearBtn = document.getElementById("clear-drawer-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      saveJobs([]);
      renderBundleUI();
      showMicroToast("Tool-Drawer cleared");
    });
  }

  /* 2. Horizontal Category Scroll-Snap Buttons + Counter + Dots */
  var snapRail = document.getElementById("category-snap-rail");
  var snapBtns = document.querySelectorAll("[data-snap-dir]");
  var snapCounter = document.getElementById("b-snap-counter");
  var snapDots = document.querySelectorAll("[data-snap-dot]");

  if (snapRail) {
    var snapCards = snapRail.querySelectorAll(".snap-card");
    var totalSnap = snapCards.length || 4;

    var updateSnapStatus = function () {
      var railRect = snapRail.getBoundingClientRect();
      var bestIdx = 0;
      var bestDist = Infinity;
      for (var sc = 0; sc < snapCards.length; sc++) {
        var dist = Math.abs(snapCards[sc].getBoundingClientRect().left - railRect.left);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = sc;
        }
      }
      var maxScroll = snapRail.scrollWidth - snapRail.clientWidth;
      if (maxScroll > 10 && snapRail.scrollLeft >= maxScroll - 8) {
        bestIdx = totalSnap - 1;
      }
      if (snapCounter) {
        snapCounter.textContent =
          String(bestIdx + 1).padStart(2, "0") + " / " + String(totalSnap).padStart(2, "0");
      }
      for (var d = 0; d < snapDots.length; d++) {
        snapDots[d].classList.toggle("is-active", d === bestIdx);
      }
    };

    snapRail.addEventListener("scroll", updateSnapStatus, { passive: true });
    window.addEventListener("resize", updateSnapStatus);
    updateSnapStatus();

    for (var s = 0; s < snapBtns.length; s++) {
      snapBtns[s].addEventListener("click", function () {
        var dir = Number(this.getAttribute("data-snap-dir")) || 1;
        var card = snapRail.querySelector(".snap-card");
        var step = card ? card.getBoundingClientRect().width + 16 : 320;
        snapRail.scrollBy({ left: dir * step, behavior: "smooth" });
      });
    }

    for (var dt = 0; dt < snapDots.length; dt++) {
      snapDots[dt].addEventListener("click", function () {
        var targetIdx = Number(this.getAttribute("data-snap-dot")) || 0;
        var targetCard = snapCards[targetIdx];
        if (targetCard) {
          snapRail.scrollTo({ left: targetCard.offsetLeft - snapRail.offsetLeft, behavior: "smooth" });
        }
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

      var areaEl = document.getElementById("b-area");
      var windowEl = document.getElementById("b-window");
      var areaLabel = areaEl && areaEl.selectedIndex >= 0 ? areaEl.options[areaEl.selectedIndex].text : areaVal;
      var windowLabel = windowEl && windowEl.selectedIndex >= 0 ? windowEl.options[windowEl.selectedIndex].text : "Flexible";
      var scopeBadge = getVisitScope(jobs.length || 1);
      var jobListStr = jobs.length ? jobs.join(" \u00B7 ") : "Custom odd-job repair (see notes)";
      var refCode = "EY-" + String(2000 + ((nameVal.length * 131 + notesVal.length * 37) % 7999));

      var setTicketField = function (id, val) {
        var node = document.getElementById(id);
        if (node) node.textContent = val;
      };

      setTicketField("b-ticket-ref", "REF #" + refCode);
      setTicketField("b-ticket-name", nameVal);
      setTicketField("b-ticket-contact", contactVal);
      setTicketField("b-ticket-area", areaLabel + " \u2014 " + windowLabel);
      setTicketField("b-ticket-scope", scopeBadge);
      setTicketField("b-ticket-jobs", jobListStr);
      setTicketField("b-ticket-notes", notesVal);

      form.dataset.plainReceipt = [
        "Eaglescliffe & Yarm Handyman — Enquiry Receipt (#" + refCode + ")",
        "Customer: " + nameVal,
        "Contact: " + contactVal,
        "Area & Slot: " + areaLabel + " — " + windowLabel,
        "Visit Scope: " + scopeBadge,
        "Bundled Odd Jobs: " + jobListStr,
        "Job Notes: " + notesVal
      ].join("\n");

      if (recapEl) {
        recapEl.textContent = "On the live website, this structured docket arrives directly in the workshop inbox.";
      }

      confirmBox.hidden = false;
      confirmBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      confirmBox.focus();
      showMicroToast("\u2713 Demo docket stamped (#" + refCode + ")");
    });

    var copyBtn = document.getElementById("b-copy-summary-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = form.dataset.plainReceipt || "";
        if (navigator.clipboard && navigator.clipboard.writeText && text) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = "\u2713 Summary Copied";
            showMicroToast("\u2713 Summary copied to clipboard");
            window.setTimeout(function () { copyBtn.textContent = "Copy Summary"; }, 2200);
          }).catch(function () {
            showMicroToast("Summary ready");
          });
        } else {
          copyBtn.textContent = "\u2713 Summary Ready";
          showMicroToast("\u2713 Summary ready");
        }
      });
    }

    var resetBtn = document.getElementById("b-reset-demo-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset();
        saveJobs([]);
        renderBundleUI();
        if (confirmBox) confirmBox.hidden = true;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        showMicroToast("Demo docket reset");
      });
    }
  }

  /* 5. Header Scroll-Progress Hairline */
  var progressHairline = document.getElementById("b-scroll-progress");
  if (progressHairline) {
    var progTicking = false;
    var updateProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      progressHairline.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
      progTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!progTicking) {
        progTicking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  /* 6. Native <dialog> Photo Lightbox */
  var lbTriggers = document.querySelectorAll("[data-lightbox-trigger]");
  if (lbTriggers.length > 0 && typeof HTMLDialogElement !== "undefined") {
    var lbDialog = document.createElement("dialog");
    lbDialog.className = "photo-lightbox";
    lbDialog.id = "b-photo-lightbox";
    lbDialog.setAttribute("aria-label", "Workshop photograph close-up");
    lbDialog.innerHTML =
      '<div class="photo-lightbox__bar">' +
        '<span class="photo-lightbox__spec" data-lb-spec>WORKSHOP PLATE</span>' +
        '<button type="button" class="photo-lightbox__close" data-lb-close aria-label="Close photo preview">\u2715</button>' +
      '</div>' +
      '<div class="photo-lightbox__stage">' +
        '<img data-lb-img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="">' +
      '</div>' +
      '<div class="photo-lightbox__foot">' +
        '<div class="photo-lightbox__meta">' +
          '<p class="photo-lightbox__caption" data-lb-caption></p>' +
          '<div><span class="illus-badge illus-badge--inline">Illustrative image</span></div>' +
        '</div>' +
        '<a class="btn btn--signal btn--compact" data-lb-cta href="#docket-form-section">Jump to Quote Docket \u2193</a>' +
      '</div>';
    document.body.appendChild(lbDialog);

    var lbImg = lbDialog.querySelector("[data-lb-img]");
    var lbSpec = lbDialog.querySelector("[data-lb-spec]");
    var lbCap = lbDialog.querySelector("[data-lb-caption]");
    var lbClose = lbDialog.querySelector("[data-lb-close]");
    var lbCta = lbDialog.querySelector("[data-lb-cta]");
    var prevFocus = null;

    var openLb = function (el) {
      prevFocus = el;
      if (lbImg) {
        lbImg.src = el.getAttribute("data-lightbox-src") || "";
        lbImg.alt = el.getAttribute("data-lightbox-alt") || "";
      }
      if (lbSpec) lbSpec.textContent = el.getAttribute("data-lightbox-spec") || "WORKSHOP PLATE";
      if (lbCap) lbCap.textContent = el.getAttribute("data-lightbox-caption") || "";
      if (typeof lbDialog.showModal === "function" && !lbDialog.open) {
        lbDialog.showModal();
      }
    };

    var closeLb = function () {
      if (lbDialog.open) lbDialog.close();
      if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
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

  /* 7. Frosted Mobile Dock Smart Form/Footer Auto-Clearance */
  var mobileDock = document.querySelector(".floating-pill-dock");
  if (mobileDock && "IntersectionObserver" in window) {
    var visibleTargets = new Set();
    var dockObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visibleTargets.add(entry.target);
          else visibleTargets.delete(entry.target);
        });
        mobileDock.classList.toggle("is-cleared", visibleTargets.size > 0);
      },
      { threshold: 0.06 }
    );
    var formTarget = document.getElementById("industrial-docket-form");
    var footerTarget = document.querySelector(".obsidian-footer");
    if (formTarget) dockObs.observe(formTarget);
    if (footerTarget) dockObs.observe(footerTarget);
  }

  renderBundleUI();
})();
