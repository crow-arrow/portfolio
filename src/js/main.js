import "../css/styles.css";
import jinn1 from "../../public/images/jinn-1.avif";
import jinn2 from "../../public/images/jinn-2.avif";
import jinn3 from "../../public/images/jinn-3.avif";
import jinn4 from "../../public/images/jinn-4.avif";
import jinn5 from "../../public/images/jinn-5.avif";
import jinn6 from "../../public/images/jinn-6.avif";
import jinn7 from "../../public/images/jinn-7.avif";
import jinn8 from "../../public/images/jinn-8.avif";
import jinn9 from "../../public/images/jinn-9.avif";
import jinn10 from "../../public/images/jinn-10.avif";
import jinnFull from "../../public/images/jinn-full.avif";
import copa from "../../public/images/copa.avif";
import portfolio from "../../public/images/portfolio.avif";
import affiliate from "../../public/images/login.avif";
import affiliate2 from "../../public/images/signup.avif";
import affiliate3 from "../../public/images/request-for-passwor-recovery.avif";
import affiliate4 from "../../public/images/passwor-recovery.avif";
import affiliate5 from "../../public/images/email-confirmation.avif";
import affiliate6 from "../../public/images/gold-overview.avif";
import affiliate7 from "../../public/images/silver-overview.avif";
import affiliate8 from "../../public/images/trips.avif";
import affiliate9 from "../../public/images/settings-and-referral-link.avif";
import affiliate10 from "../../public/images/all-orders.avif";
import affiliate11 from "../../public/images/team.avif";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";

inject();
injectSpeedInsights();

// Visitors session time
function getVisitStart() {
  let visitStart = sessionStorage.getItem("visit_start");

  if (!visitStart) {
    visitStart = new Date().toISOString();
    sessionStorage.setItem("visit_start", visitStart);
  }

  return visitStart;
}

const visitStart = getVisitStart();
const sessionId = sessionStorage.getItem("session_id") || crypto.randomUUID();
sessionStorage.setItem("session_id", sessionId);
const referrer = document.referrer || "direct";

let visitorId = sessionStorage.getItem("visitor_id");

async function saveVisitData(visitStart, sessionId, referrer) {
  if (visitorId) {
    console.log("Visitor already exists with ID:", visitorId);
    trackElementClicks();
    return;
  }

  try {
    const response = await fetch("/api/saveVisit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        visit_start: visitStart,
        referrer: referrer,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      visitorId = data.visitor_id;
      sessionStorage.setItem("visitor_id", visitorId);

      trackElementClicks();
    } else {
      console.error("Failed to save visit data");
    }
  } catch (error) {
    console.error("Error sending visit data:", error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  saveVisitData(visitStart, sessionId, referrer);
});

function trackElementClicks() {
  if (!visitorId) {
    console.warn("visitorId is not available yet, click tracking is delayed.");
    return;
  }

  document.body.addEventListener("click", (event) => {
    const clickedElement = event.target.closest("a, button");
    if (!clickedElement) return;

    sendClickDataToServer(clickedElement);
  });
}

function sendClickDataToServer(element) {
  if (!visitorId) return;

  const data = {
    visitor_id: visitorId,
    elementTag: element.tagName,
    elementId: element.id || null,
    elementText: element.textContent.trim().slice(0, 100),
    timestamp: new Date().toISOString(),
  };

  fetch("/api/saveClickData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        // Click data saved successfully
      } else {
        console.error("Failed to save click data");
      }
    })
    .catch((error) => {
      console.error("Error sending click data:", error);
    });
}

async function saveVisitEnd(sessionId) {
  try {
    const visitEnd = new Date().toISOString();
    const response = await fetch("/api/saveVisitEnd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        visit_end: visitEnd,
      }),
    });
    if (response.ok) {
      // silently ignored
    }
  } catch (error) {
    // silently ignored
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    const isVisitEndSaved = sessionStorage.getItem("visit_end_saved");

    if (!isVisitEndSaved) {
      saveVisitEnd(sessionId);
      sessionStorage.setItem("visit_end_saved", "true");
    }
  }
});

window.addEventListener("pagehide", () => {
  sessionStorage.removeItem("visit_end_saved");
});

// Animation on scroll
gsap.registerPlugin(ScrollTrigger);

const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

