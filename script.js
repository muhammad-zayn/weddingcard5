(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const preloader = $("#preloader");
  const stage = $("#curtainStage");
  const invitation = $("#invitation");
  const openBtn = $("#openInvitation");
  const curtainAudio = $("#curtainAudio");

  function playCurtainSound() {
    if (!curtainAudio) return;

    curtainAudio.currentTime = 0;
    curtainAudio.volume = 0.22;
    curtainAudio.play().catch(() => {});
  }

  function animateCurtain() {
    stage.classList.add("active");
    invitation.classList.add("locked");
    playCurtainSound();

    const duration = 3150;

    setTimeout(() => {
      stage.classList.add("opened");
      invitation.classList.remove("locked");
      document.body.classList.add("opened");
      startReveals();
    }, duration);

    setTimeout(() => {
      stage.classList.remove("active");
      stage.setAttribute("aria-hidden", "true");
    }, duration + 800);
  }

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      openBtn.disabled = true;
      preloader.classList.add("hide");
      setTimeout(animateCurtain, 180);
    });
  }

  // Scroll-based reveal engine
  function startReveals() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -50px"
      }
    );

    $$(".reveal").forEach((el) => io.observe(el));
  }

  // Click-to-reveal date interaction
  const dateRevealTrigger = $("#dateRevealTrigger");
  const dateReveal = $("#dateReveal");
  const countdownElement = $("#countdown");

  if (dateRevealTrigger && dateReveal) {
    dateRevealTrigger.addEventListener("click", () => {
      if (dateReveal.classList.contains("visible")) return;

      // Reveal the wedding date
      dateReveal.classList.add("visible");
      dateReveal.setAttribute("aria-hidden", "false");

      dateRevealTrigger.setAttribute("aria-expanded", "true");
      dateRevealTrigger.classList.add("revealed");

      const triggerText = dateRevealTrigger.querySelector(
        ".date-trigger-text"
      );

      const triggerArrow = dateRevealTrigger.querySelector(
        ".date-trigger-arrow"
      );

      if (triggerText) {
        triggerText.textContent = "DATE REVEALED";
      }

      if (triggerArrow) {
        triggerArrow.textContent = "✓";
      }

      dateRevealTrigger.disabled = true;

      // Reveal countdown with animation
      if (countdownElement) {
        countdownElement.classList.add("countdown-revealed");
      }

      // Trigger celebration poppers
      createConfetti();
    });
  }

  // Live countdown to 10 October 2026
  function countdown() {
    const targetDate = new Date(
      "2026-10-10T00:00:00"
    ).getTime();

    const currentDate = Date.now();

    let diff = Math.max(0, targetDate - currentDate);

    const days = Math.floor(diff / 86400000);
    diff %= 86400000;

    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;

    const minutes = Math.floor(diff / 60000);
    diff %= 60000;

    const seconds = Math.floor(diff / 1000);

    const values = {
      days,
      hours,
      minutes,
      seconds
    };

    Object.entries(values).forEach(([key, value]) => {
      const element = document.querySelector(
        `[data-unit="${key}"]`
      );

      if (element) {
        element.textContent = String(value).padStart(2, "0");
      }
    });
  }

  countdown();
  setInterval(countdown, 1000);

  // Celebration confetti/popper animation
  function createConfetti() {
    const colors = [
      "#f6cbd8",
      "#c47b98",
      "#e9b0c3",
      "#c79a62",
      "#fff9f7"
    ];

    const confettiCount = 80;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("span");

      confetti.className = "confetti-piece";

      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      confetti.style.animationDelay =
        `${Math.random() * 0.35}s`;

      confetti.style.setProperty(
        "--confetti-x",
        `${(Math.random() - 0.5) * 280}px`
      );

      confetti.style.setProperty(
        "--confetti-rotate",
        `${Math.random() * 720 - 360}deg`
      );

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }

  // RSVP
  const rsvpMessage = $("#rsvpMessage");

  $$(".rsvp-btn").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".rsvp-btn").forEach((item) => {
        item.classList.remove("selected");
      });

      button.classList.add("selected");

      if (rsvpMessage) {
        rsvpMessage.textContent =
          button.dataset.rsvp === "yes"
            ? "Yay! Can't wait to celebrate with you 🎉"
            : "We'll miss you, but thank you for sending your love ❤️";
      }
    });
  });

  // Lightweight ambient tone using Web Audio API
  let audioCtx = null;
  let gain = null;
  let oscillator = null;

  const music = $("#musicToggle");

  function startAmbient() {
    if (audioCtx) {
      audioCtx.resume();

      if (music) {
        music.classList.add("playing");
      }

      return;
    }

    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    gain = audioCtx.createGain();
    gain.gain.value = 0.018;
    gain.connect(audioCtx.destination);

    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 196;
    oscillator.connect(gain);
    oscillator.start();

    if (music) {
      music.classList.add("playing");
    }
  }

  function stopAmbient() {
    if (audioCtx) {
      audioCtx.suspend();

      if (music) {
        music.classList.remove("playing");
      }
    }
  }

  if (music) {
    music.addEventListener("click", () => {
      music.classList.contains("playing")
        ? stopAmbient()
        : startAmbient();
    });
  }

  // Subtle parallax for hero ornaments
  addEventListener(
    "scroll",
    () => {
      if (!document.body.classList.contains("opened")) return;

      const y = scrollY;
      const hero = $(".hero");

      if (hero && y < innerHeight) {
        hero.style.backgroundPosition =
          `center ${y * 0.08}px`;
      }
    },
    { passive: true }
  );
})();