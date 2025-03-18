const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const openButton = document.querySelector("#open_pop_up");
const popup = document.querySelector(".pop_up");
const popupBody = document.querySelector(".pop_up_body");
const closeButton = document.querySelector(".pop_up_close");
const form = document.getElementById("form");

openButton.addEventListener("click", (event) => {
  event.preventDefault();
  popup.classList.remove("hiden");
});

closeButton.addEventListener("click", () => {
  popup.classList.add("hiden");

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
        backgroundColor: "#26dfae",
      }).showToast();

      event.target.reset();
      popup.classList.add("hiden");
    } catch (error) {
      Toastify({
        text: "There was an error sending the message.",
        duration: 3000,
        backgroundColor: "#df2666",
      }).showToast();
    }
  });
