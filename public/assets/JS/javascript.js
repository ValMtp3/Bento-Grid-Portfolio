document.addEventListener("DOMContentLoaded", function () {
  const backToTopButton = document.getElementById("back-to-top-btn");


  window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
      backToTopButton.classList.remove("hidden");
    } else {
      backToTopButton.classList.add("hidden");
    }
  });

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  if (!localStorage.getItem("cookiesAccepted")) {
    document.getElementById("cookie-banner").style.display = "block";
  }

  document.getElementById("accept-cookies").addEventListener("click", function () {
    localStorage.setItem("cookiesAccepted", "true");
    document.getElementById("cookie-banner").style.display = "none";
    enableCookies();
  });

  document.getElementById("decline-cookies").addEventListener("click", function () {
    localStorage.setItem("cookiesAccepted", "false");
    document.getElementById("cookie-banner").style.display = "none";
    disableCookies();
  });

  function enableCookies() {
    if (window.__cfBeacon && typeof window.__cfBeacon.enabled !== "undefined") {
      window.__cfBeacon.enabled = true;
    }
  }

  function disableCookies() {
    if (window.__cfBeacon && typeof window.__cfBeacon.enabled !== "undefined") {
      window.__cfBeacon.enabled = false;
    }

    document.cookie = "__cf_bm=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

});

