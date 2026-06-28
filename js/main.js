/**
 * main.js — Operational Profile Interactive Layer
 * =================================================
 * Handles:
 *   - Mobile navigation toggle
 *   - Active nav link highlighting on scroll
 *   - UTC clock (status bar)
 *   - Uptime counter (status bar)
 *   - Footer copyright year (auto-updates)
 *   - Smooth scroll for anchor links
 *
 * Design principles:
 *   - No dependencies — vanilla JS only
 *   - Respects prefers-reduced-motion
 *   - Cleans up intervals/observers on page hide
 *   - All DOM queries guarded — fails silently if element absent
 *
 * @author  Dwayne Pugh
 * @version 2.0.0
 */

'use strict';

/* ============================================================
   Constants
   ============================================================ */

/**
 * Epoch used for uptime counter.
 * Set to the date this profile v2 launched.
 * Update this when you do a major relaunch.
 * @type {Date}
 */
const LAUNCH_DATE = new Date('2026-01-01T00:00:00Z');

/** How often (ms) the status bar clock refreshes. */
const CLOCK_INTERVAL_MS = 1000;

/** Intersection threshold to consider a section "in view" for nav highlighting. */
const NAV_INTERSECT_THRESHOLD = 0.3;


/* ============================================================
   Utilities
   ============================================================ */

/**
 * Safe querySelector — returns null without throwing if selector fails.
 * @param {string} selector
 * @param {Document|Element} [root=document]
 * @returns {Element|null}
 */
const $ = (selector, root = document) => {
  try {
    return root.querySelector(selector);
  } catch {
    return null;
  }
};

/**
 * Safe querySelectorAll — returns empty NodeList on failure.
 * @param {string} selector
 * @param {Document|Element} [root=document]
 * @returns {NodeList}
 */
const $$ = (selector, root = document) => {
  try {
    return root.querySelectorAll(selector);
  } catch {
    return document.createDocumentFragment().childNodes; // empty NodeList-like
  }
};

/**
 * Pad a number to 2 digits with a leading zero.
 * @param {number} n
 * @returns {string}
 */
const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Format elapsed milliseconds as  Xd Xh Xm Xs
 * @param {number} ms — elapsed milliseconds
 * @returns {string}
 */
const formatUptime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
};


/* ============================================================
   Module: UTC Clock
   ============================================================ */

/**
 * Starts a live UTC clock in the status bar.
 * Updates every second.
 * @returns {number} interval ID (for cleanup)
 */
const initClock = () => {
  const el = $('#clock-value');
  if (!el) return null;

  const tick = () => {
    const now = new Date();
    const h = pad2(now.getUTCHours());
    const m = pad2(now.getUTCMinutes());
    const s = pad2(now.getUTCSeconds());
    el.textContent = `${h}:${m}:${s} UTC`;
  };

  tick(); // immediate first render — avoids 1s blank
  return setInterval(tick, CLOCK_INTERVAL_MS);
};


/* ============================================================
   Module: Uptime Counter
   ============================================================ */

/**
 * Starts the uptime counter in the status bar.
 * Counts up from LAUNCH_DATE.
 * @returns {number} interval ID (for cleanup)
 */
const initUptime = () => {
  const el = $('#uptime-value');
  if (!el) return null;

  const tick = () => {
    const elapsed = Date.now() - LAUNCH_DATE.getTime();
    el.textContent = formatUptime(elapsed);
  };

  tick();
  return setInterval(tick, CLOCK_INTERVAL_MS);
};


/* ============================================================
   Module: Mobile Navigation
   ============================================================ */

/**
 * Wires up the mobile hamburger toggle.
 * Manages aria-expanded and the .is-open class.
 * Closes menu on outside click or Escape key.
 */
const initMobileNav = () => {
  const toggle = $('#nav-toggle');
  const menu   = $('#nav-menu');

  if (!toggle || !menu) return;

  const open  = () => { menu.classList.add('is-open');    toggle.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
  const isOpen = () => menu.classList.contains('is-open');

  toggle.addEventListener('click', () => isOpen() ? close() : open());

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen() && !toggle.contains(e.target) && !menu.contains(e.target)) {
      close();
    }
  });

  // Close when a nav link is tapped (single-page anchor nav)
  $$('a', menu).forEach((link) => {
    link.addEventListener('click', close);
  });
};


/* ============================================================
   Module: Active Nav Highlighting
   ============================================================ */

/**
 * Uses IntersectionObserver to highlight the nav link
 * corresponding to the section currently in view.
 * Falls back gracefully if IntersectionObserver is unavailable.
 */
const initActiveNav = () => {
  if (!('IntersectionObserver' in window)) return;

  const navLinks = $$('.nav__link[href^="#"]');
  if (!navLinks.length) return;

  // Build a map of section-id → nav link
  const linkMap = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    if (id) linkMap.set(id, link);
  });

  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.remove('is-active'));
    const active = linkMap.get(id);
    if (active) active.classList.add('is-active');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { threshold: NAV_INTERSECT_THRESHOLD }
  );

  // Observe every section that has a matching nav link
  linkMap.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  // Store reference for cleanup
  return observer;
};


/* ============================================================
   Module: Footer Year
   ============================================================ */

/**
 * Keeps the copyright year current automatically.
 */
const initFooterYear = () => {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
};


/* ============================================================
   Module: Scroll-triggered reveal (respects reduced motion)
   ============================================================ */

/**
 * Fades in cards and panels as they enter the viewport.
 * Skipped entirely when prefers-reduced-motion is set.
 */
const initScrollReveal = () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) return;

  const targets = $$('.focus-card, .work-card, .metric-card, .training-card, .contact-card, .sys-panel, .cohort-panel');

  // Set initial state via JS (not CSS) so non-JS users see content normally
  targets.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = 'opacity 400ms ease, transform 400ms ease';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
  );

  targets.forEach((el) => observer.observe(el));

  return observer;
};


/* ============================================================
   Init & Cleanup
   ============================================================ */

/** Holds references to intervals and observers for cleanup. */
const _handles = {
  clockInterval:  null,
  uptimeInterval: null,
  navObserver:    null,
  revealObserver: null,
};

/**
 * Bootstrap all modules once the DOM is ready.
 */
const init = () => {
  _handles.clockInterval  = initClock();
  _handles.uptimeInterval = initUptime();
  _handles.navObserver    = initActiveNav();
  _handles.revealObserver = initScrollReveal();

  initMobileNav();
  initFooterYear();

  console.log('[dpugh143] Operational profile v2.0 initialized.');
};

/**
 * Tear down timers and observers when the page is hidden
 * (tab switch, navigation away). Prevents memory leaks in SPAs
 * and avoids background CPU usage from setInterval.
 */
const teardown = () => {
  if (_handles.clockInterval)  clearInterval(_handles.clockInterval);
  if (_handles.uptimeInterval) clearInterval(_handles.uptimeInterval);
  if (_handles.navObserver)    _handles.navObserver.disconnect();
  if (_handles.revealObserver) _handles.revealObserver.disconnect();
};

// Entry point — wait for DOM, then init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM already ready
}

// Cleanup on page hide
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') teardown();
});
