/* ==========================================================================
   Eaglescliffe & Yarm Handyman — Client-Side UI & Demo Form Controller
   Zero cookies, zero trackers, zero external network requests.
   Uses sessionStorage solely within the tab to carry ticked odd jobs
   from services.html to quote.html during a demo walkthrough.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "ey_demo_jobs";

  function getSavedJobs() {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveJobs(jobs) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (_) {
      /* ignore private-mode storage restrictions */
    }
  }

  /* 1. Accessible Mobile Navigation Toggle */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const open = siteNav.classList.toggle("is-open");
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

  /* 2. Sync Job Count Badges Across Header, Sticky Bar & Services Picker */
  function updateJobBadges(jobs) {
    const count = jobs.length;
    document.querySelectorAll("[data-job-count]").forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

    const summaryText = document.querySelector("[data-picker-summary]");
    if (summaryText) {
      summaryText.textContent =
        count === 0
          ? "Tick the jobs on your list below, then send them straight to the quote form."
          : count === 1
          ? "1 job added to your quote list."
          : count + " jobs added to your quote list.";
    }
  }

  /* 3. Services Page: Interactive Odd-Job Checklist */
  const serviceChecks = document.querySelectorAll("input[data-service-job]");
  if (serviceChecks.length > 0) {
    const initial = new Set(getSavedJobs());
    serviceChecks.forEach(function (box) {
      if (initial.has(box.value)) {
        box.checked = true;
      }
      box.addEventListener("change", function () {
        const selected = Array.from(serviceChecks)
          .filter(function (c) {
            return c.checked;
          })
          .map(function (c) {
            return c.value;
          });
        saveJobs(selected);
        updateJobBadges(selected);
      });
    });
  }

  /* 4. Quote Page: Pre-check Saved Jobs & Handle Dummy Submission */
  const quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    const saved = new Set(getSavedJobs());
    const formJobBoxes = quoteForm.querySelectorAll('input[name="jobs"]');

    /* Also accept ?job=... query param from quick links */
    const params = new URLSearchParams(window.location.search);
    const paramJob = params.get("job");
    if (paramJob) {
      saved.add(paramJob);
    }

    formJobBoxes.forEach(function (box) {
      if (saved.has(box.value)) {
        box.checked = true;
      }
      box.addEventListener("change", function () {
        const selected = Array.from(formJobBoxes)
          .filter(function (c) {
            return c.checked;
          })
          .map(function (c) {
            return c.value;
          });
        saveJobs(selected);
        updateJobBadges(selected);
      });
    });

    const clearErr = function (input) {
      input.removeAttribute("aria-invalid");
      const errEl = document.getElementById(input.id + "-err");
      if (errEl) errEl.textContent = "";
    };

    const setErr = function (input, msg) {
      input.setAttribute("aria-invalid", "true");
      const errEl = document.getElementById(input.id + "-err");
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

      const nameInput = document.getElementById("q-name");
      const contactInput = document.getElementById("q-contact");
      const areaSelect = document.getElementById("q-area");
      const detailsInput = document.getElementById("q-details");

      let firstInvalid = null;

      if (!nameInput.value.trim()) {
        setErr(nameInput, "Please enter your name.");
        firstInvalid = firstInvalid || nameInput;
      }
      if (!contactInput.value.trim()) {
        setErr(contactInput, "Please enter a phone number or email address for the quote.");
        firstInvalid = firstInvalid || contactInput;
      }
      if (!areaSelect.value) {
        setErr(areaSelect, "Please choose your area.");
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

      const ticked = Array.from(formJobBoxes)
        .filter(function (c) {
          return c.checked;
        })
        .map(function (c) {
          return c.value;
        });

      const resultBox = document.getElementById("demo-result");
      const summarySlot = document.getElementById("demo-summary");
      if (summarySlot) {
        const areaText = areaSelect.options[areaSelect.selectedIndex].text;
        const jobsText = ticked.length ? ticked.join(", ") : "General home repair enquiry";
        summarySlot.textContent =
          "Preview summary: " +
          nameInput.value.trim() +
          " (" +
          areaText +
          ") — " +
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

  updateJobBadges(getSavedJobs());
})();
