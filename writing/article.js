/* ============================================================
   article.js — shared behavior for jeremiahdillon.com/writing/
   A lightweight, dependency-free image lightbox, plus play-once
   videos (see initVideos below).
   Click any article image (lead or inline figure) to view it
   enlarged over a dimmed backdrop; click the backdrop, the
   close button, or press Esc to dismiss.
   ============================================================ */
(function () {
  /* ----------------------------------------------------------
     Play-once videos: <video data-play-once muted playsinline
     poster="final-frame.webp">. Starts when scrolled into view,
     plays through once, and holds its final frame. The "Replay"
     link in the caption is always visible; clicking it or the
     video restarts playback from the beginning at any time.
     The poster (the final frame) is what shows when scripts,
     autoplay, or motion are off.
     ---------------------------------------------------------- */
  function initVideos() {
    var videos = document.querySelectorAll('video[data-play-once]');
    if (!videos.length) return;
    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var REPLAY = '↻ Replay';
    var PLAY = '▶ Play';

    Array.prototype.forEach.call(videos, function (v) {
      var poster = v.getAttribute('poster');
      var figure = v.closest('figure');
      var caption = figure && figure.querySelector('figcaption');
      var started = false;

      v.muted = true;
      v.loop = false;

      // Always-visible control in the caption, so nothing shifts when
      // the video ends. Clicking it (or the video) at any point
      // restarts playback from the beginning.
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-replay';
      btn.textContent = REPLAY;
      if (caption) caption.appendChild(btn);

      function play() {
        started = true;
        btn.textContent = REPLAY;
        try { v.currentTime = 0; } catch (e) {}
        var p = v.play();
        if (p && p.catch) {
          p.catch(function () {
            // Autoplay refused: fall back to the final-frame poster.
            if (poster) v.setAttribute('poster', poster);
            btn.textContent = PLAY;
          });
        }
      }

      v.addEventListener('click', play);
      btn.addEventListener('click', play);

      if (reduceMotion || !('IntersectionObserver' in window)) {
        btn.textContent = PLAY;
        return;
      }

      // Autoplay path: show the opening frame, not the final one, until it runs.
      v.removeAttribute('poster');
      v.preload = 'auto';

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            io.disconnect();
            play();
          }
        });
      }, { threshold: 0.6 });
      io.observe(v);
    });
  }

  function init() {
    initVideos();

    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('hidden', '');
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Close image">&times;</button>' +
      '<img alt="">';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('img');

    function open(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      overlay.removeAttribute('hidden');
      // next frame so the opacity transition runs
      requestAnimationFrame(function () { overlay.classList.add('open'); });
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () {
        overlay.setAttribute('hidden', '');
        lbImg.removeAttribute('src');
      }, 200);
    }

    // Clicking the image keeps it open; clicking anywhere else closes.
    overlay.addEventListener('click', function (e) {
      if (e.target === lbImg) return;
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) close();
    });

    // Delegate clicks from any article image.
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.article-body figure img, .article-lead img');
      if (img) open(img.currentSrc || img.src, img.alt);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
