// FAQ page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check login status and update navbar
  checkLoginStatusAndUpdateNavbar();
  setupLogout();

  // Initialize the page
  initFaqPage();

  // Check for hash in URL to open specific tab
  if (window.location.hash) {
    const tabId = window.location.hash.substring(1);
    const tab = document.querySelector(`.nav-link[data-bs-target="#${tabId}"]`);
    if (tab) {
      const tabInstance = new bootstrap.Tab(tab);
      tabInstance.show();

      // Scroll to the tab after a short delay
      setTimeout(() => {
        document
          .querySelector(`#${tabId}`)
          .scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }

  // Handle accordion hash links
  handleAccordionHashLinks();
});

// Check login status and update navbar
function checkLoginStatusAndUpdateNavbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const authButtons = document.getElementById("authButtons");
  const userProfile = document.getElementById("userProfile");

  console.log("FAQ page: Checking login status:", isLoggedIn);

  if (isLoggedIn) {
    // User is logged in - hide auth buttons, show profile
    if (authButtons) authButtons.classList.add("d-none");
    if (userProfile) userProfile.classList.remove("d-none");

    // Get user data and update profile
    const userEmail = localStorage.getItem("userEmail");
    updateUserInfo(userEmail);
  } else {
    // User is not logged in - show auth buttons, hide profile
    if (authButtons) authButtons.classList.remove("d-none");
    if (userProfile) userProfile.classList.add("d-none");
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

function initFaqPage() {
  // Setup search functionality
  setupSearch();

  // Setup smooth scrolling for all anchor links
  setupSmoothScrolling();

  // Setup tab change handler
  setupTabChangeHandler();

  // Set up category tabs
  setupCategoryTabs();
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return; // Exit if element doesn't exist

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    const allQuestions = document.querySelectorAll(".accordion-item");

    // If search term is empty, show all questions in the active category
    if (searchTerm === "") {
      showQuestionsInActiveCategory();
      return;
    }

    // Hide all questions first
    allQuestions.forEach((item) => {
      item.style.display = "none";
    });

    // Show questions that match the search term
    allQuestions.forEach((item) => {
      const questionText = item
        .querySelector(".accordion-button")
        .textContent.toLowerCase();
      const answerText = item
        .querySelector(".accordion-body")
        .textContent.toLowerCase();

      if (
        questionText.includes(searchTerm) ||
        answerText.includes(searchTerm)
      ) {
        item.style.display = "block";
      }
    });
  });

  // Also handle the search button click
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", function () {
      // Trigger the search by manually firing input event
      const inputEvent = new Event("input", { bubbles: true });
      searchInput.dispatchEvent(inputEvent);
    });
  }
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

        // If it's an accordion item, open it
        const accordionButton = targetElement.querySelector(
          ".accordion-button.collapsed"
        );
        if (accordionButton) {
          accordionButton.click();
        }
      }
    });
  });
}

function setupTabChangeHandler() {
  // Update URL when tab changes
  const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabEls.forEach((tabEl) => {
    tabEl.addEventListener("shown.bs.tab", function (event) {
      const targetId = event.target.getAttribute("data-bs-target").substring(1);
      window.history.replaceState(null, null, `#${targetId}`);
    });
  });
}

function handleAccordionHashLinks() {
  // If URL has a hash referring to an accordion item, open it
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const targetAccordion = document.getElementById(hash);

    if (
      targetAccordion &&
      targetAccordion.classList.contains("accordion-collapse")
    ) {
      // First, ensure the correct tab is open
      const tabContent = targetAccordion.closest(".tab-pane");
      if (tabContent) {
        const tabId = tabContent.id;
        const tab = document.querySelector(
          `.nav-link[data-bs-target="#${tabId}"]`
        );
        if (tab) {
          const tabInstance = new bootstrap.Tab(tab);
          tabInstance.show();
        }
      }

      // Then open the accordion
      const accordion = new bootstrap.Collapse(targetAccordion, {
        toggle: false,
      });
      accordion.show();

      // Scroll to the accordion after a short delay
      setTimeout(() => {
        targetAccordion.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }
}

// Contact page redirect
document
  .querySelector(".contact-link")
  ?.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "contact.html";
  });

// Function to set up category tabs
function setupCategoryTabs() {
  const categoryTabs = document.querySelectorAll(
    ".category-tabs .list-group-item"
  );

  // Show first category questions by default
  showQuestionsInActiveCategory();

  // Add click event listener to each tab
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all tabs
      categoryTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Clear search input when changing categories
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.value = "";
      }

      // Show questions for the selected category
      showQuestionsInActiveCategory();
    });
  });
}

// Helper function to show questions in the active category
function showQuestionsInActiveCategory() {
  // Find the active category
  const activeTab = document.querySelector(
    ".category-tabs .list-group-item.active"
  );
  if (!activeTab) return;

  const categoryId = activeTab.getAttribute("data-target");

  // Hide all questions first
  const allQuestions = document.querySelectorAll(".accordion-item");
  allQuestions.forEach((item) => {
    item.style.display = "none";
  });

  // Show questions for the active category
  const categoryQuestions = document.querySelectorAll(
    `#${categoryId} .accordion-item`
  );
  categoryQuestions.forEach((item) => {
    item.style.display = "block";
  });
}

// Function to set up logout functionality
function setupLogout() {
  // Add logout functionality to all logout links with data-action="logout"
  document.querySelectorAll('a[data-action="logout"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Implement logout logic
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("adminLoggedIn");

      // Update navbar
      checkLoginStatusAndUpdateNavbar();

      // Show success message
      if (typeof showToast === "function") {
        showToast("Logged out successfully", "success");
      }

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    });
  });
}
