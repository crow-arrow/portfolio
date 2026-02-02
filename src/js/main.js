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
import affiliate2 from "../../public/images/multitenancy.avif";
import affiliate3 from "../../public/images/dashboard.avif";
import affiliate4 from "../../public/images/data-table.avif";
import affiliate5 from "../../public/images/profile-settings.avif";
import affiliate6 from "../../public/images/admin-settings-apikey.avif";
import affiliate7 from "../../public/images/field-mapping.avif";
import sib from "../../public/images/sib.png";
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

// Skills animation on scroll
function initSkillsAnimation() {
  const skillsSection = document.getElementById("skills");
  if (!skillsSection) return;

  const skillsColumns = document.querySelectorAll(".skills-column");
  if (skillsColumns.length === 0) return;

  // Получаем элементы из каждой колонки
  const hardSkillsItems = Array.from(skillsColumns[0]?.querySelectorAll(".skills-item") || []);
  const softSkillsItems = Array.from(skillsColumns[1]?.querySelectorAll(".skills-item") || []);
  
  // Находим максимальное количество элементов для синхронизации
  const maxItems = Math.max(hardSkillsItems.length, softSkillsItems.length);

  let animationTriggered = false;
  let lastScrollY = window.scrollY;
  let isScrollingDown = true;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    isScrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animationTriggered) {
          animationTriggered = true;

          // Сбрасываем все элементы
          [...hardSkillsItems, ...softSkillsItems].forEach((item) => {
            item.classList.remove("animate", "animate-reverse");
            item.style.transform = isScrollingDown ? "translateX(-100px)" : "translateX(100px)";
            item.style.opacity = "0";
          });

          if (isScrollingDown) {
            // Анимируем элементы с одинаковым индексом одновременно
            for (let index = 0; index < maxItems; index++) {
              setTimeout(() => {
                // Hard Skills элемент
                if (hardSkillsItems[index]) {
                  hardSkillsItems[index].classList.add("animate");
                }
                // Soft Skills элемент (одновременно)
                if (softSkillsItems[index]) {
                  softSkillsItems[index].classList.add("animate");
                }
              }, index * 50);
            }
          } else {
            // При скролле вверх анимируем в обратном порядке
            for (let index = maxItems - 1; index >= 0; index--) {
              setTimeout(() => {
                // Hard Skills элемент
                if (hardSkillsItems[index]) {
                  hardSkillsItems[index].classList.add("animate-reverse");
                }
                // Soft Skills элемент (одновременно)
                if (softSkillsItems[index]) {
                  softSkillsItems[index].classList.add("animate-reverse");
                }
              }, (maxItems - 1 - index) * 50);
            }
          }
        } else if (!entry.isIntersecting && animationTriggered) {
          animationTriggered = false;
          [...hardSkillsItems, ...softSkillsItems].forEach((item) => {
            item.classList.remove("animate", "animate-reverse");
          });
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  observer.observe(skillsSection);
}

window.addEventListener("DOMContentLoaded", () => {
  initSkillsAnimation();
  initAboutAnimation();
});

// Typewriter animation function using GSAP with cursor
function addTypewriterToTimeline(timeline, element, text, speed = 0.08, position = 0) {
  element.textContent = "";
  element.style.opacity = "1";
  
  const chars = text.split("");
  let cursor = null; // Курсор будет создан только при начале печати
  
  chars.forEach((char, index) => {
    timeline.call(
      () => {
        // Создаем курсор только при печати первого символа
        if (index === 0 && !cursor) {
          cursor = document.createElement("span");
          cursor.className = "typewriter-cursor";
          cursor.textContent = "|";
          element.appendChild(cursor);
        }
        
        // Добавляем символ перед курсором
        if (cursor) {
          element.insertBefore(document.createTextNode(char), cursor);
        } else {
          element.textContent += char;
        }
      },
      null,
      position + index * speed
    );
  });
  
  // Убираем курсор после завершения печати
  timeline.call(
    () => {
      if (cursor) {
        cursor.remove();
      }
    },
    null,
    position + chars.length * speed + 0.1
  );
  
  return position + chars.length * speed + 0.1;
}

