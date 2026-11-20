/* ADWISE: menu, copy-email and scroll reveal. No tracking, no network calls. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    var label = toggle.querySelector(".label");
    if (label) label.textContent = open ? "Close" : "Menu";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !e.target.closest(".site-header")) {
        setMenu(false);
      }
    });
    window.matchMedia("(min-width: 921px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Copy email (clipboard API, then execCommand, then manual select) ---------- */
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function selectNode(node) {
    if (!node || !window.getSelection) return;
    var range = document.createRange();
    range.selectNodeContents(node);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var text = btn.getAttribute("data-copy");
    var status = document.getElementById(btn.getAttribute("aria-describedby") || "") || btn.parentNode.querySelector(".copy-status");
    var label = btn.querySelector(".label");
    var original = label ? label.textContent : "";
    var timer;

    function done(ok) {
      clearTimeout(timer);
      if (ok) {
        if (label) label.textContent = "Copied";
        if (status) status.textContent = "Email address copied to your clipboard.";
      } else {
        selectNode(document.querySelector(".contact-email"));
        if (status) status.textContent = "Copying is blocked here. The address is selected: press Ctrl+C (Cmd+C on Mac).";
      }
      timer = setTimeout(function () {
        if (label) label.textContent = original;
      }, 2600);
    }

    btn.addEventListener("click", function () {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacyCopy(text)); });
      } else {
        done(legacyCopy(text));
      }
    });
  });

  /* ---------- Reveal on scroll (below the fold only) ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          entry.target.classList.remove("reveal-pre");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    var fold = window.innerHeight;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > fold) {
        el.classList.add("reveal-pre");
        io.observe(el);
      }
    });
  }
})();
