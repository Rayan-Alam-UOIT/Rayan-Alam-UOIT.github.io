/* ==============================
   PORTFOLIO SCRIPT — Rayan Alam
   Enhanced with:
   Loader, Three.js, Magnetic buttons,
   Tilt effects, Typed terminal,
   Scroll progress, Project modals
   ============================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---- LOADER ---- */
  const loader = document.getElementById("loader");

  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden-loader");
    }, 650);
  }

  /* ---- SCROLL PROGRESS ---- */
  const progressBar = document.getElementById("scroll-progress");

  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const pct =
        scrollableHeight > 0
          ? (window.scrollY / scrollableHeight) * 100
          : 0;

      progressBar.style.width = pct + "%";
    }, { passive: true });
  }

  /* ---- NAVBAR SCROLL + ACTIVE LINKS ---- */
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");

  const updateNav = () => {
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    }

    const sections = document.querySelectorAll("section[id], header[id]");
    let current = "";

    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const nearBottom = scrollBottom >= docHeight - 40;

    if (nearBottom) {
      const lastSection = sections[sections.length - 1];
      current = lastSection ? lastSection.id : "";
    } else {
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 140) {
          current =
            section.dataset.navSection ||
            section.id;
        }
      });
    }

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === `#${current}`);
    });
  };

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  /* ---- HAMBURGER ---- */
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navLinks");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  /* ---- THEME TOGGLE ---- */
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const html = document.documentElement;

  if (themeToggle && themeIcon) {
    themeToggle.addEventListener("click", () => {
      const isDark = html.getAttribute("data-theme") === "dark";

      html.setAttribute("data-theme", isDark ? "light" : "dark");

      themeIcon.className =
        isDark
          ? "fa-solid fa-moon"
          : "fa-solid fa-sun";
    });
  }

  /* ---- CUSTOM CURSOR ---- */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  if (cursorDot && cursorRing) {
    document.addEventListener("mousemove", event => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
    });

    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";

      requestAnimationFrame(animateCursor);
    };

    animateCursor();

    document.addEventListener("mouseleave", () => {
      cursorDot.style.opacity = "0";
      cursorRing.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
      cursorDot.style.opacity = "1";
      cursorRing.style.opacity = "1";
    });
  }

  /* ---- THREE.JS PARTICLE FIELD ---- */
  const canvas = document.getElementById("bg-canvas");

  if (canvas && window.THREE) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.z = 80;

    const particleCount =
      window.innerWidth < 720 ? 700 : 1600;

    const geometry = new THREE.BufferGeometry();

    const positions =
      new Float32Array(particleCount * 3);

    const colors =
      new Float32Array(particleCount * 3);

    const palette = [
      [0.29, 0.94, 0.77],
      [0.49, 0.42, 0.96],
      [0.94, 0.57, 0.29]
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] =
        (Math.random() - 0.5) * 280;

      positions[i * 3 + 1] =
        (Math.random() - 0.5) * 200;

      const z = (Math.random() - 0.5) * 180;
      positions[i * 3 + 2] = z > 60 ? z - 80 : z;

      

      const color =
        palette[Math.floor(Math.random() * palette.length)];

      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const material = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseInfluenceX = 0;
    let mouseInfluenceY = 0;

    let targetCameraX = 0;
let targetCameraY = 0;

    document.addEventListener("mousemove", event => {
      mouseInfluenceX =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouseInfluenceY =
        -(event.clientY / window.innerHeight - 0.5) * 2;

         targetCameraX = mouseInfluenceX * 5;
  targetCameraY = mouseInfluenceY * 3.5;
    });

    window.addEventListener("resize", () => {
      camera.aspect =
        window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    });

    let frame = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      frame += 0.008;

      particles.rotation.y =
        frame * 0.08 + mouseInfluenceX * 0.04;

      particles.rotation.x =
        frame * 0.05 + mouseInfluenceY * 0.03;

      camera.position.x +=
      (targetCameraX - camera.position.x) * 0.05;

      camera.position.y +=
      (targetCameraY - camera.position.y) * 0.05;

camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();
  }

  /* ---- TYPED TERMINAL ---- */
  const typedTarget = document.querySelector(".typed-target");

  if (typedTarget) {
    const commands = [
      "current_stack",
      "skills --list",
      "git log --oneline",
      "python main.py",
      "deploy --cloud aws"
    ];

    let commandIndex = 0;
    let textIndex = 0;
    let deleting = false;

    const typeLoop = () => {
      const current = commands[commandIndex];

      if (!deleting) {
        typedTarget.textContent =
          current.slice(0, textIndex + 1);

        textIndex++;

        if (textIndex === current.length) {
          deleting = true;

          setTimeout(typeLoop, 1800);
          return;
        }
      } else {
        typedTarget.textContent =
          current.slice(0, textIndex - 1);

        textIndex--;

        if (textIndex === 0) {
          deleting = false;

          commandIndex =
            (commandIndex + 1) % commands.length;
        }
      }

      setTimeout(typeLoop, deleting ? 55 : 100);
    };

    setTimeout(typeLoop, 1200);
  }

  /* ---- REVEAL ON SCROLL ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay =
          parseInt(entry.target.dataset.revealDelay || "0", 10);

        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  revealEls.forEach(element => {
    revealObserver.observe(element);
  });

  /* ---- TILT EFFECT ---- */
  const tiltCards = document.querySelectorAll("[data-tilt]");

  tiltCards.forEach(card => {
    card.addEventListener("mousemove", event => {
      const rect = card.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateZ(8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    });
  });

  /* ---- MAGNETIC BUTTONS ---- */
  const magnetBtns = document.querySelectorAll("[data-magnetic]");

  magnetBtns.forEach(button => {
    button.addEventListener("mousemove", event => {
      const rect = button.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = (event.clientX - centerX) * 0.22;
      const dy = (event.clientY - centerY) * 0.22;

      button.style.transform =
        `translate(${dx}px, ${dy}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0, 0)";
      button.style.transition =
        "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    });

    button.addEventListener("mouseenter", () => {
      button.style.transition = "transform 0.1s ease";
    });
  });

  /* ---- PROJECT MODALS ---- */
  const openModalButtons =
    document.querySelectorAll(".open-modal");

  const closeModalButtons =
    document.querySelectorAll(".close-modal");

  const openModal = modalId => {
    const modal = document.getElementById(modalId);

    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModals = () => {
    document.querySelectorAll(".modal.active").forEach(modal => {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    });

    document.body.classList.remove("modal-open");
  };

  openModalButtons.forEach(button => {
    button.addEventListener("click", () => {
      openModal(button.dataset.modal);
    });
  });

  closeModalButtons.forEach(button => {
    button.addEventListener("click", closeModals);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeModals();
    }
  });

  /* ---- CONTACT FORM ---- */
  const form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", event => {
      let valid = true;

      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const message = document.getElementById("message");

      [name, email, message].forEach(input => {
        clearError(input);
      });

      if (name.value.trim().length < 3) {
        showError(name, "At least 3 characters required.");
        valid = false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError(email, "Please enter a valid email.");
        valid = false;
      }

      if (message.value.trim().length < 10) {
        showError(message, "At least 10 characters required.");
        valid = false;
      }

      if (!valid) {
        event.preventDefault();
        return;
      }

      const submitButton =
        document.getElementById("submitBtn");

      if (submitButton) {
        submitButton.querySelector(".submit-text").textContent =
          "Sending...";

        submitButton.querySelector(".spinner").classList.remove("hidden");
        submitButton.disabled = true;
      }
    });
  }

  function showError(input, message) {
    const group = input.closest(".form-group");

    group.classList.add("invalid");
    group.querySelector("small").textContent = message;
  }

  function clearError(input) {
    const group = input.closest(".form-group");

    group.classList.remove("invalid");
    group.querySelector("small").textContent = "";
  }

  /* ---- SMOOTH ANCHOR SCROLLING ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      const href = anchor.getAttribute("href");

      if (href === "#") {
        event.preventDefault();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

        return;
      }

      const target = document.querySelector(href);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  /* ---- FLOATING PROFILE ORBIT ---- */
gsap.to(".profile-orbit", {
  y: -12,
  duration: 2.5,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"
});

});