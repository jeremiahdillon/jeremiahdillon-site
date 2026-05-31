/* ============================================================
   article.js — shared behavior for jeremiahdillon.com/writing/
   Currently: a lightweight, dependency-free image lightbox.
   Click any article image (lead or inline figure) to view it
   enlarged over a dimmed backdrop; click the backdrop, the
   close button, or press Esc to dismiss.
   ============================================================ */
(function () {
  function init() {
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
