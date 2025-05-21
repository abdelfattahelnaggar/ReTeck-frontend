// Initialize counters for stats
function initJourneyStats() {
  const stats = document.querySelectorAll(".journey-stat-number");

  if (stats.length === 0) return;

  stats.forEach((stat) => {
    const target = parseInt(stat.getAttribute("data-count"));
    const duration = 2000; // 2 seconds
    const step = Math.ceil(target / (duration / 20)); // Update every 20ms
    let current = 0;

    const counter = setInterval(() => {
      current += step;
      if (current >= target) {
        stat.textContent = target;
        clearInterval(counter);
      } else {
        stat.textContent = current;
      }
    }, 20);
  });
}

// Initialize impact stats counters
function initImpactStats() {
  const stats = document.querySelectorAll(".impact-stat-number");

  if (stats.length === 0) return;

  stats.forEach((stat) => {
    const target = parseInt(stat.parentElement.getAttribute("data-count"));
    const duration = 2500; // 2.5 seconds
    const step = Math.ceil(target / (duration / 20)); // Update every 20ms
    let current = 0;

    const counter = setInterval(() => {
      current += step;
      if (current >= target) {
        stat.textContent = target.toLocaleString();
        clearInterval(counter);
      } else {
        stat.textContent = current.toLocaleString();
      }
    }, 20);
  });
}

// Animate timeline items when they come into view
function initTimelineAnimation() {
  const timelineItems = document.querySelectorAll(".timeline-item");

  if (timelineItems.length === 0) return;

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const item = entry.target;
        item.classList.add("animated");
        // Stop observing after animation
        observer.unobserve(item);
      }
    });
  }, options);

  // Start observing items
  timelineItems.forEach((item) => {
    observer.observe(item);
  });
}

// Initialize AOS animations
function initAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
}

// Initialize journey stats counter when they come into view
function initJourneyStatsObserver() {
  const statsContainer = document.querySelector(".journey-stats");

  if (!statsContainer) return;

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        initJourneyStats();
        // Stop observing after triggering once
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Start observing the stats container
  observer.observe(statsContainer);
}

// Initialize impact stats counter when they come into view
function initImpactStatsObserver() {
  const stats = document.querySelectorAll(".impact-stat");

  if (stats.length === 0) return;

  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        initImpactStats();
        // Stop observing after triggering once
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Start observing the first stat (will trigger all stats)
  if (stats.length > 0) {
    observer.observe(stats[0]);
  }
}

// Initialize counter in CTA section
function initCtaCounter() {
  const ctaCounter = document.getElementById("ctaCounter");

  if (!ctaCounter) return;

  // Only animate when in view
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const finalValue = 15000;
        const duration = 2000; // 2 seconds
        let startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const percentage = Math.min(progress / duration, 1);
          const value = Math.floor(percentage * finalValue);

          ctaCounter.textContent = value.toLocaleString() + "+";

          if (percentage < 1) {
            requestAnimationFrame(animate);
          }
        }

        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  observer.observe(ctaCounter);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Check login status and update navbar
  checkLoginStatusAndUpdateNavbar();

  // Initialize AOS animations
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }

  // Call initialization functions
  initTimelineAnimation();
  initJourneyStatsObserver();
  initImpactStatsObserver();
  initCtaCounter();

  // Add hover effect to journey stats
  const journeyStats = document.querySelectorAll(".journey-stat");
  journeyStats.forEach((stat) => {
    stat.addEventListener("mouseenter", function () {
      this.querySelector(".journey-stat-icon").style.transform = "scale(1.1)";
    });

    stat.addEventListener("mouseleave", function () {
      this.querySelector(".journey-stat-icon").style.transform = "scale(1)";
    });
  });

  // Add functionality for animated counters
  const counters = document.querySelectorAll(".counter");

  // Set up intersection observer for counter animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"));
          let count = 0;
          const speed = 50; // Lower is faster

          // Only animate once
          if (!counter.classList.contains("animated")) {
            counter.classList.add("animated");

            const updateCount = () => {
              const increment = target / (2000 / speed); // Smooth increment
              count += increment;

              if (count < target) {
                counter.innerText = Math.ceil(count).toLocaleString();
                setTimeout(updateCount, speed);
              } else {
                counter.innerText = target.toLocaleString();
              }
            };

            updateCount();
          }
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  // Observe all counter elements
  counters.forEach((counter) => {
    observer.observe(counter);
  });
});

