
(function(){
  "use strict";
  var q = new URLSearchParams(location.search);
  var CAPTURE = q.has("capture");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // phones: the address bar showing/hiding must not re-layout the pinned hero
  ScrollTrigger.config({ ignoreMobileResize: true });
  var touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (CAPTURE) document.documentElement.classList.add("capture");

  // smooth scroll
  var lenis = null;
  if (!CAPTURE && !reduce && !touch && window.Lenis) {
    // smooth wheel on desktop only; on phones native touch/momentum scrolling drives everything
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var el = document.querySelector(a.getAttribute("href"));
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navh")) || 64) - (el.classList.contains("mcat") ? 70 : 0), duration: 1.4 }); }
      });
    });
  }

  var mobile = window.matchMedia("(max-width: 820px)").matches;
  var $ = function(s){ return document.querySelector(s); };
  var all = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };


  // ---- hero: every dish in turn, ~3 s each, each with its own 3D camera move.
  // Layers: backdrop · far embers · dish (+ contact shadow) · near embers; transform/opacity only.
  var SLIDES = [{"s": "chicken-biryani", "n": "Chicken Dum Biryani + Seasoned Yogurt", "p": "€17.99", "m": "sequence"}, {"s": "chicken-kebab-dry", "n": "Chicken Kebab (Dry)", "p": "€14.00", "m": "orbitL", "l": 0.057, "r": 0.942, "b": 0.986, "f": 0, "v": 1}, {"s": "chicken-65", "n": "Chicken 65", "p": "€15.50", "m": "dollyIn", "l": 0.093, "r": 0.899, "b": 0.985, "f": 0, "v": 1}, {"s": "samosa", "n": "Samosa", "p": "€8.50", "m": "riseUp", "l": 0.053, "r": 0.948, "b": 0.985, "f": 0, "v": 1}, {"s": "cashew-pakoda", "n": "Cashew Pakoda", "p": "€13.50", "m": "orbitR", "l": 0.105, "r": 0.909, "b": 0.952, "f": 0, "v": 1}, {"s": "paneer-dum-biryani", "n": "Paneer Dum Biryani", "p": "€16.99", "m": "tiltDown", "l": 0.09, "r": 0.908, "b": 0.934, "f": 0, "v": 1}, {"s": "egg-biryani", "n": "Egg Biryani", "p": "€16.00", "m": "diagonal", "l": 0.096, "r": 0.902, "b": 0.878, "f": 1, "v": 1}, {"s": "bagara-rice", "n": "Bagara Rice + Spicy Chicken Curry", "p": "€15.66", "m": "pullBack", "l": 0.111, "r": 0.887, "b": 0.908, "f": 1, "v": 1}, {"s": "masala-dosa-deluxe", "n": "Crispy Masala Dosa + Chutney", "p": "€11.99", "m": "spin", "l": 0.089, "r": 0.918, "b": 0.986, "f": 0, "v": 1}, {"s": "idli-new", "n": "Idli + Chutney", "p": "€10.00", "m": "explode", "l": 0.118, "r": 0.881, "b": 0.979, "f": 0, "v": 1}, {"s": "vada-new", "n": "Vada + Chutney", "p": "€10.45", "m": "orbitL", "l": 0.051, "r": 0.948, "b": 0.985, "f": 0, "v": 1}, {"s": "idli-vada-chutney", "n": "Idli Vada Chutney", "p": "€14.99", "m": "dollyIn", "l": 0.085, "r": 0.907, "b": 0.958, "f": 0, "v": 1}, {"s": "plain-paratha-dal", "n": "Plain Paratha + Dal Fry", "p": "€11.50", "m": "riseUp", "l": 0.14, "r": 0.858, "b": 0.985, "f": 0, "v": 1}, {"s": "potato-paratha-new", "n": "Potato Stuffed Paratha + Seasoned Yogurt", "p": "€11.50", "m": "orbitR", "l": 0.051, "r": 0.948, "b": 0.966, "f": 0}, {"s": "paneer-paratha", "n": "Paneer Paratha + Seasoned Yogurt", "p": "€12.31", "m": "tiltDown", "l": 0.051, "r": 0.918, "b": 0.985, "f": 0, "v": 1}, {"s": "pongal", "n": "Pongal + Chutney", "p": "€11.19", "m": "diagonal", "l": 0.146, "r": 0.852, "b": 0.938, "f": 0, "v": 1}, {"s": "dosa-batter", "n": "Fresh Dosa & Idli Batter", "p": "€8.99", "m": "pullBack", "l": 0.191, "r": 0.808, "b": 0.954, "f": 0, "v": 1}, {"s": "paneer-butter-masala", "n": "Paneer Butter Masala + 2 Roti + Jeera Rice", "p": "€16.79", "m": "spin", "l": 0.245, "r": 0.754, "b": 0.986, "f": 0, "v": 1}, {"s": "butter-chicken", "n": "Butter Chicken", "p": "€17.00", "m": "explode", "l": 0.1, "r": 0.897, "b": 0.951, "f": 0, "v": 1}, {"s": "masala-tea", "n": "Masala Tea", "p": "€3.35", "m": "orbitL", "l": 0.094, "r": 0.904, "b": 0.985, "f": 0, "v": 1}, {"s": "mango-lassi", "n": "Mango Lassi", "p": "€5.99", "m": "dollyIn", "l": 0.051, "r": 0.948, "b": 0.985, "f": 0, "v": 1}, {"s": "sesame-dry-fruits-laddu", "n": "Sesame Dry Fruits Laddu", "p": "€11.00", "m": "riseUp", "l": 0.137, "r": 0.86, "b": 0.984, "f": 0, "v": 1}];
  var hero = $(".hero"), stage = $(".hstage"), cap = $(".hcap"), capN = $(".hcap-n"), capP = $(".hcap-p");
  var bgL = $(".hbg"), farL = $(".hfar"), nearL = $(".hnear");
  var hq = q.get("hero"), STILL = CAPTURE || (hq !== null && hq !== "");
  var P = 3.0, PSEQ = 4.2;               // seconds per slide (the biryani's explode gets a little longer)
  var els = [], loaded = [], cur = 0, timer = null, running = false;

  // the biryani: SpiceIndia's own exploding-plate clip, auto-played on a canvas
  var SEQ = mobile ? "img/seq/m/" : "img/seq/d/", FR = [];
  for (var k = 0; k <= 120; k += 2) FR.push(k); FR.push(121);
  var frames = [], nOk = 0, seqReady = false, cv = $(".hseq"), ctx = cv.getContext("2d"), seqBox = cv.parentNode;
  var seqState = { f: 0 }, shownF = -1;
  function loadSeq(){
    FR.forEach(function(n, i){
      var im = new Image(); im.decoding = "async";
      im.onload = function(){ frames[i] = im; nOk++; if (i === 0) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; drawF(0); } if (nOk >= FR.length) seqReady = true; };
      im.onerror = function(){ nOk++; if (nOk >= FR.length) seqReady = true; };
      im.src = SEQ + "f" + ("00" + n).slice(-3) + ".webp";
    });
  }
  function drawF(i){
    i = Math.max(0, Math.min(FR.length - 1, Math.round(i)));
    if (i === shownF) return;
    var j = i; while (j > 0 && !frames[j]) j--;
    if (!frames[j]) return;
    ctx.drawImage(frames[j], 0, 0, cv.width, cv.height); shownF = i;
    if (!seqBox.classList.contains("seq-on")) seqBox.classList.add("seq-on");
  }

  // video slides (luxury levitation clips): full-motion only on a decent connection; otherwise the 3D still stands in
  var conn = navigator.connection || {};
  var canVid = !reduce && !STILL && !conn.saveData && !/(^|-)2g|3g/.test(conn.effectiveType || "") && !!document.createElement("video").canPlayType;
  function vidOf(i){ return els[i] && els[i].querySelector("video"); }
  function warmVid(i){
    var s = SLIDES[i], v; if (!s || !s.v || !canVid) return;
    build(i); v = vidOf(i); if (!v || v.getAttribute("src")) return;
    v.preload = "auto"; v.src = "img/hero/vid/" + s.s + ".mp4"; v.load();
  }
  // slide elements: the first is in the HTML; the rest are built and loaded after the page is up
  els[0] = $(".hslide"); loaded[0] = true;
  function build(i){
    if (els[i]) return els[i];
    var s = SLIDES[i], el = document.createElement("div");
    el.className = "hslide"; el.setAttribute("data-i", i);
    var w = (s.r - s.l) * 100;
    el.innerHTML = s.v
      // levitation-clip dish: its poster (the clip's first frame) stands in until the clip can play
      ? '<div class="hmov"><div class="hdish is-vid"><img alt="" decoding="async">' + (canVid ? '<video muted playsinline preload="none" disableremoteplayback></video>' : "") + '</div></div>'
      : '<div class="hmov"><div class="hshadow" style="left:' + (s.l * 100 + w * 0.08).toFixed(1) + '%;width:' + (w * 0.84).toFixed(1) + '%;top:' + (s.b * 100 - (s.f ? 16 : 8)).toFixed(1) + '%' + (s.f ? ';opacity:.55' : '') + '"></div>' +
        '<div class="hdish"><img alt="" decoding="async"></div>' + (s.m === "explode" ? '<div class="hburst"></div>' : "") + '</div>';
    stage.appendChild(el); els[i] = el;
    return el;
  }
  function load(i, done){
    var el = build(i), im = el.querySelector("img");
    if (loaded[i]) { done && done(); return; }
    im.onload = function(){ var fin = function(){ loaded[i] = true; done && done(); }; if (im.decode) im.decode().then(fin, fin); else fin(); };
    im.onerror = function(){ done && done(); };
    im.src = (SLIDES[i].v ? "img/hero/vid/" : "img/hero/dish/") + SLIDES[i].s + ".webp";
  }
  function preloadAll(){
    var next = 1, active = 0;
    function pump(){ while (active < 2 && next < SLIDES.length) { active++; load(next++, function(){ active--; pump(); }); } }
    pump();
  }

  // camera moves: enter (how the plate arrives), mov (the 3 s move), par (backdrop/ember parallax), exit
  var M = {
    sequence: { enter: { z: -260, opacity: 0 }, from: { rotationY: -7, rotationX: 4 }, to: { rotationY: 6, rotationX: 0 },
      par: { bg: { x: 0, y: 0, scale: 1.02 }, far: { x: 0, y: -20, scale: 1.04 }, near: { x: 0, y: -50, scale: 1.08 } }, exit: { z: 480, scale: 1.2, opacity: 0 } },
    orbitL: { enter: { rotationY: -42, xPercent: 22, z: -300, opacity: 0 }, from: { rotationY: 13, xPercent: 3 }, to: { rotationY: -11, xPercent: -3 },
      par: { bg: { x: 18, y: 0, scale: 1.03 }, far: { x: 40, y: 0, scale: 1.05 }, near: { x: 80, y: 0, scale: 1.1 } }, exit: { rotationY: -55, xPercent: -30, z: -320, opacity: 0 } },
    orbitR: { enter: { rotationY: 42, xPercent: -22, z: -300, opacity: 0 }, from: { rotationY: -13, xPercent: -3 }, to: { rotationY: 11, xPercent: 3 },
      par: { bg: { x: -18, y: 0, scale: 1.03 }, far: { x: -40, y: 0, scale: 1.05 }, near: { x: -80, y: 0, scale: 1.1 } }, exit: { rotationY: 55, xPercent: 30, z: -320, opacity: 0 } },
    dollyIn: { enter: { z: -800, opacity: 0 }, from: { z: -70, scale: 0.96 }, to: { z: 130, scale: 1.03 },
      par: { bg: { x: 0, y: 0, scale: 1.07 }, far: { x: 0, y: 0, scale: 1.14 }, near: { x: 0, y: 0, scale: 1.3 } }, exit: { z: 600, scale: 1.25, opacity: 0 } },
    pullBack: { enter: { z: 420, scale: 1.18, opacity: 0 }, from: { z: 110 }, to: { z: -130 },
      par: { bg: { x: 0, y: 0, scale: 1.0 }, far: { x: 0, y: 0, scale: 1.0 }, near: { x: 0, y: 0, scale: 1.02 } }, exit: { z: -700, opacity: 0 } },
    tiltDown: { enter: { rotationX: 58, yPercent: -22, opacity: 0 }, from: { rotationX: 24, yPercent: -3 }, to: { rotationX: 3, yPercent: 2 },
      par: { bg: { x: 0, y: -18, scale: 1.04 }, far: { x: 0, y: -36, scale: 1.06 }, near: { x: 0, y: -70, scale: 1.12 } }, exit: { rotationX: -40, yPercent: 25, z: -200, opacity: 0 } },
    riseUp: { enter: { yPercent: 38, rotationX: -22, opacity: 0 }, from: { yPercent: 6, z: -40 }, to: { yPercent: -5, z: 50 }, shadow: { from: { scaleX: 1, opacity: 1 }, to: { scaleX: 0.82, opacity: 0.55 } },
      par: { bg: { x: 0, y: 10, scale: 1.03 }, far: { x: 0, y: -40, scale: 1.05 }, near: { x: 0, y: -110, scale: 1.1 } }, exit: { yPercent: -40, z: 200, opacity: 0 } },
    diagonal: { enter: { xPercent: -26, yPercent: 20, rotationZ: -7, rotationY: 22, opacity: 0 }, from: { xPercent: -3, yPercent: 2, rotationZ: -2, rotationY: 6 }, to: { xPercent: 3, yPercent: -2, rotationZ: 2, rotationY: -4 },
      par: { bg: { x: -12, y: 8, scale: 1.04 }, far: { x: -30, y: 20, scale: 1.06 }, near: { x: -70, y: 45, scale: 1.12 } }, exit: { xPercent: 28, yPercent: -20, rotationZ: 6, opacity: 0 } },
    spin: { enter: { rotationZ: -45, rotationX: 34, scale: 0.7, opacity: 0 }, from: { rotationZ: -8, rotationX: 15 }, to: { rotationZ: 8, rotationX: 5 },
      par: { bg: { x: 6, y: 0, scale: 1.03 }, far: { x: 20, y: -10, scale: 1.05 }, near: { x: 30, y: -30, scale: 1.08 } }, exit: { rotationZ: 40, scale: 0.75, z: -250, opacity: 0 } },
    explode: { enter: { scale: 0.6, z: -320, opacity: 0 }, from: { z: 0, yPercent: 0 }, to: { z: 95, yPercent: -6 }, shadow: { from: { scaleX: 1, opacity: 1 }, to: { scaleX: 0.8, opacity: 0.5 } },
      par: { bg: { x: 0, y: 0, scale: 1.04 }, far: { x: 0, y: -24, scale: 1.1 }, near: { x: 0, y: -40, scale: 1.2 } }, exit: { z: 560, scale: 1.3, opacity: 0 } }
  };
  var ext = function(){ var o = {}; for (var i = 0; i < arguments.length; i++) for (var k in arguments[i]) o[k] = arguments[i][k]; return o; };
  M.video = { enter: { z: -340, rotationY: -18, opacity: 0 }, from: { rotationY: -4, z: -20 }, to: { rotationY: 4, z: 30 },
    par: { bg: { x: 0, y: 0, scale: 1.03 }, far: { x: 0, y: -24, scale: 1.06 }, near: { x: 0, y: -60, scale: 1.12 } }, exit: { z: 520, scale: 1.22, opacity: 0 } };
  var RESET = { x: 0, y: 0, xPercent: 0, yPercent: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, opacity: 1 };

  function setCaption(i){
    var s = SLIDES[i];
    cap.classList.add("swap");
    gsap.delayedCall(0.35, function(){ capN.textContent = s.n; capP.textContent = s.p; cap.classList.remove("swap"); });
  }
  function show(i, first){
    var s = SLIDES[i], m = M[s.m], el = els[i], prev = els[cur], len = s.m === "sequence" ? PSEQ : P;
    var v = vidOf(i), useV = !!(v && v.readyState >= 3 && v.duration > 1);
    el.classList.toggle("vid-on", useV);
    if (useV) { m = M.video; len = Math.min(v.duration, 5.4) - 0.15; try { v.currentTime = 0; } catch (e) {} var pp = v.play(); if (pp && pp.catch) pp.catch(function(){}); }
    var pv = vidOf(cur);
    var mov = el.querySelector(".hmov"), sh = el.querySelector(".hshadow");
    if (!first && prev && prev !== el) {
      var pm = prev.classList.contains("vid-on") ? M.video : M[SLIDES[cur].m];
      gsap.to(prev, ext({ duration: 0.9, ease: "power2.in", overwrite: "auto", onComplete: function(){ prev.classList.remove("is-on"); gsap.set(prev, { visibility: "hidden" }); if (pv) pv.pause(); } }, pm.exit));
      setCaption(i);
    }
    el.classList.add("is-on");
    gsap.set(el, ext({ visibility: "visible", zIndex: 2 }, RESET));
    if (prev && prev !== el) gsap.set(prev, { zIndex: 1 });
    if (!first) gsap.from(el, ext({ duration: 1.05, ease: "power3.out", immediateRender: true }, m.enter));
    gsap.fromTo(mov, ext({}, m.from), ext({ duration: len + 1, ease: "sine.inOut", overwrite: true }, m.to));
    if (sh && m.shadow) gsap.fromTo(sh, m.shadow.from, ext({ duration: len, ease: "sine.inOut", overwrite: true }, m.shadow.to));
    var burst = el.querySelector(".hburst");
    if (burst) gsap.fromTo(burst, { opacity: 0, scale: 0.6 }, { keyframes: [{ opacity: 0.95, scale: 1.15, duration: len * 0.45, ease: "power2.out" }, { opacity: 0, scale: 1.7, duration: len * 0.55, ease: "power1.in" }], delay: 0.35, overwrite: true });
    gsap.to(bgL, ext({ duration: len + 1, ease: "sine.inOut", overwrite: true }, m.par.bg));
    gsap.to(farL, ext({ duration: len + 1, ease: "sine.inOut", overwrite: true }, m.par.far));
    gsap.to(nearL, ext({ duration: len + 1, ease: "sine.inOut", overwrite: true }, m.par.near));
    if (s.m === "sequence" && seqReady) {
      seqState.f = 0; drawF(0);
      gsap.timeline({ onUpdate: function(){ drawF(seqState.f); } })
        .to(seqState, { f: FR.length - 1, duration: 1.6, ease: "power1.inOut", onUpdate: function(){ drawF(seqState.f); } }, first ? 0.2 : 0.5)
        .to(seqState, { f: 0, duration: 1.4, ease: "power1.inOut", onUpdate: function(){ drawF(seqState.f); } }, "+=0.45");
    }
    cur = i;
    warmVid((i + 1) % SLIDES.length);
    timer = gsap.delayedCall(len, advance);
  }
  function advance(){
    var j = cur;
    for (var t = 1; t <= SLIDES.length; t++) { var c = (cur + t) % SLIDES.length; if (loaded[c]) { j = c; break; } }
    if (j === cur) { timer = gsap.delayedCall(0.4, advance); return; }  // nothing new decoded yet: hold this plate
    show(j, false);
  }

  if (STILL) {
    // a fixed frame for screenshots: ?hero=N shows dish N, no motion
    var n = Math.max(0, Math.min(SLIDES.length - 1, parseInt(hq || "0", 10) || 0));
    if (n > 0) { load(n, function(){ els[0].classList.remove("is-on"); els[n].classList.add("is-on"); gsap.set(els[n], { visibility: "visible" }); capN.textContent = SLIDES[n].n; capP.textContent = SLIDES[n].p; hero.setAttribute("data-ready", n); }); }
    else hero.setAttribute("data-ready", 0);
  } else if (!reduce) {
    var started = false;
    var start = function(){ if (started) return; started = true; running = true; show(0, true); };
    loadSeq();
    var waitSeq = function(){ if (seqReady) start(); else gsap.delayedCall(0.2, waitSeq); };
    gsap.delayedCall(0.3, waitSeq);
    gsap.delayedCall(3.0, start);             // slow connection: start the rotation anyway; the clip plays on a later lap
    if (document.readyState === "complete") preloadAll(); else window.addEventListener("load", preloadAll);
    document.addEventListener("visibilitychange", function(){
      var cv0 = vidOf(cur); if (document.hidden) { gsap.globalTimeline.pause(); if (cv0) cv0.pause(); } else { gsap.globalTimeline.resume(); if (cv0 && els[cur].classList.contains("vid-on")) { var pr = cv0.play(); if (pr && pr.catch) pr.catch(function(){}); } }
    });
  }
  // prefers-reduced-motion: the first plate stays, still, with its caption

  // menu: 3D dish cards
  var cards = all(".dcard");
  if (!reduce && !CAPTURE) {
    gsap.set(cards, { autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: "top 92%",
      onEnter: function(batch){ gsap.fromTo(batch, { autoAlpha: 0, y: 90, rotateX: 38, rotateY: -8, rotation: touch ? -7 : 0, scale: touch ? 0.88 : 1, transformPerspective: 900 },
        { autoAlpha: 1, y: 0, rotateX: 0, rotateY: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out", stagger: 0.09, overwrite: true }); },
      onLeaveBack: function(batch){ gsap.to(batch, { autoAlpha: 0, y: 90, rotateX: 38, duration: 0.4, overwrite: true }); }
    });
  }
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  cards.forEach(function(c){
    var d3 = c.querySelector(".d3");
    if (fine) {
      c.addEventListener("pointermove", function(e){
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        d3.style.setProperty("--ry", (x * 26).toFixed(2) + "deg");
        d3.style.setProperty("--rx", (-y * 22).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", function(){ d3.style.setProperty("--rx", "0deg"); d3.style.setProperty("--ry", "0deg"); });
    } else {
      c.addEventListener("click", function(e){ if (e.target.closest("a")) return; c.classList.toggle("tap"); });
    }
  });
  if (!fine && !reduce) {
    // touch devices: tilt follows the card's position on screen while scrolling
    // touch devices: each dish tilts in 3D with its position on screen while you scroll
    // (pitch toward you, a turn away from the card's column, a small roll and a float-up),
    // plus a gentle device tilt where the phone allows it without a permission prompt (Android)
    var ticking = false, gam = 0;
    var tilt = function(){
      ticking = false;
      var vh = window.innerHeight, vw = window.innerWidth;
      cards.forEach(function(c){
        var r = c.getBoundingClientRect(); if (r.bottom < -40 || r.top > vh + 40) return;
        var t = Math.max(-0.7, Math.min(0.7, (r.top + r.height / 2) / vh - 0.5));
        var side = ((r.left + r.width / 2) / vw - 0.5) * 2; // -1 left column … +1 right column
        var d3 = c.querySelector(".d3");
        d3.style.setProperty("--rx", (t * 30).toFixed(2) + "deg");
        d3.style.setProperty("--ry", (-side * 14 * (0.4 + Math.abs(t)) + gam).toFixed(2) + "deg");
        d3.style.setProperty("--rz", (t * side * -9).toFixed(2) + "deg");
        d3.style.setProperty("--py", (t * 26).toFixed(1) + "px");
      });
    };
    var kick = function(){ if (!ticking) { ticking = true; requestAnimationFrame(tilt); } };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", function(e){
        if (e.gamma == null) return;
        gam = Math.max(-12, Math.min(12, e.gamma * 0.45)); kick();
      }, { passive: true });
    }
    tilt();
  }
  if (!reduce && !CAPTURE) {
    gsap.from(".fact", { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power2.out",
      scrollTrigger: { trigger: ".facts", start: "top 80%" } });
    gsap.fromTo(".cta-inner", { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: "none",
      scrollTrigger: { trigger: ".cta", start: "top 85%", end: "top 35%", scrub: CAPTURE ? true : 0.6 } });
    gsap.fromTo(".cta", { backgroundPosition: "50% 30%" }, { backgroundPosition: "50% 70%", ease: "none",
      scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
  }

  window.__site = { lenis: lenis, hero: { slides: SLIDES, current: function(){ return cur; } }, ready: true };
  window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
})();

/* v6: scroll reveal + floating WhatsApp button (independent of the hero code) */
(function(){
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var capture = /[?&]capture/.test(location.search);
  var els = [].slice.call(document.querySelectorAll(".rv"));
  if ("IntersectionObserver" in window && !reduce && !capture) {
    document.documentElement.classList.add("js-rv");
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(function(el){ io.observe(el); });
  }
  var fab = document.querySelector(".wafab"), hero = document.getElementById("hero"), cta = document.getElementById("order"), foot = document.querySelector(".foot");
  if (fab && hero && "IntersectionObserver" in window) {
    var heroVis = true, endVis = false;
    var upd = function(){ var on = !heroVis && !endVis; fab.classList.toggle("show", on); fab.tabIndex = on ? 0 : -1; };
    new IntersectionObserver(function(es){ heroVis = es[0].isIntersecting; upd(); }, { threshold: 0.02 }).observe(hero);
    var seen = new Map();
    var eo = new IntersectionObserver(function(es){ es.forEach(function(e){ seen.set(e.target, e.isIntersecting); }); endVis = false; seen.forEach(function(v){ if (v) endVis = true; }); upd(); }, { threshold: 0.15 });
    if (cta) eo.observe(cta); if (foot) eo.observe(foot);
  }
})();