// About section animation
function initAboutAnimation() {
  const aboutSection = document.querySelector(".section.about");
  if (!aboutSection) return;

  const titleBody = aboutSection.querySelector(".title-body");
  const aboutTitle = aboutSection.querySelector(".about-title");
  const titleLines = aboutSection.querySelectorAll(".live-typing");
  const cvButton = aboutSection.querySelector(".check-button");
  const profilePicture = aboutSection.querySelector(".profile-picture");
  const heroSection = aboutSection.querySelector(".hero-section");

  if (!titleBody || !aboutTitle || !cvButton || !profilePicture) return;

  // Сохраняем оригинальный текст для каждой строки
  const originalTexts = Array.from(titleLines).map((line) => line.textContent);

  // Устанавливаем начальное состояние для анимации
  gsap.set(cvButton, { opacity: 0, y: 50 });
  gsap.set(profilePicture, { opacity: 0, scale: 0.8, rotation: -5 });
  
  // Резервируем место для текста, чтобы он не двигался вверх
  titleLines.forEach((line) => {
    const text = line.textContent;
    const originalWidth = line.offsetWidth;
    
    // Сохраняем оригинальную высоту и ширину через невидимый клон
    const clone = line.cloneNode(true);
    clone.style.visibility = "hidden";
    clone.style.position = "absolute";
    clone.style.height = "auto";
    clone.style.width = originalWidth + "px";
    clone.style.whiteSpace = "normal"; // Используем нормальный перенос
    clone.style.wordWrap = "break-word";
    line.style.position = "relative";
    line.parentNode.insertBefore(clone, line);
    
    // Устанавливаем фиксированную ширину и высоту на основе клона
    const height = clone.offsetHeight;
    line.style.minHeight = height + "px";
    line.style.width = originalWidth + "px"; // Фиксируем ширину
    line.style.whiteSpace = "normal"; // Используем нормальный перенос
    line.style.wordWrap = "break-word";
    
    // Очищаем видимый текст для typewriter эффекта
    line.textContent = "";
    line.style.opacity = "1";
    
    // Удаляем клон после небольшой задержки
    setTimeout(() => {
      clone.remove();
    }, 500);
  });

  // Создаем timeline для анимации при загрузке
  const loadTl = gsap.timeline({ delay: 0.5 });

  // Анимация изображения профиля с задержкой 3 секунды
  loadTl.to(
    profilePicture,
    {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
    },
    1.5 // Задержка 3 секунды от начала timeline
  );

  // Анимация печатания для каждой строки (медленнее)
  let currentPosition = 0;
  titleLines.forEach((line, index) => {
    const text = originalTexts[index];
    
    if (index === 0) {
      currentPosition = addTypewriterToTimeline(loadTl, line, text, 0.08, 0);
    } else {
      currentPosition = addTypewriterToTimeline(loadTl, line, text, 0.08, currentPosition + 0.5);
    }
  });

  loadTl.to(
    cvButton,
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
    },
    "+=0.3"
  );

  // Parallax эффект при скролле для изображения профиля (только для десктопа)
  if (heroSection) {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouch) {
      gsap.to(profilePicture, {
        y: -50,
        scrollTrigger: {
          trigger: aboutSection,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }
  }

  // Анимация при повторном появлении секции (при скролле вверх)
  let hasAnimated = false;
  ScrollTrigger.create({
    trigger: aboutSection,
    start: "top 80%",
    onEnter: () => {
      // Пропускаем анимацию при первой загрузке (она уже выполнена выше)
      if (hasAnimated) {
        // Восстанавливаем текст
        titleLines.forEach((line, index) => {
          line.textContent = originalTexts[index];
        });
        
        const scrollTl = gsap.timeline();
        
        // Анимация печатания для строк
        let scrollPosition = 0;
        titleLines.forEach((line, index) => {
          // Резервируем место
          const text = originalTexts[index];
          const originalWidth = line.offsetWidth;
          
          const clone = line.cloneNode(true);
          clone.textContent = text;
          clone.style.visibility = "hidden";
          clone.style.position = "absolute";
          clone.style.height = "auto";
          clone.style.width = originalWidth + "px";
          clone.style.whiteSpace = "normal";
          clone.style.wordWrap = "break-word";
          line.style.position = "relative";
          line.parentNode.insertBefore(clone, line);
          
          const height = clone.offsetHeight;
          line.style.minHeight = height + "px";
          line.style.width = originalWidth + "px"; // Фиксируем ширину
          line.style.whiteSpace = "normal"; // Используем нормальный перенос
          line.style.wordWrap = "break-word";
          
          line.textContent = "";
          
          if (index === 0) {
            scrollPosition = addTypewriterToTimeline(scrollTl, line, text, 0.08, 0);
          } else {
            scrollPosition = addTypewriterToTimeline(scrollTl, line, text, 0.08, scrollPosition + 0.5);
          }
          
          setTimeout(() => {
            clone.remove();
          }, 500);
        });
        
        scrollTl
          .to(
            cvButton,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "back.out(1.7)",
            },
            "+=0.2"
          )
          .to(
            profilePicture,
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.5"
          );
      } else {
        hasAnimated = true;
      }
    },
  });
}

