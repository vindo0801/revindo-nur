// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add shadow when scrolled
  if (currentScroll > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ============================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ============================================
// INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .timeline-item, .edu-card, .skill-category, .achievement-card, .project-card').forEach(el => {
  observer.observe(el);
});

// ============================================
// ACTIVE NAVIGATION LINK HIGHLIGHT
// ============================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function highlightNavigation() {
  const scrollPosition = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNavigation);
window.addEventListener('load', highlightNavigation);

// ============================================
// GUESTBOOK FORM HANDLING — Google Sheets
// ============================================

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwTi4nxWgMVWSGdYym_Bs5v41RkHo1H0O0MbwCg3qIfVfkPsor03en8Hh7q4vurI3Dr/exec';

const guestbookForm = document.getElementById('guestbookForm');
const guestbookEntries = document.querySelector('.guestbook-entries');

// Show or hide empty state
function updateEmptyState() {
  const emptyState = document.getElementById('emptyState');
  const entries = document.querySelectorAll('.guestbook-entry');
  if (emptyState) {
    emptyState.style.display = entries.length === 0 ? 'block' : 'none';
  }
}

// Load entries from Google Sheets
async function loadGuestbookEntries() {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.innerHTML = '<p>⏳ Loading messages...</p>';

  try {
    const res = await fetch(SHEET_URL);
    const entries = await res.json();

    // Clear loading state
    if (emptyState) emptyState.style.display = 'none';

    if (entries.length === 0) {
      if (emptyState) {
        emptyState.innerHTML = '<p>✏️ Be the first to leave a message!</p>';
        emptyState.style.display = 'block';
      }
    } else {
      entries.forEach(entry => {
        addEntryToDOM(entry.name, entry.message, formatDate(entry.date));
      });
    }
  } catch (err) {
    if (emptyState) {
      emptyState.innerHTML = '<p>✏️ Be the first to leave a message!</p>';
      emptyState.style.display = 'block';
    }
  }
}

// Save entry to Google Sheets
async function saveGuestbookEntry(name, message, date) {
  await fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message, date })
  });
}

// Add entry to DOM
function addEntryToDOM(name, message, date) {
  const emptyState = document.getElementById('emptyState');
  if (emptyState) emptyState.style.display = 'none';

  const entryDiv = document.createElement('div');
  entryDiv.className = 'guestbook-entry';
  entryDiv.style.opacity = '0';
  entryDiv.style.transform = 'scale(0.8)';

  entryDiv.innerHTML = `
    <div class="entry-header">
      <strong>${escapeHtml(name)}</strong>
      <span class="entry-date">${date}</span>
    </div>
    <p class="entry-message">${escapeHtml(message)}</p>
  `;

  guestbookEntries.insertBefore(entryDiv, guestbookEntries.firstChild);

  setTimeout(() => {
    entryDiv.style.transition = 'all 0.5s ease';
    entryDiv.style.opacity = '1';
    entryDiv.style.transform = 'scale(1)';
  }, 10);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format date
function formatDate(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = dateStr ? new Date(dateStr) : new Date();
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Handle form submission
if (guestbookForm) {
  guestbookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('nameInput');
    const messageInput = document.getElementById('messageInput');
    const submitBtn = guestbookForm.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const date = formatDate();

    if (name && message) {
      // Show loading state on button
      submitBtn.innerHTML = '<span>⏳ Sending...</span>';
      submitBtn.disabled = true;

      // Add to DOM immediately (optimistic UI)
      addEntryToDOM(name, message, date);

      // Save to Google Sheets
      await saveGuestbookEntry(name, message, date);

      // Clear form
      nameInput.value = '';
      messageInput.value = '';

      // Success animation
      submitBtn.innerHTML = '<span>✓ Signed!</span>';
      submitBtn.style.background = 'var(--color-primary)';
      submitBtn.disabled = false;

      setTimeout(() => {
        submitBtn.innerHTML = '<span>Sign Guestbook</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        submitBtn.style.background = '';
      }, 2000);
    }
  });
}

// Load entries on page load
loadGuestbookEntries();

// ============================================
// PARALLAX SCROLL EFFECT
// ============================================

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  
  // Parallax effect on hero section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
  
  // Parallax effect on section titles
  document.querySelectorAll('.section-title').forEach(title => {
    const rect = title.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const offset = (window.innerHeight - rect.top) * 0.1;
      title.style.transform = `translateY(${-offset}px)`;
    }
  });
});

// ============================================
// STAGGER ANIMATION FOR TIMELINE ITEMS
// ============================================

const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach((item, index) => {
  item.style.animationDelay = `${index * 0.1}s`;
});

// ============================================
// PAGE LOAD ANIMATION
// ============================================

window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

// ============================================
// CURSOR TRAIL EFFECT
// ============================================

const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");

// Create cursor trail circles
if (!document.querySelector('.circle')) {
  for (let i = 0; i < 20; i++) {
    const circle = document.createElement('div');
    circle.className = 'circle';
    document.body.appendChild(circle);
  }
}

const allCircles = document.querySelectorAll(".circle");

allCircles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = `rgba(255, 255, 255, ${(20 - index) * 0.02})`;
});

window.addEventListener("mousemove", function(e){
  coords.x = e.clientX;
  coords.y = e.clientY;
});

function animateCircles() {
  let x = coords.x;
  let y = coords.y;
  
  allCircles.forEach(function (circle, index) {
    circle.style.left = x - 12 + "px";
    circle.style.top = y - 12 + "px";
    
    circle.style.transform = `scale(${(20 - index) / 20})`;
    
    circle.x = x;
    circle.y = y;

    const nextCircle = allCircles[index + 1] || allCircles[0];
    x += (nextCircle.x - x) * 0.3;
    y += (nextCircle.y - y) * 0.3;
  });
 
  requestAnimationFrame(animateCircles);
}

animateCircles();

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0) scale(1)';
  });
});