if (!isTouchDevice()) {
  const cards = document.querySelectorAll(".portfolio-card");

  cards.forEach((item) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "center 85%",
        end: "center 20%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(item, {
      scale: 1.1,
      ease: "none",
    }).to(item, {
      scale: 1.0,
      ease: "none",
    });
  });

  cards.forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: "center 80%",
      end: "center 25%",
      onEnter: () => item.classList.add("animate-gradient"),
      onEnterBack: () => item.classList.add("animate-gradient"),
      onLeave: () => item.classList.remove("animate-gradient"),
      onLeaveBack: () => item.classList.remove("animate-gradient"),
    });
  });
}

// Header
window.addEventListener("scroll", () => {
  const header = document.getElementsByClassName("header")[0];
  const active_class = "is-scrolled";

  if (window.scrollY > 10 && !header.classList.contains(active_class)) {
    header.classList.add(active_class);
  } else if (window.scrollY <= 10 && header.classList.contains(active_class)) {
    header.classList.remove(active_class);
  }
});

// Menu
const menuLinks = document.querySelectorAll(".header-menu-link");
const sections = document.querySelectorAll("section");

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    updateActiveState(link.getAttribute("href").substring(1));
  });
});

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  updateActiveState(current);
});

function updateActiveState(sectionId) {
  menuLinks.forEach((link) => {
    link.parentElement.classList.remove("active");
    if (link.getAttribute("href") === `#${sectionId}`) {
      link.parentElement.classList.add("active");
    }
  });
}

// Смена темы
const getThemeBasedOnTime = () => {
  const now = new Date();
  const hours = now.getHours();

  return hours >= 6 && hours < 19 ? "light" : "dark";
};

const themeFromTime = getThemeBasedOnTime();
document.body.classList.add(themeFromTime);

const toggleTheme = () => {
  const htmlElement = document.documentElement;
  const islitemode = htmlElement.classList.contains("litemode");
  if (islitemode) {
    htmlElement.classList.remove("litemode");
  } else {
    htmlElement.classList.add("litemode");
  }
  localStorage.setItem("theme", islitemode ? "dark" : "light");
};

const savedTheme = localStorage.getItem("theme") || themeFromTime;
if (savedTheme === "light") {
  document.documentElement.classList.add("litemode");
} else {
  document.documentElement.classList.remove("litemode");
}

document.querySelector("#theme-switch").addEventListener("click", toggleTheme);

// Mobile menu
const circle = document.querySelector(".material-btn");
const links = document.querySelectorAll(".material-content li");
const ham = document.querySelector(".material-hamburger");
const main = document.querySelector("main");
const content = document.querySelector(".material-content");
const win = window;
const menuItems = document.querySelector(".menu-open.menu-items");

function openMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  circle.classList.toggle("active");
  ham.classList.toggle("material-close");
  main.classList.toggle("active");
  content.classList.toggle("active");

  links.forEach((link) => link.classList.toggle("active"));
}

function closeMenu(event) {
  if (!circle.contains(event.target) && !menuItems.contains(event.target)) {
    circle.classList.remove("active");
    ham.classList.remove("material-close");
    main.classList.remove("active");
    content.classList.remove("active");

    links.forEach((link) => link.classList.remove("active"));
  }
}

circle.addEventListener("click", openMenu, false);
win.addEventListener("click", closeMenu, false);

function setWrapperHeight() {
  const viewportHeight = window.innerHeight;
  document.querySelector(
    ".material-menu-wrapper"
  ).style.height = `${viewportHeight}px`;
}

window.addEventListener("resize", setWrapperHeight);
window.addEventListener("load", setWrapperHeight);

// Modal for experience images
const portfolioimages = [
  [
    affiliate,
    affiliate2,
    affiliate3,
    affiliate4,
    affiliate5,
    affiliate6,
    affiliate7,
    affiliate8,
    affiliate9,
    affiliate10,
    affiliate11,
  ],
  [portfolio],
  [copa],
  [
    jinn1,
    jinn2,
    jinn3,
    jinn4,
    jinn5,
    jinn6,
    jinn7,
    jinn8,
    jinn9,
    jinn10,
    jinnFull,
  ],
];

document.querySelectorAll(".portfolio-wrapper").forEach((wrapper, index) => {
  wrapper.dataset.images = JSON.stringify(portfolioimages[index]);

  wrapper.addEventListener("click", function () {
    const images = JSON.parse(this.dataset.images);
    openModal(images);
  });
});

