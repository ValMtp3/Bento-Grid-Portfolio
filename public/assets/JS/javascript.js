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
});