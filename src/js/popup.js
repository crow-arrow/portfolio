function hideRecaptchaBadge() {
  const badge = document.querySelector(".grecaptcha-badge");
  if (badge) {
    badge.style.display = "none";
  }
}

function createFormPortal() {
  let portal = document.getElementById('form-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'form-portal';
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

const openButton = document.querySelector("#open_pop_up");
const popup = document.querySelector(".pop_up");
const popupBody = document.querySelector(".pop_up_body");
const closeButton = document.querySelector(".pop_up_close");
const form = document.getElementById("form");

// Сохраняем исходный родительский элемент модалки
let originalParent = popup.parentNode;
let originalNextSibling = popup.nextSibling;
let scrollPosition = 0;

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.position = 'fixed';
  document.documentElement.style.top = `-${scrollPosition}px`;
  document.documentElement.style.left = '0';
  document.documentElement.style.right = '0';
  document.documentElement.style.width = '100%';
  
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
  document.documentElement.style.position = '';
  document.documentElement.style.top = '';
  document.documentElement.style.left = '';
  document.documentElement.style.right = '';
  document.documentElement.style.width = '';
  
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  
  window.scrollTo(0, scrollPosition);
}


openButton.addEventListener("click", (event) => {
  event.preventDefault();
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;
  
  const portal = createFormPortal();
  portal.style.pointerEvents = 'auto';
  portal.appendChild(popup);
  popup.classList.remove("hiden");
  
  lockScroll();
  portal.addEventListener("click", handlePortalClick);
});

function handlePortalClick(event) {
  if (event.target === popup || (!popupBody.contains(event.target) && event.target.closest('.pop_up_container'))) {
    const portal = document.getElementById('form-portal');
    if (portal) {
      portal.removeEventListener("click", handlePortalClick);
    }
    closePopup();
    
    form.reset();
    form.classList.remove("form-submitted");

    document
      .querySelectorAll(".textbox input, .textbox textarea")
      .forEach((input) => {
        input.classList.remove("invalid");
        input.style.border = "";
        const asterix = input.closest(".textbox").querySelector(".asterix");
        if (asterix) {
          asterix.style.opacity = "0";
          asterix.style.animation = "none";
        }
      });
  }
}

function closePopup() {
  popup.classList.add("hiden");
  unlockScroll();
  
  if (originalNextSibling) {
    originalParent.insertBefore(popup, originalNextSibling);
  } else {
    originalParent.appendChild(popup);
  }
  
  const portal = document.getElementById('form-portal');
  if (portal && portal.children.length === 0) {
    portal.style.pointerEvents = 'none';
  }
}

closeButton.addEventListener("click", () => {
  closePopup();

  form.reset();
  form.classList.remove("form-submitted");

  document
    .querySelectorAll(".textbox input, .textbox textarea")
    .forEach((input) => {
      input.classList.remove("invalid");
      input.style.border = "";
      const asterix = input.closest(".textbox").querySelector(".asterix");
      if (asterix) {
        asterix.style.opacity = "0";
        asterix.style.animation = "none";
      }
    });
});


document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !popup.classList.contains("hiden")) {
    closePopup();
    
    form.reset();
    form.classList.remove("form-submitted");

    document
      .querySelectorAll(".textbox input, .textbox textarea")
      .forEach((input) => {
        input.classList.remove("invalid");
        input.style.border = "";
        const asterix = input.closest(".textbox").querySelector(".asterix");
        if (asterix) {
          asterix.style.opacity = "0";
          asterix.style.animation = "none";
        }
      });
  }
});

document
  .querySelectorAll(".textbox input, .textbox textarea")
  .forEach((input) => {
    input.addEventListener("blur", function () {
      const isPhone = this.id === "phone";
      const isEmpty = this.value.trim() === "";
      const asterix = this.closest(".textbox").querySelector(".asterix");

      if (!isPhone && isEmpty) {
        this.classList.add("invalid");

        if (asterix) {
          asterix.style.opacity = "1";
          asterix.style.animation = "shake 0.3s 0s 3";
        }
      } else {
        this.classList.remove("invalid");
        if (asterix) {
          asterix.style.opacity = "0";
          asterix.style.animation = "none";
        }
      }
      if (this.checkValidity()) {
        this.style.border = "none";
      } else {
        this.style.border = "1px solid #df2666";
        this.style.animation = "shake 0.3s 0s 3";
      }
    });
  });

document
  .getElementById("form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const phoneRegex = /^\+([0-9]{1,4})?([0-9]{7,15})(?:\s?[0-9]{1,4})*$/;

    if (data.phone && !phoneRegex.test(data.phone)) {
      const phoneInput = document.getElementById("phone");
      phoneInput.classList.add("invalid");
      phoneInput.style.border = "1px solid #df2666";
      phoneInput.style.animation = "shake 0.3s 0s 3";
      const asterix = phoneInput.closest(".textbox").querySelector(".asterix");
      if (asterix) {
        asterix.style.opacity = "1";
        asterix.style.animation = "shake 0.3s 0s 3";
      }
      Toastify({
        text: "Phone number is invalid. It must start with '+' and contain 7-15 digits.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#df2666",
        style: {
          borderRadius: "10px"
        }
      }).showToast();
      return;
    }

    const submitButton = event.target.querySelector("button[type='submit']");

    const loader = document.createElement("div");
    loader.classList.add("spinner");

    submitButton.disabled = true;
    submitButton.innerHTML = "";
    submitButton.appendChild(loader);

    // Honeypot check
    const honeypot = document.getElementById("email_confirm")?.value;
    if (honeypot) {
      console.warn("Bot detected. Submission cancelled.");
      submitButton.disabled = false;
      submitButton.innerHTML = "Send message";
      return;
    }

    // reCAPTCHA check
    try {
      const siteKey = document.getElementById("recaptcha")?.dataset?.sitekey;
      if (!siteKey) {
        Toastify({
          text: "SiteKey not found",
          duration: 3000,
          gravity: "bottom",
          position: "right",
          backgroundColor: "#df2666",
          style: {
            borderRadius: "10px"
          }
        }).showToast();
        submitButton.disabled = false;
        submitButton.innerHTML = "Send message";
        return;
      }

      await new Promise((resolve) => {
        if (window.grecaptcha) return resolve();
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.onload = resolve;
        document.head.appendChild(script);
      });

      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: "submit" })
            .then(resolve)
            .catch(reject);
        });
      });

      data.token = token;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      submitButton.disabled = false;
      submitButton.innerHTML = "Send message";
      return;
    }

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error message sending");
      }

      Toastify({
        text: "Message sent successfully!",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#26dfae",
        style: {
          borderRadius: "10px"
        }
      }).showToast();

      event.target.reset();
      closePopup();
      hideRecaptchaBadge();
    } catch (error) {
      Toastify({
        text: "There was an error sending the message.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        backgroundColor: "#df2666",
        style: {
          borderRadius: "10px"
        }
      }).showToast();
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = "Send message";
    }
  });
