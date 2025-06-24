// Enhanced Portfolio Interactivity
document.addEventListener('DOMContentLoaded', () => {
  // =============================================
  // ========== NAVBAR SCROLL EFFECT ============
  // =============================================
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    // Add/remove scrolled class based on scroll position
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // =============================================
  // ========== MOBILE MENU TOGGLE ==============
  // =============================================
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  // Toggle mobile menu on hamburger click
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // =============================================
  // ========== SMOOTH SCROLLING ================
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Smooth scroll to target with navbar height offset
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });

  // =============================================
  // ======== SCROLL REVEAL ANIMATIONS ==========
  // =============================================
  const sections = document.querySelectorAll('.section, .hero, .footer');
  
  // Configure Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { 
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: '0px 0px -100px 0px' // Adjust trigger point
  });

  // Apply observer to all sections
  sections.forEach(section => {
    section.classList.add('hidden');
    observer.observe(section);
  });

  // =============================================
  // ========== CONTACT FORM VALIDATION =========
  // =============================================
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Form submission handler
  form.addEventListener('submit', function(e) {
    let isValid = true;
    
    // Validate name field
    const nameInput = document.getElementById('name');
    if (nameInput.value.length < 3) {
      nameInput.parentElement.classList.add('invalid');
      nameInput.nextElementSibling.textContent = 'Please enter at least 3 characters';
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove('invalid');
    }
    
    // Validate email field
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      emailInput.parentElement.classList.add('invalid');
      emailInput.nextElementSibling.textContent = 'Please enter a valid email address';
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove('invalid');
    }
    
    // Validate message field
    const messageInput = document.getElementById('message');
    if (messageInput.value.length < 10) {
      messageInput.parentElement.classList.add('invalid');
      messageInput.nextElementSibling.textContent = 'Please enter at least 10 characters';
      isValid = false;
    } else {
      messageInput.parentElement.classList.remove('invalid');
    }
    
    // Prevent submission if invalid
    if (!isValid) {
      e.preventDefault();
      return;
    }
    
    // Show loading state during submission
    const submitBtn = document.getElementById('submitBtn');
    const submitText = submitBtn.querySelector('.submit-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    submitText.textContent = 'Sending...';
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
  });

  // Real-time input validation
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      if (input.checkValidity()) {
        input.parentElement.classList.remove('invalid');
      }
    });
  });

  // =============================================
  // ======== PROJECT CARD INTERACTIONS =========
  // =============================================
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    // Enhanced hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px)';
      card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
    });
  });

  // =============================================
  // ============ SLIDESHOW FUNCTION ============
  // =============================================
  const slides = document.querySelectorAll('.slide');
  let currentSlide = 0;
  
  function showSlide(index) {
    // Hide all slides and show current one
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }
  
  function nextSlide() {
    // Move to next slide (loop back to 0 at end)
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  // Initialize slideshow if slides exist
  if (slides.length > 0) {
    showSlide(0);
    setInterval(nextSlide, 3500); // Auto-advance every 3.5 seconds
  }

  // =============================================
  // ========== TYPEWRITER EFFECT ===============
  // =============================================
  const typewriterText = document.getElementById('typewriter-text');
  const professions = [
    'Computer Science Student',
    'Software Developer',
    'UI Designer',
    'UX Designer',
    'Aspiring Full-Stack Developer',
    'Aspiring Data Scientist'
  ];
  
  let professionIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 125; // Base typing speed in ms

  function typeWriter() {
    const currentProfession = professions[professionIndex];
    
    if (isDeleting) {
      // Backspace effect
      typewriterText.textContent = currentProfession.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Faster when deleting
    } else {
      // Typing effect
      typewriterText.textContent = currentProfession.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing speed
    }

    // Determine next action
    if (!isDeleting && charIndex === currentProfession.length) {
      // Pause at end of word before deleting
      isDeleting = true;
      typingSpeed = 2000; // Longer pause
    } else if (isDeleting && charIndex === 0) {
      // Move to next word after deleting
      isDeleting = false;
      professionIndex = (professionIndex + 1) % professions.length;
      typingSpeed = 800; // Pause before typing next word
    }

    // Continue the effect
    setTimeout(typeWriter, typingSpeed);
  }

  // Start the typewriter effect after initial delay
  setTimeout(typeWriter, 500);
});

document.addEventListener('DOMContentLoaded', function() {
  const showMoreBtn = document.getElementById('showMoreBtn');
  const projectsGrid = document.querySelector('.projects-grid');
  const projectsSection = document.getElementById('projects');
  
  if (showMoreBtn && projectsGrid) {
    showMoreBtn.addEventListener('click', function() {
      if (!projectsGrid.classList.contains('show-all')) {
        // When showing more
        projectsGrid.classList.add('show-all');
        showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
        showMoreBtn.classList.add('rotate');
      } else {
        // When showing less - scroll to section first
        projectsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Wait for scroll to complete before hiding
        setTimeout(() => {
          projectsGrid.classList.remove('show-all');
          showMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show More Projects';
          showMoreBtn.classList.remove('rotate');
        }, 500); // Match this duration to your scroll duration
      }
    });
  }
});