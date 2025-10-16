function toggleMenu() {
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.getElementById('navMenu');
  if(hamburger && navMenu && !hamburger.contains(event.target) && !navMenu
    .contains(event.target)) {
    navMenu.classList.remove('active');
  }
});
