/* ==========================================================================
   Eaglescliffe & Yarm Handyman — Workshop Docket & Clipboard Controller
   Zero cookies, zero trackers, zero external network requests.
   Syncs ticked odd jobs across index.html, services.html & quote.html via
   localStorage (with sessionStorage & in-memory fallback for restricted modes).
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "ey_demo_jobs_v2";
  var PATCH_KEY = "ey_demo_patch_v2";
  var memoryJobs = [];
  var toastTimer = null;

  var JOB_BUNDLES = {
    "moving-in": {
      label: "Moving-In 4-Job List",
      jobs: [
        "Flat-pack wardrobe / chest assembly",
        "Hang heavy mirror, blinds or TV bracket",
        "Put up alcove shelving",
        "Ease sticking internal door"
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

  function showMicroToast(message) {
    var toast = document.getElementById("ey-micro-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ey-micro-toast";
      toast.className = "micro-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  var PATCH_DATA = {
    eaglescliffe: {
      stamp: "CORE PATCH · TS16",
      nearby: false,
      areaValue: "eaglescliffe",
      note: "Core local coverage across Eaglescliffe (TS16) — including Yarm Road, Orchard Estate, Swinburne Road, Albert Road and modern residential estates.",
      placeholder: "[Exact TS16 sub-areas – owner to confirm]"
    },
    yarm: {
      stamp: "CORE PATCH · TS15",
      nearby: false,
      areaValue: "yarm",
      note: "Core local coverage across Yarm (TS15) — High Street cottages and wynds, Layfield, Spitalfields, Green Lane, Conyers, Levendale and Mount Leven.",
      placeholder: "[Exact TS15 sub-areas – owner to confirm]"
    },
    egglescliffe: {
      stamp: "CORE PATCH · TS16",
      nearby: false,
      areaValue: "egglescliffe-preston",
      note: "Covered right beside Yarm Bridge — period brick and stone homes around Egglescliffe Village green, Church Road and Butts Lane.",
      placeholder: "[Exact TS16 sub-areas – owner to confirm]"
    },
    kirklevington: {
      stamp: "NEARBY VILLAGE · TS15",
      nearby: true,
      areaValue: "kirklevington",
      note: "Just south of Yarm along the A67 — send your odd-job docket to confirm next available slot.",
      placeholder: "[Surrounding village radius – owner to confirm]"
    },
    aislaby: {
      stamp: "NEARBY VILLAGE · TS16",
      nearby: true,
      areaValue: "aislaby",
      note: "Just west along Aislaby Road from Eaglescliffe & Yarm — pop your job list across to confirm availability.",
      placeholder: "[Surrounding village radius – owner to confirm]"
    },
    preston: {
      stamp: "LOCAL BORDER · TS18 / TS16",
      nearby: false,
      areaValue: "egglescliffe-preston",
      note: "Immediately north of Eaglescliffe along Yarm Road — well suited to single repairs or half-day odd-job lists.",
      placeholder: "[Exact boundary – owner to confirm]"
    }
  };

  function getSavedJobs() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : memoryJobs;
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return memoryJobs.slice();
    }
  }

  function saveJobs(jobs) {
    var unique = Array.from(new Set(jobs));
    memoryJobs = unique;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch (_) {
      /* ignore restricted localStorage */
    }
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    } catch (_) {
      /* ignore restricted sessionStorage */
    }
    return unique;
  }

  function toggleSavedJob(jobValue, isChecked) {
    var set = new Set(getSavedJobs());
    if (isChecked) {
      set.add(jobValue);
    } else {
      set.delete(jobValue);
    }
    return saveJobs(Array.from(set));
  }

  function getSavedPatch() {
    try {
      return window.localStorage.getItem(PATCH_KEY) || window.sessionStorage.getItem(PATCH_KEY) || "";
    } catch (_) {
      return "";
    }
  }

  function savePatch(patchKey) {
    try {
      window.localStorage.setItem(PATCH_KEY, patchKey);
    } catch (_) {}
    try {
      window.sessionStorage.setItem(PATCH_KEY, patchKey);
    } catch (_) {}
  }

  /* ------------------------------------------------------------------------
     1. Accessible Mobile Docket Navigation Toggle
     ------------------------------------------------------------------------ */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Sync Job Count Badges, Clipboard Footer & Services Bar
     ------------------------------------------------------------------------ */
  function updateJobUI(jobs) {
    var count = jobs.length;

    document.querySelectorAll("[data-job-count]").forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

    var headerTally = document.querySelector("[data-docket-tally-text]");
    if (headerTally) {
      headerTally.textContent =
        count === 0
          ? "Your Docket: 0 jobs"
          : count === 1
          ? "Your Docket: 1 job"
          : "Your Docket: " + count + " jobs";
    }

    var clipboardTally = document.querySelector("[data-clipboard-tally]");
    if (clipboardTally) {
      clipboardTally.textContent =
        "Your Docket: " + count + (count === 1 ? " job ticked" : " jobs ticked");
    }

    var clipboardCta = document.querySelector("[data-clipboard-cta-label]");
    if (clipboardCta) {
      clipboardCta.textContent =
        count === 0
          ? "Carry Jobs to Quote Form \u2192"
          : "Carry " + count + (count === 1 ? " Job" : " Jobs") + " to Quote Form \u2192";
    }

    var summaryText = document.querySelector("[data-picker-summary]");
    if (summaryText) {
      summaryText.textContent =
        count === 0
          ? "DOCKET STATUS // 0 jobs ticked — tick items below to carry them onto your quote form."
          : count === 1
          ? "DOCKET STATUS // 1 job stamped onto your quote docket."
          : "DOCKET STATUS // " + count + " jobs stamped onto your quote docket.";
    }

    var scopeText = getVisitScope(count);
    document.querySelectorAll("[data-visit-scope]").forEach(function (el) {
      el.textContent = scopeText;
      el.classList.toggle("is-active", count > 0);
    });

    var jobSet = new Set(jobs);
    document.querySelectorAll("[data-job-bundle]").forEach(function (btn) {
      var key = btn.getAttribute("data-job-bundle");
      var def = JOB_BUNDLES[key];
      if (!def) return;
      var allActive = def.jobs.every(function (j) { return jobSet.has(j); });
      btn.setAttribute("aria-pressed", allActive ? "true" : "false");
    });
  }

  function syncAllPageCheckboxes(jobs) {
    var set = new Set(jobs);
    document.querySelectorAll("input[data-hero-job], input[data-service-job], #quote-form input[name='jobs']").forEach(function (box) {
      box.checked = set.has(box.value);
      var row = box.closest(".clipboard-row");
      if (row) {
        row.classList.toggle("is-ticked", box.checked);
      }
    });
  }

  document.querySelectorAll("[data-job-bundle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-job-bundle");
      var def = JOB_BUNDLES[key];
      if (!def) return;
      var current = new Set(getSavedJobs());
      var alreadyAll = def.jobs.every(function (j) { return current.has(j); });
      if (alreadyAll) {
        def.jobs.forEach(function (j) { current.delete(j); });
      } else {
        def.jobs.forEach(function (j) { current.add(j); });
      }
      var updated = saveJobs(Array.from(current));
      syncAllPageCheckboxes(updated);
      updateJobUI(updated);
      showMicroToast(
        (alreadyAll ? "Cleared bundle: " : "\u26A1 Added " + def.label + " \u00B7 ") +
        getVisitScope(updated.length)
      );
    });
  });

  /* ------------------------------------------------------------------------
     3. Hero Tactile Fridge Odd-Job Clipboard (index.html)
     ------------------------------------------------------------------------ */
  var heroChecks = document.querySelectorAll("input[data-hero-job]");
  if (heroChecks.length > 0) {
    var savedSet = new Set(getSavedJobs());

    var syncRowVisual = function (box) {
      var row = box.closest(".clipboard-row");
      if (row) {
        row.classList.toggle("is-ticked", box.checked);
      }
    };

    heroChecks.forEach(function (box) {
      box.checked = savedSet.has(box.value);
      syncRowVisual(box);

      box.addEventListener("change", function () {
        syncRowVisual(box);
        var updated = toggleSavedJob(box.value, box.checked);
        updateJobUI(updated);
        showMicroToast(
          (box.checked ? "\u2713 Added: " : "Removed: ") +
          box.value +
          " \u00B7 " +
          getVisitScope(updated.length)
        );
      });
    });

    var clearBtn = document.querySelector("[data-clipboard-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        heroChecks.forEach(function (box) {
          box.checked = false;
          syncRowVisual(box);
        });
        var cleared = saveJobs([]);
        updateJobUI(cleared);
        showMicroToast("Clipboard cleared");
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. Interactive Postcode / Village Instant Patch Checker (index & areas)
     ------------------------------------------------------------------------ */
  document.querySelectorAll("[data-patch-checker]").forEach(function (checker) {
    var pills = checker.querySelectorAll("[data-patch-pill]");
    var readout = checker.querySelector("[data-patch-readout]");
    var stampEl = checker.querySelector("[data-patch-stamp]");
    var noteEl = checker.querySelector("[data-patch-note]");
    var phEl = checker.querySelector("[data-patch-ph]");
    var linkEl = checker.querySelector("[data-patch-link]");

    function renderPatch(key) {
      var info = PATCH_DATA[key] || PATCH_DATA.eaglescliffe;
      pills.forEach(function (p) {
        p.setAttribute("aria-pressed", p.getAttribute("data-patch-pill") === key ? "true" : "false");
      });
      if (readout) {
        readout.classList.toggle("patch-readout--nearby", Boolean(info.nearby));
      }
      if (stampEl) stampEl.textContent = info.stamp;
      if (noteEl) noteEl.textContent = info.note + " ";
      if (phEl) phEl.textContent = info.placeholder;
      if (linkEl) {
        linkEl.setAttribute("href", "quote.html?area=" + encodeURIComponent(info.areaValue));
      }
    }

    var initialPatch = getSavedPatch();
    if (!PATCH_DATA[initialPatch]) {
      initialPatch = "eaglescliffe";
    }
    renderPatch(initialPatch);

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var key = pill.getAttribute("data-patch-pill");
        savePatch(key);
        renderPatch(key);
      });
    });
  });

  /* ------------------------------------------------------------------------
     5. Services Page: Full Trade Odd-Job Checklist (services.html)
     ------------------------------------------------------------------------ */
  var serviceChecks = document.querySelectorAll("input[data-service-job]");
  if (serviceChecks.length > 0) {
    var initialServiceJobs = new Set(getSavedJobs());
    serviceChecks.forEach(function (box) {
      box.checked = initialServiceJobs.has(box.value);
      box.addEventListener("change", function () {
        var updated = toggleSavedJob(box.value, box.checked);
        updateJobUI(updated);
        showMicroToast(
          (box.checked ? "\u2713 Added: " : "Removed: ") +
          box.value +
          " \u00B7 " +
          getVisitScope(updated.length)
        );
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. Quote Page: Pre-check Saved Jobs, Area Param & Dummy Form Submit
     ------------------------------------------------------------------------ */
  var quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    var savedQuoteJobs = new Set(getSavedJobs());
    var formJobBoxes = quoteForm.querySelectorAll('input[name="jobs"]');
    var params = new URLSearchParams(window.location.search);

    var paramJob = params.get("job");
    if (paramJob) {
      savedQuoteJobs.add(paramJob);
      saveJobs(Array.from(savedQuoteJobs));
    }

    var areaSelectEl = document.getElementById("q-area");
    var paramArea = params.get("area");
    if (!paramArea) {
      var storedPatchKey = getSavedPatch();
      if (storedPatchKey && PATCH_DATA[storedPatchKey]) {
        paramArea = PATCH_DATA[storedPatchKey].areaValue;
      }
    }
    if (areaSelectEl && paramArea) {
      var matchingOpt = areaSelectEl.querySelector('option[value="' + paramArea + '"]');
      if (matchingOpt) {
        areaSelectEl.value = paramArea;
      }
    }

    formJobBoxes.forEach(function (box) {
      box.checked = savedQuoteJobs.has(box.value);
      box.addEventListener("change", function () {
        var updated = toggleSavedJob(box.value, box.checked);
        updateJobUI(updated);
        showMicroToast(
          (box.checked ? "\u2713 Added: " : "Removed: ") +
          box.value +
          " \u00B7 " +
          getVisitScope(updated.length)
        );
      });
    });

    var clearErr = function (input) {
      input.removeAttribute("aria-invalid");
      var errEl = document.getElementById(input.id + "-err");
      if (errEl) errEl.textContent = "";
    };

    var setErr = function (input, msg) {
      input.setAttribute("aria-invalid", "true");
      var errEl = document.getElementById(input.id + "-err");
      if (errEl) errEl.textContent = msg;
    };

    quoteForm.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        clearErr(el);
      });
      el.addEventListener("change", function () {
        clearErr(el);
      });
    });

    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameInput = document.getElementById("q-name");
      var contactInput = document.getElementById("q-contact");
      var areaSelect = document.getElementById("q-area");
      var detailsInput = document.getElementById("q-details");

      var firstInvalid = null;

      if (!nameInput.value.trim()) {
        setErr(nameInput, "Please enter your name.");
        firstInvalid = firstInvalid || nameInput;
      }
      if (!contactInput.value.trim()) {
        setErr(contactInput, "Please enter a phone number or email address for your quote.");
        firstInvalid = firstInvalid || contactInput;
      }
      if (!areaSelect.value) {
        setErr(areaSelect, "Please choose your area or village.");
        firstInvalid = firstInvalid || areaSelect;
      }
      if (!detailsInput.value.trim()) {
        setErr(detailsInput, "Please add a short note describing the job(s).");
        firstInvalid = firstInvalid || detailsInput;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var ticked = Array.from(formJobBoxes)
        .filter(function (c) {
          return c.checked;
        })
        .map(function (c) {
          return c.value;
        });

      var postcodeInput = document.getElementById("q-postcode");
      var timingSelect = document.getElementById("q-timing");
      var areaText = areaSelect.options[areaSelect.selectedIndex].text;
      var postcodeVal = postcodeInput && postcodeInput.value.trim() ? " (" + postcodeInput.value.trim().toUpperCase() + ")" : "";
      var timingText = timingSelect ? timingSelect.options[timingSelect.selectedIndex].text : "Flexible";
      var jobsText = ticked.length ? ticked.join(" \u00B7 ") : "General home repair docket (see notes)";
      var scopeBadge = getVisitScope(ticked.length || 1);
      var refCode = "EY-" + String(1000 + ((nameInput.value.trim().length * 137 + detailsInput.value.trim().length * 29) % 8999));

      var setTxt = function (id, val) {
        var node = document.getElementById(id);
        if (node) node.textContent = val;
      };

      setTxt("demo-ticket-ref", "REF #" + refCode);
      setTxt("demo-ticket-name", nameInput.value.trim());
      setTxt("demo-ticket-contact", contactInput.value.trim());
      setTxt("demo-ticket-area", areaText + postcodeVal + " \u2014 " + timingText);
      setTxt("demo-ticket-scope", scopeBadge);
      setTxt("demo-ticket-jobs", jobsText);
      setTxt("demo-ticket-notes", detailsInput.value.trim());

      quoteForm.dataset.plainReceipt = [
        "Eaglescliffe & Yarm Handyman — Enquiry Receipt (#" + refCode + ")",
        "Customer: " + nameInput.value.trim(),
        "Contact: " + contactInput.value.trim(),
        "Area & Timing: " + areaText + postcodeVal + " — " + timingText,
        "Visit Scope: " + scopeBadge,
        "Selected Jobs: " + jobsText,
        "Notes: " + detailsInput.value.trim()
      ].join("\n");

      var resultBox = document.getElementById("demo-result");
      var summarySlot = document.getElementById("demo-summary");
      if (summarySlot) {
        summarySlot.textContent =
          "On the live website, this structured docket arrives straight in the owner\u2019s inbox with optional photo attachments.";
      }

      if (resultBox) {
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        resultBox.focus();
      }
      showMicroToast("\u2713 Demo docket stamped (#" + refCode + ")");
    });

    var copyBtn = document.getElementById("demo-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var text = quoteForm.dataset.plainReceipt || "";
        if (navigator.clipboard && navigator.clipboard.writeText && text) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = "\u2713 Summary Copied";
            showMicroToast("\u2713 Enquiry summary copied to clipboard");
            window.setTimeout(function () { copyBtn.textContent = "Copy Summary"; }, 2200);
          }).catch(function () {
            showMicroToast("Summary ready to copy");
          });
        } else {
          copyBtn.textContent = "\u2713 Summary Ready";
          showMicroToast("\u2713 Summary ready");
        }
      });
    }

    var resetBtn = document.getElementById("demo-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        quoteForm.reset();
        saveJobs([]);
        syncAllPageCheckboxes([]);
        updateJobUI([]);
        var resultBox = document.getElementById("demo-result");
        if (resultBox) resultBox.hidden = true;
        quoteForm.scrollIntoView({ behavior: "smooth", block: "start" });
        showMicroToast("Demo docket reset");
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. Accessible Native <dialog> Photo Lightbox + Dock Auto-Clearance
     ------------------------------------------------------------------------ */
  var lightboxTriggers = document.querySelectorAll("[data-lightbox-trigger]");
  if (lightboxTriggers.length > 0 && typeof HTMLDialogElement !== "undefined") {
    var dialog = document.createElement("dialog");
    dialog.className = "photo-lightbox";
    dialog.id = "photo-lightbox";
    dialog.setAttribute("aria-label", "Workshop photograph close-up");

    var isQuotePage = Boolean(document.getElementById("quote-form"));
    var ctaHref = isQuotePage ? "#quote-form" : "quote.html";

    dialog.innerHTML =
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
          '<div><span class="illus-tag">Illustrative image</span></div>' +
        '</div>' +
        '<a class="btn btn--primary btn--sm" data-lb-cta href="' + ctaHref + '">Add to Quote Docket \u2192</a>' +
      '</div>';

    document.body.appendChild(dialog);

    var lbImg = dialog.querySelector("[data-lb-img]");
    var lbSpec = dialog.querySelector("[data-lb-spec]");
    var lbCap = dialog.querySelector("[data-lb-caption]");
    var lbClose = dialog.querySelector("[data-lb-close]");
    var lbCta = dialog.querySelector("[data-lb-cta]");
    var lastTrigger = null;

    var openLightbox = function (el) {
      lastTrigger = el;
      var src = el.getAttribute("data-lightbox-src") || "";
      var alt = el.getAttribute("data-lightbox-alt") || "";
      var cap = el.getAttribute("data-lightbox-caption") || "";
      var spec = el.getAttribute("data-lightbox-spec") || "WORKSHOP PLATE";
      if (lbImg) {
        lbImg.src = src;
        lbImg.alt = alt;
      }
      if (lbSpec) lbSpec.textContent = spec;
      if (lbCap) lbCap.textContent = cap;
      if (typeof dialog.showModal === "function" && !dialog.open) {
        dialog.showModal();
      }
    };

    var closeLightbox = function () {
      if (dialog.open) dialog.close();
      if (lastTrigger && typeof lastTrigger.focus === "function") {
        lastTrigger.focus();
      }
    };

    lbClose.addEventListener("click", closeLightbox);
    lbCta.addEventListener("click", function () {
      if (dialog.open) dialog.close();
    });
    dialog.addEventListener("click", function (ev) {
      if (ev.target === dialog) {
        closeLightbox();
      }
    });

    lightboxTriggers.forEach(function (el) {
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
      }
      el.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return;
        openLightbox(el);
      });
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openLightbox(el);
        }
      });
    });
  }

  var mobileDock = document.querySelector(".mobile-dock");
  if (mobileDock && "IntersectionObserver" in window) {
    var activeZones = new Set();
    var dockObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeZones.add(entry.target);
          } else {
            activeZones.delete(entry.target);
          }
        });
        mobileDock.classList.toggle("is-cleared", activeZones.size > 0);
      },
      { threshold: 0.06 }
    );
    var qForm = document.getElementById("quote-form");
    var sFooter = document.querySelector(".site-footer");
    if (qForm) dockObserver.observe(qForm);
    if (sFooter) dockObserver.observe(sFooter);
  }

  updateJobUI(getSavedJobs());
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle Top Header Reading-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.appendChild(rail);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // 2. Choreographed Below-the-Fold Scroll Reveals (Godly / SiteInspire)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.service-card, .area-card, .trust-card, .process-step, .faq-item, .checklist-card');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.94) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      // Safety fallback on hash jump so targeted sections reveal immediately
      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Smart Date Defaults + 1-Tap Quick Date Chips
    function toIso(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    function nextWeekday(base, targetDow) {
      var diff = (targetDow - base.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
    }

    var today = new Date();
    var todayIso = toIso(today);
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) {
        input.min = todayIso;
      }
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          { label: 'Same Day', calc: function () { var o = document.getElementById('outbound-date'); return (o && o.value) ? o.value : todayIso; } },
          { label: '+2 Days', calc: function () {
            var o = document.getElementById('outbound-date');
            var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          } }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
          { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
        ];
      }

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          var val = p.calc ? p.calc() : p.iso;
          input.value = val;
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
