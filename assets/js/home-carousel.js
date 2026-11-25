const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  if (slides.length < 2) return;

  const controls = carousel.querySelector("[data-controls]");
  const track = carousel.querySelector("[data-track]");
  const rotation = carousel.querySelector("[data-rotation]");
  const status = carousel.querySelector("[data-slide-status]");
  const musicToggle = carousel.querySelector("[data-music-toggle]");
  const musicCover = carousel.querySelector("[data-music-cover]");
  const musicPlayer = carousel.querySelector("[data-music-player]");
  const interval = Number(carousel.dataset.interval) || 6000;
  const pauseOnHover = carousel.hasAttribute("data-pause-on-hover");
  let current = 0;
  let timer;
  let rotating = !reducedMotion.matches;
  let hovered = pauseOnHover && carousel.matches(":hover");
  let playingMusic = false;

  function schedule() {
    clearTimeout(timer);
    if (rotating && !playingMusic && !hovered && !document.hidden && !track.contains(document.activeElement)) {
      timer = setTimeout(() => show(current + 1), interval);
    }
  }

  function show(index, announce = false) {
    if (playingMusic) closeMusic();
    slides[current].hidden = true;
    current = (index + slides.length) % slides.length;
    slides[current].hidden = false;
    if (announce) {
      const title = slides[current].querySelector("[data-slide-title]").textContent;
      status.textContent = `Slide ${current + 1} of ${slides.length}: ${title}`;
    }
    schedule();
  }

  function updateRotation() {
    rotation.setAttribute("aria-label", rotating ? "Pause slideshow" : "Play slideshow");
    rotation.querySelector("[data-pause]").hidden = !rotating;
    rotation.querySelector("[data-play]").hidden = rotating;
    schedule();
  }

  function closeMusic() {
    musicPlayer.replaceChildren();
    musicPlayer.hidden = true;
    musicCover.hidden = false;
    musicToggle.textContent = "▶";
    musicToggle.setAttribute("aria-label", "Play sample track");
    playingMusic = false;
  }

  if (musicToggle) {
    musicToggle.hidden = false;
    musicToggle.addEventListener("click", () => {
      if (playingMusic) {
        closeMusic();
      } else {
        const frame = document.createElement("iframe");
        frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(musicToggle.dataset.musicToggle)}?autoplay=1&rel=0`;
        const title = musicToggle.closest("[data-music]").querySelector("[data-slide-title]").textContent;
        frame.title = `${title} – YouTube player`;
        frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        musicPlayer.append(frame);
        musicPlayer.hidden = false;
        musicCover.hidden = true;
        musicToggle.textContent = "×";
        musicToggle.setAttribute("aria-label", "Close music player");
        playingMusic = true;
        rotating = false;
        updateRotation();
      }
      schedule();
    });
  }

  slides.slice(1).forEach((slide) => { slide.hidden = true; });
  controls.hidden = false;

  controls.querySelector("[data-previous]").addEventListener("click", () => show(current - 1, true));
  controls.querySelector("[data-next]").addEventListener("click", () => show(current + 1, true));
  rotation.addEventListener("click", () => {
    rotating = !rotating;
    if (rotating && playingMusic) closeMusic();
    updateRotation();
  });

  if (pauseOnHover) {
    carousel.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      hovered = true;
      schedule();
    });
    carousel.addEventListener("pointerleave", () => {
      hovered = false;
      schedule();
    });
  }
  carousel.addEventListener("focusin", schedule);
  carousel.addEventListener("focusout", () => queueMicrotask(schedule));
  document.addEventListener("visibilitychange", schedule);
  reducedMotion.addEventListener("change", (event) => {
    rotating = !event.matches;
    updateRotation();
  });

  updateRotation();
});
