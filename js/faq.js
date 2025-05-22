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
    const tabPanes = document.querySelectorAll(".tab-pane");

    // If search term is empty, restore original content and show active category
    if (searchTerm === "") {
      // Restore any original content that was replaced with "no results" message
      restoreOriginalContent();
      // Remove search-match class from all tabs
      document
        .querySelectorAll(".category-tabs .list-group-item")
        .forEach((tab) => {
          tab.classList.remove("search-match");
        });
      // Show the active category
      showQuestionsInActiveCategory();
      return;
    }

    // Reset all tab panes to be hidden
    tabPanes.forEach((pane) => {
      pane.classList.remove("show", "active");
    });

    // Track if we have found any matches
    let hasMatches = false;
    // Track which tabs have matching content
    const tabsWithMatches = new Set();

    // Check each question for matches
    allQuestions.forEach((item) => {
      const questionButton = item.querySelector(".accordion-button");
      const answerBody = item.querySelector(".accordion-body");

      const questionText = questionButton.textContent.toLowerCase();
      const answerText = answerBody.textContent.toLowerCase();

      // Check if this question matches the search
      const isMatch =
        questionText.includes(searchTerm) || answerText.includes(searchTerm);

      // Set display based on match
      item.style.display = isMatch ? "block" : "none";

      if (isMatch) {
        hasMatches = true;

        // Find the tab pane that contains this question
        const parentTabPane = item.closest(".tab-pane");
        if (parentTabPane) {
          // Add this tab to our set of tabs with matches
          tabsWithMatches.add(parentTabPane.id);

          // Make the tab pane visible
          parentTabPane.classList.add("show", "active");
        }

        // Highlight the matched text
        highlightMatches(questionButton, searchTerm);
        highlightMatches(answerBody, searchTerm);

        // Expand the accordion item
        const collapseElement = item.querySelector(".accordion-collapse");
        if (
          collapseElement &&
          collapseElement.classList.contains("collapse") &&
          !collapseElement.classList.contains("show")
        ) {
          new bootstrap.Collapse(collapseElement, { toggle: true });
        }
      } else {
        // Remove any existing highlights
        removeHighlights(questionButton);
        removeHighlights(answerBody);
      }
    });

    // If we have matches, update the category tabs to show which tab is active
    if (hasMatches) {
      // Update category tabs to highlight tabs with matches
      const categoryTabs = document.querySelectorAll(
        ".category-tabs .list-group-item"
      );
      categoryTabs.forEach((tab) => {
        const tabTarget = tab.getAttribute("data-target");

        // If this tab has matches, highlight it
        if (tabsWithMatches.has(tabTarget)) {
          tab.classList.add("search-match");
        } else {
          tab.classList.remove("search-match");
        }

        // Remove active class from all tabs during search
        tab.classList.remove("active");
      });

      // If we only have matches in one tab, mark that tab as active
      if (tabsWithMatches.size === 1) {
        const activeTabId = Array.from(tabsWithMatches)[0];
        const activeTab = document.querySelector(
          `.category-tabs .list-group-item[data-target="${activeTabId}"]`
        );
        if (activeTab) {
          activeTab.classList.add("active");
        }
      }
    } else {
      // If no matches, show a "no results" message
      showNoResultsMessage();
    }
  });

  // Handle the search button click
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

  // Hide all tab panes first
  const tabPanes = document.querySelectorAll(".tab-pane");
  tabPanes.forEach((pane) => {
    pane.classList.remove("show", "active");
  });

  // Show the selected tab pane
  const activePane = document.getElementById(categoryId);
  if (activePane) {
    activePane.classList.add("show", "active");
  }

  // Ensure all questions in the active tab are visible
  const activeQuestions = document.querySelectorAll(
    `#${categoryId} .accordion-item`
  );
  activeQuestions.forEach((item) => {
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

// Helper function to show a "no results" message
function showNoResultsMessage() {
  // Find the first tab pane and make it active
  const firstTabPane = document.querySelector(".tab-pane");
  if (firstTabPane) {
    firstTabPane.classList.add("show", "active");

    // Clear its contents and add a no results message
    const accordionContainer = firstTabPane.querySelector(".accordion");
    if (accordionContainer) {
      // Store original content to restore later
      if (!accordionContainer.hasAttribute("data-original-content")) {
        accordionContainer.setAttribute(
          "data-original-content",
          accordionContainer.innerHTML
        );
      }

      // Show no results message
      accordionContainer.innerHTML = `
        <div class="no-results-message">
          <i class="fas fa-search"></i>
          <h4>No results found</h4>
          <p>We couldn't find any matches for your search. Please try different keywords or check the spelling.</p>
        </div>
      `;
    }
  }
}

// Helper function to restore original content after searching
function restoreOriginalContent() {
  // Find all accordions that might have been modified
  document.querySelectorAll(".accordion").forEach((accordion) => {
    if (accordion.hasAttribute("data-original-content")) {
      // Restore the original content
      accordion.innerHTML = accordion.getAttribute("data-original-content");
      // Remove the stored content attribute
      accordion.removeAttribute("data-original-content");
    }
  });
}

// Helper function to highlight matched text
function highlightMatches(element, searchTerm) {
  if (!element) return;

  // Store original text if we haven't already
  if (!element.hasAttribute("data-original-text")) {
    element.setAttribute("data-original-text", element.innerHTML);
  }

  const originalText = element.getAttribute("data-original-text");
  const textContent = originalText;

  // Create a case-insensitive regex for the search term
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");

  // Replace with highlighted version
  const highlightedText = textContent.replace(
    regex,
    '<span class="highlight">$1</span>'
  );

  // Set the highlighted HTML
  element.innerHTML = highlightedText;
}

// Helper function to remove highlights
function removeHighlights(element) {
  if (!element) return;

  // Restore original text if we have it stored
  if (element.hasAttribute("data-original-text")) {
    element.innerHTML = element.getAttribute("data-original-text");
  }
}

// Helper function to escape special characters in regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