// Check login status and update navbar
function checkLoginStatusAndUpdateNavbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");
  const pointsDisplay = document.querySelector(".points-display-navbar");

  console.log("About page: Checking login status:", isLoggedIn);

  if (isLoggedIn) {
    // User is logged in - hide auth buttons, show profile
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) userProfile.classList.remove("d-none");

    // Show points display
    if (pointsDisplay) {
      pointsDisplay.classList.remove("d-none");
      pointsDisplay.style.display = "block";
    }

    // Get user data and update profile
    const userEmail = localStorage.getItem("userEmail");
    updateUserInfo(userEmail);

    // Update points display
    updatePointsDisplay(userEmail);
  } else {
    // User is not logged in - show auth buttons, hide profile
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");

    // Hide points display
    if (pointsDisplay) {
      pointsDisplay.classList.add("d-none");
    }
  }
}

// Update user information in the navbar
function updateUserInfo(email) {
  if (!email) return;

  // Get user data
  let userData = null;

  // Try to get from users object
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  userData = users[email];

  // Also check userData_{email} format
  const userDataById = JSON.parse(
    localStorage.getItem(`userData_${email}`) || "{}"
  );

  if (userDataById) {
    userData = { ...userData, ...userDataById };
  }

  if (!userData) return;

  // Get profile data
  const profile = userData.profile || {};
  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];

  // Update user name elements
  const userName = document.getElementById("userName");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserEmail = document.getElementById("dropdownUserEmail");

  if (userName) userName.textContent = fullName;
  if (dropdownUserName) dropdownUserName.textContent = fullName;
  if (dropdownUserEmail) dropdownUserEmail.textContent = email;

  // Get user initials or profile image
  const profileImage = profile.profileImage;
  const userAvatarSmall = document.querySelector(".user-avatar-small");
  const userDropdownAvatar = document.querySelector(".user-dropdown-avatar");

  if (profileImage) {
    // If user has a profile image
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<img src="${profileImage}" alt="${fullName}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">`;
    }
    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `<img src="${profileImage}" alt="${fullName}" class="rounded-circle" style="width: 48px; height: 48px; object-fit: cover;">`;
    }
  } else {
    // If no profile image, show initials
    const initials = getInitials(firstName, lastName);
    if (userAvatarSmall) {
      userAvatarSmall.innerHTML = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 14px;">${initials}</div>`;
    }
    if (userDropdownAvatar) {
      userDropdownAvatar.innerHTML = `<div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 18px;">${initials}</div>`;
    }
  }
}

// Get user initials
function getInitials(firstName, lastName) {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return firstInitial + lastInitial || "U";
}

// Update points display in navbar
function updatePointsDisplay(email) {
  if (!email) return;

  const pointsDisplay = document.querySelector(".points-display-navbar");
  const pointsValue = document.getElementById("navbarPoints");

  if (!pointsDisplay || !pointsValue) return;

  try {
    // Try to get user data from localStorage
    let userData = null;

    // Try user-specific data first
    userData = JSON.parse(localStorage.getItem(`userData_${email}`) || "{}");

    // If no user-specific data, try users object
    if (Object.keys(userData).length === 0) {
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      userData = users[email] || {};
    }

    // Update points value if user data exists
    if (userData && userData.profile) {
      pointsValue.textContent = userData.profile.points || 0;
    }

    // Make sure points display is visible
    pointsDisplay.classList.remove("d-none");
    pointsDisplay.style.display = "block";

    // Make points display clickable
    if (!pointsDisplay.hasAttribute("data-click-initialized")) {
      pointsDisplay.style.cursor = "pointer";
      pointsDisplay.addEventListener("click", function () {
        window.location.href = "profile.html";
      });
      pointsDisplay.setAttribute("data-click-initialized", "true");
    }
  } catch (error) {
    console.error("Error updating points display:", error);
  }
}
