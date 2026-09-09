import en from "../i18n/en.json";
import de from "../i18n/de.json";

const dictionaries = { en, de };
const STORAGE_KEY = "portfolio-lang";

let currentLocale = "en";

export function t(path) {
  const dict = dictionaries[currentLocale] || dictionaries.en;
  return path.split(".").reduce((value, key) => value?.[key], dict) ?? path;
}

export function getLocale() {
  return currentLocale;
}

function detectLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "de") return stored;

  const browser = navigator.language?.toLowerCase() || "";
  return browser.startsWith("de") ? "de" : "en";
}

function applyMeta() {
  document.title = t("meta.title");

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("meta.description"));

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", t("meta.title"));

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", t("meta.ogDescription"));

  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute("content", t("meta.title"));

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) twitterDescription.setAttribute("content", t("meta.ogDescription"));
}

function applyCvLink() {
  const link = document.querySelector("[data-cv-link]");
  if (!link) return;

  link.setAttribute("href", `/api/cv?lang=${currentLocale}`);
  link.removeAttribute("download");
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
}

function applyTranslations() {
  document.documentElement.lang = currentLocale;
  applyMeta();
  applyCvLink();

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", t(element.dataset.i18nAlt));
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  document.querySelectorAll(".lang-switch").forEach((element) => {
    element.dataset.locale = currentLocale;
  });

  document.querySelectorAll(".lang-switch__btn").forEach((button) => {
    const isActive = button.dataset.lang === currentLocale;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

export function setLocale(locale) {
  if (!dictionaries[locale]) return;

  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  applyTranslations();
  document.dispatchEvent(new CustomEvent("localechange", { detail: { locale } }));
}

export function initI18n() {
  currentLocale = detectLocale();
  applyTranslations();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".lang-switch__btn");
  if (!button?.dataset.lang) return;
  setLocale(button.dataset.lang);
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initI18n);
} else {
  initI18n();
}