gsap.registerPlugin(ScrollTrigger);

const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

if (!isTouchDevice()) {
  const cards = Array.from(document.querySelectorAll(".portfolio-card"));
  
  const getHeaderHeight = () => {
    const header = document.querySelector(".header");
    return header ? header.offsetHeight : 88;
  };
  
  const getCenterOffset = () => {
    const headerHeight = getHeaderHeight();
    const centerPercent = ((window.innerHeight - headerHeight) / 2 + headerHeight) / window.innerHeight * 100;
    return centerPercent.toFixed(1);
  };

  cards.forEach((item, index) => {
    const nextCard = cards[index + 1];
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 60%",
        endTrigger: nextCard || item,
        end: nextCard 
          ? "top 60%"
          : () => `+=${item.offsetHeight}`,
        scrub: true,
        invalidateOnRefresh: true,
        markers: false,
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

  cards.forEach((item, index) => {
    const nextCard = cards[index + 1];
    
    ScrollTrigger.create({
      trigger: item,
      start: "top 60%",
      endTrigger: nextCard || item,
      end: nextCard
        ? "top 60%"
        : () => `+=${Math.round(item.offsetHeight * 0.8)}`,
      markers: false,
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
  [sib],
  [
    affiliate,
    affiliate2,
    affiliate3,
    affiliate4,
    affiliate5,
    affiliate6,
    affiliate7,
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
let moveX = 0;
let moveY = 0;

// Создаем портал для модалки
function createModalPortal() {
  let portal = document.getElementById('modal-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'modal-portal';
    portal.style.position = 'fixed';
    portal.style.top = '0';
    portal.style.left = '0';
    portal.style.width = '100%';
    portal.style.height = '100%';
    portal.style.zIndex = '99999';
    portal.style.pointerEvents = 'none';
    portal.style.isolation = 'isolate';
    document.body.appendChild(portal);
  }
  return portal;
}

function openModal(images) {
  currentIndex = 0; // Сброс индекса
  // Сбрасываем состояние зума при открытии новой модалки
  scale = 1;
  moveX = 0;
  moveY = 0;
  
  const modal = createModal(images);
  const portal = createModalPortal();
  portal.style.pointerEvents = 'auto'; // Включаем взаимодействие с модалкой
  portal.appendChild(modal);
  modal.style.display = "flex";
  
  // Блокируем скролл body когда модалка открыта
  document.body.style.overflow = "hidden";

  document.addEventListener("keydown", (e) => handleKeyPress(e, images, modal));
}

function createModal(images) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-background">
      <span class="close material-symbols-outlined">Close</span>
      <div class="modal-content-wrapper">
        <img class="modal-content" id="modalImg" src="${images[currentIndex]}" alt="Modal Image">
      </div>
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>
    </div>
  `;

  const closeButton = modal.querySelector(".close");
  const prevButton = modal.querySelector(".prev");
  const nextButton = modal.querySelector(".next");
  let modalImg = modal.querySelector(".modal-content");

  closeButton.addEventListener("click", () => closeModal(modal));
  
  const handlePrev = () => {
    modalImg = modal.querySelector(".modal-content");
    updateImage(images, -1, modalImg);
  };
  const handleNext = () => {
    modalImg = modal.querySelector(".modal-content");
    updateImage(images, 1, modalImg);
  };
  
  prevButton.addEventListener("click", handlePrev);
  nextButton.addEventListener("click", handleNext);

  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-background")) closeModal(modal);
  });

  setupImageInteractions(modalImg, modal);

  return modal;
}

function updateImage(images, direction, modalImg) {
  const wasZoomed = scale > 1.01;
  const savedScale = scale;
  const savedMoveX = moveX;
  const savedMoveY = moveY;
  const savedWrapperStyles = {};
  
  const imageWrapper = modalImg.parentElement;
  if (imageWrapper && imageWrapper.classList.contains('modal-content-wrapper')) {
    savedWrapperStyles.width = imageWrapper.style.width;
    savedWrapperStyles.maxWidth = imageWrapper.style.maxWidth;
    savedWrapperStyles.height = imageWrapper.style.height;
    savedWrapperStyles.overflowY = imageWrapper.style.overflowY;
    savedWrapperStyles.overflowX = imageWrapper.style.overflowX;
  }
  
  currentIndex = (currentIndex + direction + images.length) % images.length;
  modalImg.src = images[currentIndex];
  
  if (!wasZoomed) {
    resetImagePosition(modalImg);
  }
  
  const modal = modalImg.closest('.modal');
  setupImageInteractions(modalImg, modal, wasZoomed, savedScale, savedMoveX, savedMoveY, savedWrapperStyles);
}

function setupImageInteractions(modalImg, modal, preserveZoom = false, savedScale = 1, savedMoveX = 0, savedMoveY = 0, savedWrapperStyles = {}) {
  if (preserveZoom) {
    scale = savedScale;
    moveX = savedMoveX;
    moveY = savedMoveY;
    
    const imageWrapper = modalImg.parentElement;
    if (imageWrapper && imageWrapper.classList.contains('modal-content-wrapper')) {
      imageWrapper.style.width = savedWrapperStyles.width || '';
      imageWrapper.style.maxWidth = savedWrapperStyles.maxWidth || '';
      imageWrapper.style.height = savedWrapperStyles.height || '';
      imageWrapper.style.overflowY = savedWrapperStyles.overflowY || '';
      imageWrapper.style.overflowX = savedWrapperStyles.overflowX || '';
    }
  } else {
    scale = 1;
    moveX = 0;
    moveY = 0;
  }
  
  modalImg.style.position = "relative";
  modalImg.style.transition = "transform 0.3s ease";
  modalImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
  modalImg.style.transformOrigin = preserveZoom ? 'center center' : '';
  modalImg.style.cursor = scale > 1 ? "zoom-out" : "zoom-in";
  
  if (!preserveZoom) {
    const imageWrapper = modalImg.parentElement;
    if (imageWrapper && imageWrapper.classList.contains('modal-content-wrapper')) {
      imageWrapper.style.width = '';
      imageWrapper.style.maxWidth = '';
      imageWrapper.style.height = '';
      imageWrapper.style.overflowY = '';
      imageWrapper.style.overflowX = '';
    }
  }

  if (modalImg._clickHandler) {
    modalImg.removeEventListener("click", modalImg._clickHandler);
    modalImg._clickHandler = null;
    modalImg._clickHandlerAdded = false;
  }
  
  modalImg._clickHandler = (e) => handleImageClick(modalImg, e);
  
  const addClickHandler = () => {
    if (modalImg._clickHandlerAdded) {
      return true;
    }
    
    if (modalImg.complete && modalImg.naturalWidth > 0 && modalImg.naturalHeight > 0) {
      setTimeout(() => {
        const rect = modalImg.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && !modalImg._clickHandlerAdded) {
          modalImg.addEventListener("click", modalImg._clickHandler);
          modalImg._clickHandlerAdded = true;
        }
      }, 50);
      return true;
    }
    return false;
  };
  
  addClickHandler();
  
  const loadHandler = () => {
    setTimeout(() => {
      if (!modalImg._clickHandlerAdded) {
        addClickHandler();
      }
      if (preserveZoom) {
        applyZoomAfterLoad(modalImg);
      }
    }, 100);
  };
  
  if (!modalImg.complete) {
    modalImg.addEventListener("load", loadHandler, { once: true });
  } else if (preserveZoom) {
    setTimeout(() => {
      applyZoomAfterLoad(modalImg);
    }, 100);
  }
  
  setTimeout(() => {
    if (!modalImg._clickHandlerAdded && modalImg.complete && modalImg.naturalWidth > 0) {
      addClickHandler();
    }
  }, 500);
}

function applyZoomAfterLoad(modalImg) {
  const imageWrapper = modalImg.parentElement;
  if (!imageWrapper || !imageWrapper.classList.contains('modal-content-wrapper')) {
    return;
  }
  
  if (!modalImg.complete || modalImg.naturalWidth === 0) {
    return;
  }
  
  modalImg.style.transformOrigin = 'center center';
  modalImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
  updateCursor(modalImg);
  
  if (scale > 1.01) {
    imageWrapper.style.width = imageWrapper.style.width || '100vw';
    imageWrapper.style.maxWidth = imageWrapper.style.maxWidth || '100vw';
    
    const aspectRatio = modalImg.naturalHeight / modalImg.naturalWidth;
    const scaledHeight = window.innerWidth * aspectRatio;
    
    if (scaledHeight > window.innerHeight) {
      imageWrapper.style.height = imageWrapper.style.height || '100vh';
      imageWrapper.style.overflowY = imageWrapper.style.overflowY || 'auto';
      imageWrapper.style.overflowX = imageWrapper.style.overflowX || 'hidden';
    }
  }
}



function handleImageClick(modalImg, event) {
  if (!modalImg.complete || modalImg.naturalWidth === 0) {
    modalImg.addEventListener('load', (e) => handleImageClick(modalImg, e), { once: true });
    return;
  }
  
  const imageWrapper = modalImg.parentElement;
  
  if (!imageWrapper || !modalImg.naturalWidth || !modalImg.naturalHeight) {
    return;
  }
  
  const rect = modalImg.getBoundingClientRect();
  let currentDisplayWidth = rect.width;
  
  if (scale > 1.01) {
    currentDisplayWidth = currentDisplayWidth / scale;
  }
  
  if (currentDisplayWidth === 0) {
    return;
  }
  
  const isZoomed = scale > 1.01;
  
  if (!isZoomed) {
    const targetScale = window.innerWidth / currentDisplayWidth;
    const imageRect = modalImg.getBoundingClientRect();
    
    scale = Math.max(1, targetScale);
    
    const imageCenterX = imageRect.left + imageRect.width / 2;
    const imageCenterY = imageRect.top + imageRect.height / 2;
    
    const scaledImageHeight = imageRect.height * scale;
    const topAfterScale = imageCenterY - scaledImageHeight / 2;
    
    moveY = -topAfterScale;
    moveX = 0;
    
    modalImg.style.transformOrigin = 'center center';
    
    imageWrapper.style.width = '100vw';
    imageWrapper.style.maxWidth = '100vw';
    
    const aspectRatio = modalImg.naturalHeight / modalImg.naturalWidth;
    const scaledHeight = window.innerWidth * aspectRatio;
    
    if (scaledHeight > window.innerHeight) {
      imageWrapper.style.height = '100vh';
      imageWrapper.style.overflowY = 'auto';
      imageWrapper.style.overflowX = 'hidden';
      setTimeout(() => {
        imageWrapper.scrollTop = 0;
      }, 0);
    } else {
      imageWrapper.style.height = 'auto';
      imageWrapper.style.overflowY = 'visible';
      imageWrapper.style.overflowX = 'visible';
    }
  } else {
    scale = 1;
    moveX = 0;
    moveY = 0;
    
    imageWrapper.style.width = '';
    imageWrapper.style.maxWidth = '';
    imageWrapper.style.height = '';
    imageWrapper.style.overflowY = '';
    imageWrapper.style.overflowX = '';
  }
  
  modalImg.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
  updateCursor(modalImg);
}

function resetImagePosition(modalImg) {
  scale = 1;
  moveX = 0;
  moveY = 0;
  modalImg.style.transform = `translate(0px, 0px) scale(1)`;
  modalImg.style.transformOrigin = '';
  modalImg.style.cursor = "zoom-in";
  
  const imageWrapper = modalImg.parentElement;
  if (imageWrapper && imageWrapper.classList.contains('modal-content-wrapper')) {
    imageWrapper.style.width = '';
    imageWrapper.style.maxWidth = '';
    imageWrapper.style.height = '';
    imageWrapper.style.overflowY = '';
    imageWrapper.style.overflowX = '';
  }
}

function updateCursor(modalImg) {
  modalImg.style.cursor = scale > 1 ? "zoom-out" : "zoom-in";
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
  
  scale = 1;
  moveX = 0;
  moveY = 0;
  
  document.body.style.overflow = "";
  
  modal.remove();
  
  const portal = document.getElementById('modal-portal');
  if (portal && portal.children.length === 0) {
    portal.style.pointerEvents = 'none';
  }
}

// Обновление года в копирайте
window.addEventListener("DOMContentLoaded", () => {
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});