let currentIndex = 0;
let scale = 1;
let isDragging = false;
let startX = 0,
  startY = 0,
  moveX = 0,
  moveY = 0;

function openModal(images) {
  currentIndex = 0; // Сброс индекса
  const modal = createModal(images);
  document.body.appendChild(modal);
  modal.style.display = "flex";

  document.addEventListener("keydown", (e) => handleKeyPress(e, images, modal));
}

function createModal(images) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-background">
      <span class="close material-symbols-outlined">Close</span>
      <img class="modal-content" id="modalImg" src="${images[currentIndex]}" alt="Modal Image">
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>
    </div>
  `;

  const closeButton = modal.querySelector(".close");
  const prevButton = modal.querySelector(".prev");
  const nextButton = modal.querySelector(".next");
  const modalImg = modal.querySelector(".modal-content");

  closeButton.addEventListener("click", () => closeModal(modal));
  prevButton.addEventListener("click", () => updateImage(images, -1, modalImg));
  nextButton.addEventListener("click", () => updateImage(images, 1, modalImg));

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-background")) closeModal(modal);
  });

  setupImageInteractions(modalImg, modal);

  return modal;
}

function updateImage(images, direction, modalImg) {
  currentIndex = (currentIndex + direction + images.length) % images.length;
  modalImg.src = images[currentIndex];
  resetImagePosition(modalImg);
}

function setupImageInteractions(modalImg, modal) {
  modalImg.style.position = "relative";

  const mouseMoveHandler = (e) => handleMouseMove(e, modalImg);
  const mouseUpHandler = () =>
    handleMouseUp(modalImg, mouseMoveHandler, mouseUpHandler);

  modalImg.addEventListener("mousedown", (e) =>
    handleMouseDown(e, modalImg, mouseMoveHandler, mouseUpHandler)
  );
  modalImg.addEventListener("wheel", (event) => handleWheel(event, modalImg));
  modalImg.addEventListener("click", () => handleImageClick(modalImg));
}

function handleMouseDown(e, modalImg, mouseMoveHandler, mouseUpHandler) {
  if (e.button !== 0) return;
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - moveX;
  startY = e.clientY - moveY;
  modalImg.style.cursor = "grabbing";

  document.addEventListener("mousemove", mouseMoveHandler);
  document.addEventListener("mouseup", mouseUpHandler);
}

function handleMouseMove(e, modalImg) {
  if (!isDragging) return;
  moveX = e.clientX - startX;
  moveY = e.clientY - startY;
  modalImg.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
}

function handleMouseUp(modalImg, mouseMoveHandler, mouseUpHandler) {
  isDragging = false;
  modalImg.style.cursor = "grab";

  document.removeEventListener("mousemove", mouseMoveHandler);
  document.removeEventListener("mouseup", mouseUpHandler);
}

function handleWheel(event, modalImg) {
  event.preventDefault();

  const rect = modalImg.getBoundingClientRect();
  const offsetX = (event.clientX - rect.left) / rect.width;
  const offsetY = (event.clientY - rect.top) / rect.height;

  const oldScale = scale;
  scale += event.deltaY * -0.01;
  scale = Math.min(Math.max(1, scale), 5);

  moveX -= offsetX * rect.width * (scale - oldScale);
  moveY -= offsetY * rect.height * (scale - oldScale);

  modalImg.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
  updateCursor(modalImg);
}

function handleImageClick(modalImg) {
  if (scale === 1) {
    scale = 2;
  } else {
    scale = 1;
    moveX = 0;
    moveY = 0;
  }
  modalImg.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
  updateCursor(modalImg);
}

function resetImagePosition(modalImg) {
  scale = 1;
  moveX = 0;
  moveY = 0;
  modalImg.style.transform = `scale(1) translate(0px, 0px)`;
  modalImg.style.cursor = "zoom-in";
}

function updateCursor(modalImg) {
  modalImg.style.cursor = scale > 1 ? "grab" : "zoom-in";
}

function handleKeyPress(e, images, modal) {
  if (e.key === "Escape") {
    closeModal(modal);
  } else if (e.key === "ArrowLeft") {
    updateImage(images, -1, document.getElementById("modalImg"));
  } else if (e.key === "ArrowRight") {
    updateImage(images, 1, document.getElementById("modalImg"));
  }
}

function closeModal(modal) {
  document.removeEventListener("keydown", handleKeyPress);
  modal.remove();
}
