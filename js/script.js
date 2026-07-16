if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

// iOS Safari's svh/dvh units are unreliable across versions (the toolbar
// show/hide transition can leave the hero taller than the visible screen).
// Measuring window.innerHeight directly sidesteps that entirely.
const setViewportHeight = () => {
  if (window.innerHeight > 0) {
    document.documentElement.style.setProperty("--vh100", window.innerHeight + "px");
  }
};
setViewportHeight();
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);

  const hamburger = document.getElementById("menuToggle");
  const navOverlay = document.getElementById("navOverlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section[id]");
  const fabRsvp = document.getElementById("fabRsvp");
  const scrollCue = document.getElementById("scrollCue");

  const closeMenu = () => {
    hamburger.classList.remove("active");
    navOverlay.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = navOverlay.classList.toggle("open");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  };

  hamburger.addEventListener("click", toggleMenu);
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Highlight active section link
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
          if (fabRsvp) {
            fabRsvp.classList.toggle("hidden", id === "inicio" || id === "confirmar");
          }
          if (scrollCue) {
            scrollCue.classList.toggle("hidden", id !== "inicio");
          }
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  const prefersReducedMotionReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealEls.length && !prefersReducedMotionReveal && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  // FAQ accordion
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      item.parentElement.querySelectorAll(".faq-item.open").forEach((openItem) => {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Countdown to the ceremony
  const countdown = document.getElementById("countdown");
  const weddingDate = new Date("2027-07-10T16:00:00");

  if (countdown) {
    const cdDays = document.getElementById("cdDays");
    const cdHours = document.getElementById("cdHours");
    const cdMinutes = document.getElementById("cdMinutes");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setCountdownValue = (el, value) => {
      if (el.textContent === value) return;
      el.textContent = value;
      if (prefersReducedMotion) return;
      el.classList.remove("countdown-num--flip");
      void el.offsetWidth;
      el.classList.add("countdown-num--flip");
    };

    let countdownTimer;

    const updateCountdown = () => {
      const now = new Date();
      const diff = weddingDate - now;

      const isWeddingDay =
        now.getFullYear() === weddingDate.getFullYear() &&
        now.getMonth() === weddingDate.getMonth() &&
        now.getDate() === weddingDate.getDate();

      if (isWeddingDay) {
        countdown.innerHTML = '<span class="countdown-today">É hoje! ✦</span>';
        clearInterval(countdownTimer);
        return;
      }

      if (diff <= 0) {
        setCountdownValue(cdDays, "0");
        setCountdownValue(cdHours, "00");
        setCountdownValue(cdMinutes, "00");
        clearInterval(countdownTimer);
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      setCountdownValue(cdDays, String(Math.floor(totalMinutes / 1440)));
      setCountdownValue(cdHours, String(Math.floor((totalMinutes % 1440) / 60)).padStart(2, "0"));
      setCountdownValue(cdMinutes, String(totalMinutes % 60).padStart(2, "0"));
    };

    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 30000);
  }

  // Add to calendar (.ics download)
  const addToCalendarBtn = document.getElementById("addToCalendar");

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener("click", () => {
      const escapeIcsText = (text) => text.replace(/([,;])/g, "\\$1");

      const dtStamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";

      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Leonor e Martim//Casamento//PT",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:leonor-martim-casamento-2027@wedding",
        `DTSTAMP:${dtStamp}`,
        "DTSTART:20270710T150000Z",
        "DTEND:20270711T040000Z",
        "SUMMARY:Casamento de Leonor & Martim",
        `DESCRIPTION:${escapeIcsText(
          "Cerimónia às 16h na Igreja de Nossa Senhora da Conceição, seguida de festa na Quinta dos Rosais."
        )}`,
        `LOCATION:${escapeIcsText("Igreja de Nossa Senhora da Conceição / Quinta dos Rosais")}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ];

      const icsBlob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      const icsUrl = URL.createObjectURL(icsBlob);

      const tempLink = document.createElement("a");
      tempLink.href = icsUrl;
      tempLink.download = "casamento-leonor-martim.ics";
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(icsUrl);
    });
  }

  // Copy IBAN
  const copyBtn = document.getElementById("copyIban");
  const ibanValue = document.getElementById("ibanValue");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(ibanValue.textContent.replace(/\s/g, ""));
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copiado!";
        setTimeout(() => (copyBtn.textContent = original), 1800);
      } catch (err) {
        console.error("Não foi possível copiar o IBAN", err);
      }
    });
  }
});
