import "../css/styles.css";
import jinn1 from "../../Images/jinn-1.png";
import jinn2 from "../../Images/jinn-2.png";
import jinn3 from "../../Images/jinn-3.png";
import jinn4 from "../../Images/jinn-4.png";
import jinn5 from "../../Images/jinn-5.png";
import jinn6 from "../../Images/jinn-6.png";
import jinn7 from "../../Images/jinn-7.png";
import jinn8 from "../../Images/jinn-8.png";
import jinn9 from "../../Images/jinn-9.png";
import jinn10 from "../../Images/jinn-10.png";
import jinnFull from "../../Images/jinn-full.png";
import copa from "../../Images/copa.png";
import portfolio from "../../Images/portfolio.png";
import comingsoon from "../../Images/coming_soon_2.jpg";
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

async function saveVisitData(sessionId, visitStart, referrer) {
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
      console.log("Visit data saved successfully");
    } else {
      console.error("Failed to save visit data");
    }
  } catch (error) {
    console.error("Error sending visit data:", error);
  }
}

async function updateVisitData(sessionId, visitEnd, updatedAt) {
  try {
    const response = await fetch("/api/updateVisit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        visit_end: visitEnd,
        updated_at: updatedAt,
      }),
    });

    if (response.ok) {
      console.log("Visit data updated successfully");
    } else {
      console.error("Failed to update visit data");
    }
  } catch (error) {
    console.error("Error updating visit data:", error);
  }
}

function trackElementClicks() {
  const elements = document.querySelectorAll("button, a");

  elements.forEach((element) => {
    element.addEventListener("click", (event) => {
      const clickedElement = event.target.closest("a, button");
      console.log(
        `User clicked on: ${clickedElement.tagName} with ID: ${
          clickedElement.id || "No ID"
        } and Text: ${clickedElement.textContent}`
      );

      sendClickDataToServer(clickedElement, sessionId);
    });
  });
}

async function sendClickDataToServer(element, sessionId) {
  const data = {
    session_id: sessionId,
    elementTag: element.tagName,
    elementId: element.id || null,
    elementText: element.textContent,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch("/api/saveClickData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Click data saved successfully");
    } else {
      console.error("Failed to save click data");
    }
  } catch (error) {
    console.error("Error sending click data:", error);
  }
}

window.addEventListener("beforeunload", () => {
  const visitEnd = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  saveVisitData(sessionId, visitStart, referrer);
  updateVisitData(sessionId, visitEnd, updatedAt);
});

trackElementClicks();

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
const portfolioImages = [
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
  [copa],
  [portfolio],
  [comingsoon],
];

document.querySelectorAll(".portfolio-wrapper").forEach((wrapper, index) => {
  // В каждом wrapper, добавляем атрибут data-images с соответствующими изображениями
  wrapper.dataset.images = JSON.stringify(portfolioImages[index]);

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
  const modal = createModal(images);
  document.body.appendChild(modal);
  modal.style.display = "flex";
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

  closeButton.addEventListener("click", () => modal.remove());
  prevButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage(images);
    resetImagePosition(modalImg);
  });
  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage(images);
  });

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-background")) modal.remove();
  });

  setupImageInteractions(modalImg);

  return modal;
}

function updateImage(images) {
  document.getElementById("modalImg").src = images[currentIndex];
}

function setupImageInteractions(modalImg) {
  modalImg.style.position = "relative";

  modalImg.addEventListener("mousedown", (e) => handleMouseDown(e, modalImg));
  document.addEventListener("mousemove", (e) => handleMouseMove(e, modalImg));
  document.addEventListener("mouseup", handleMouseUp);
  modalImg.addEventListener("wheel", (event) => handleWheel(event, modalImg));
  modalImg.addEventListener("click", () => handleImageClick(modalImg));
}

function handleMouseDown(e, modalImg) {
  if (e.button !== 0) return;
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - moveX;
  startY = e.clientY - moveY;
  modalImg.style.cursor = "grabbing";
}

function handleMouseMove(e, modalImg) {
  if (!isDragging) return;
  moveX = e.clientX - startX;
  moveY = e.clientY - startY;
  modalImg.style.transform = `scale(${scale}) translate(${moveX}px, ${moveY}px)`;
}

function handleMouseUp() {
  isDragging = false;
}

function handleWheel(event, modalImg) {
  event.preventDefault();
  scale += event.deltaY * -0.01;
  scale = Math.min(Math.max(1, scale), 10);
  modalImg.style.transform = `scale(${scale})`;
  updateCursor(modalImg);
}

function handleImageClick(modalImg) {
  if (scale === 1) {
    scale = 2;
    modalImg.style.transform = `scale(${scale})`;
  }
  updateCursor(modalImg);
}

function resetImagePosition(modalImg) {
  modalImg.style.transform = `scale(1)`;
  modalImg.style.cursor = "grab";
  modalImg.style.left = "0px";
  modalImg.style.top = "0px";
}

function updateCursor(modalImg) {
  if (scale === 1) {
    modalImg.style.cursor = "zoom-in";
  } else {
    modalImg.style.cursor = "grab";
  }
}
