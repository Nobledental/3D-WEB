// MOBILE MENU
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

menuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("active");
});

// HEADER HIDE ON SCROLL
let prevScroll = window.pageYOffset;

window.addEventListener("scroll", () => {
  let current = window.pageYOffset;
  const header = document.getElementById("hfHeader");

  if (prevScroll > current) {
    header.style.top = "0";
  } else {
    header.style.top = "-120px";
  }

  prevScroll = current;
});
