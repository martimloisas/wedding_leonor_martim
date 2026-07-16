document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("menuToggle");
  const navOverlay = document.getElementById("navOverlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section[id]");

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
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));

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
  const weddingDate = new Date(2027, 6, 10, 16, 0, 0);

  if (countdown) {
    const cdDays = document.getElementById("cdDays");
    const cdHours = document.getElementById("cdHours");
    const cdMinutes = document.getElementById("cdMinutes");

    let countdownTimer;

    const updateCountdown = () => {
      const diff = weddingDate - new Date();

      if (diff <= 0) {
        countdown.innerHTML = '<span class="countdown-today">É hoje! ✦</span>';
        clearInterval(countdownTimer);
        return;
      }

      const totalMinutes = Math.floor(diff / 60000);
      cdDays.textContent = Math.floor(totalMinutes / 1440);
      cdHours.textContent = String(Math.floor((totalMinutes % 1440) / 60)).padStart(2, "0");
      cdMinutes.textContent = String(totalMinutes % 60).padStart(2, "0");
    };

    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 30000);
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
