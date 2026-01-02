// === Skills Tab ===
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    tabContents[i].classList.add("active");
  });
});

// === Carousel Slide ===
const slides = document.querySelectorAll(".carousel-slide");
const indicators = document.querySelectorAll(".carousel-indicator");

let currentIndex = 0;
const intervalTime = 4000; // 4 detik

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
    indicators[i].classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

// Auto-slide
let slideInterval = setInterval(nextSlide, intervalTime);

// Klik indikator manual (opsional)
indicators.forEach((indicator, i) => {
  indicator.addEventListener("click", () => {
    clearInterval(slideInterval); // stop sementara saat diklik
    showSlide(i);
    currentIndex = i;
    slideInterval = setInterval(nextSlide, intervalTime); // restart interval
  });
});
