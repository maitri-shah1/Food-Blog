// home - baner
  const images = [
    "images/banner-1.jpg",
    "images/banner-2.jpg",
    "images/banner-3.jpg",
    "images/banner-4.jpg",
    "images/banner-5.jpg"
  ];

  let currentImageIndex = 0;
  const rotatingImage = document.getElementById("rotating-image");

  setInterval(() => {
    currentImageIndex = (currentImageIndex + 1) % images.length; // Loop through images
    rotatingImage.src = images[currentImageIndex]; // Change the image source
  }, 2500); 


  