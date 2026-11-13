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
  }

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

      var resultBox = document.getElementById("demo-result");
      var summarySlot = document.getElementById("demo-summary");
      if (summarySlot) {
        var areaText = areaSelect.options[areaSelect.selectedIndex].text;
        var jobsText = ticked.length ? ticked.join("; ") : "General home repair docket";
        summarySlot.textContent =
          "Docket preview: " +
          nameInput.value.trim() +
          " (" +
          areaText +
          ") \u2014 " +
          jobsText +
          ".";
      }

      if (resultBox) {
        resultBox.hidden = false;
        resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        resultBox.focus();
      }
    });
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
