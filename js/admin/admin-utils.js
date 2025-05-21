// Utility Functions

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-menu a[data-section]");
  const sections = document.querySelectorAll(".content-section");
  const pageTitle = document.getElementById("pageTitle");

  console.log("Setting up navigation with links:", navLinks.length, "and sections:", sections.length);

  // Map available sections for debugging
  const availableSections = Array.from(sections).map(section => section.id);
  console.log("Available sections:", availableSections);
  
  // Add a helper class to make navigation links more visible
  navLinks.forEach(link => {
    link.classList.add('nav-link-interactive');
  });

  navLinks.forEach((link) => {
    const sectionId = link.getAttribute("data-section");
    console.log("Setting up listener for:", sectionId);
    
    // Check if the target section exists
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (!targetSection) {
      console.warn(`Warning: Target section "${sectionId}Section" not found in the DOM`);
    }

    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling

      const sectionId = this.getAttribute("data-section");
      console.log("Navigation clicked:", sectionId);

      // Update active link with visual feedback
      navLinks.forEach((link) => {
        link.classList.remove("active");
        link.classList.remove("pulse-animation"); // Remove any existing animations
      });
      this.classList.add("active");
      this.classList.add("pulse-animation"); // Add a subtle animation for feedback
      
      // Update URL hash for better navigation (allows browser back button)
      window.location.hash = sectionId;

      // Show selected section
      let sectionFound = false;
      sections.forEach((section) => {
        if (section.id === `${sectionId}Section`) {
          section.classList.remove("d-none");
          console.log("Showing section:", section.id);
          sectionFound = true;

          // Add animation class for smooth transition
          section.classList.add("section-fade-in");
          setTimeout(() => {
            section.classList.remove("section-fade-in");
          }, 500);

          // Update page title
          if (pageTitle) {
            pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
          }

          // If quotes section is shown, refresh the quotes table
          if (sectionId === "quotes") {
            console.log("Refreshing quotes data");
            loadAllQuotes();
          }
          
          // If users section is shown, refresh the users table
          if (sectionId === "users") {
            console.log("Refreshing users data");
            loadUsers();
          }
          
          // If inventory section is shown, refresh the inventory data
          if (sectionId === "inventory") {
            console.log("Refreshing inventory data");
            loadInventory();
          }

          // If vouchers section is shown, refresh the vouchers table
          if (sectionId === "vouchers") {
            if (typeof renderVouchersTable === 'function') {
              setTimeout(() => {
                renderVouchersTable();
              }, 100);
            }
          }
        } else {
          section.classList.add("d-none");
        }
      });
      
      if (!sectionFound) {
        console.error(`Error: Section "${sectionId}Section" not found`);
        // Fallback to dashboard
        const dashboardSection = document.getElementById("dashboardSection");
        if (dashboardSection) {
          dashboardSection.classList.remove("d-none");
          if (pageTitle) {
            pageTitle.textContent = "Dashboard";
          }
        }
      }
    });
  });

  // Handle "View All" button for quotes
  const viewAllQuotesBtn = document.getElementById("viewAllQuotesBtn");
  if (viewAllQuotesBtn) {
    viewAllQuotesBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Find and click the quotes navigation link
      const quotesLink = document.querySelector(
        '.sidebar-menu a[data-section="quotes"]'
      );
      if (quotesLink) {
        quotesLink.click();
        console.log("Navigated to quotes section via View All button");
      } else {
        console.error("Quotes navigation link not found");
      }
    });
  }

  // Check for URL hash to determine initial section
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1); // Remove the # character
    const sectionLink = document.querySelector(`.sidebar-menu a[data-section="${sectionId}"]`);
    if (sectionLink) {
      console.log("Loading section from URL hash:", sectionId);
      sectionLink.click();
      return;
    }
  }

  // Initialize with dashboard section visible if no section is active
  const hasActiveSection = Array.from(navLinks).some((link) =>
    link.classList.contains("active")
  );
  if (!hasActiveSection && navLinks.length > 0) {
    console.log("No active section found, defaulting to dashboard");
    navLinks[0].click();
  }
}

// Function to enlarge an image in a modal view
function enlargeImage(imageSrc) {
  // Create a fullscreen modal
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';
  modal.style.cursor = 'zoom-out';

  // Create the enlarged image
  const img = document.createElement('img');
  img.src = imageSrc;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.objectFit = 'contain';
  img.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.5)';
  img.style.transition = 'transform 0.3s ease';
  
  // Add a subtle animation
  img.style.transform = 'scale(0.9)';
  setTimeout(() => {
    img.style.transform = 'scale(1)';
  }, 10);

  // Add a close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '20px';
  closeBtn.style.fontSize = '30px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'white';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.transition = 'background 0.3s ease';
  
  closeBtn.addEventListener('mouseover', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
  });
  
  closeBtn.addEventListener('mouseout', () => {
    closeBtn.style.background = 'transparent';
  });

  // Handle closing the modal
  const closeModal = () => {
    img.style.transform = 'scale(0.9)';
    modal.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', closeModal);
  
  // Prevent closing when clicking on the image itself
  img.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Add elements to DOM
  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
  
  // Add fade-in animation
  modal.style.opacity = '0';
  modal.style.transition = 'opacity 0.3s ease';
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
}

// Function to animate counter
function animateCounter(element, start, end) {
  // Check if element exists
  if (!element) {
    console.warn("animateCounter: Element not found");
    return;
  }
  
  // Check for invalid input
  if (end === undefined || end === null || isNaN(end)) {
    console.warn("animateCounter: Invalid end value", end);
    end = 0;
  }
  
  // Make sure start and end are numbers
  start = Number(start) || 0;
  end = Number(end) || 0;
  
  // Log the counter animation being started
  console.log(`Animating counter from ${start} to ${end} for element:`, element.id || element);
  
  // Reset the counter to start value immediately
  element.textContent = start.toLocaleString();
  
  // Add animation class
  element.classList.add('animate-count');
  
  // Don't animate if start and end are the same
  if (start === end) {
    element.textContent = end.toLocaleString();
    return;
  }
  
  // Calculate increment based on the size of the number
  let duration = 1200; // Animation duration in ms
  let steps = 30; // Number of steps
  let increment = Math.max(1, Math.floor((end - start) / steps));
  
  // Start at initial value
  let current = start;
  
  // For small numbers, use a different approach
  if (end <= 10) {
    steps = end;
    increment = 1;
  }
  
  // For large numbers, make sure we have enough steps
  if (end - start > 1000) {
    increment = Math.max(1, Math.floor((end - start) / 40));
  }
  
  // Set up the animation interval
  const timer = setInterval(() => {
    current += increment;
    
    // Make sure we don't go past the end value
    if (current >= end) {
      clearInterval(timer);
      current = end;
      
      // Add a final "pop" effect when counter finishes
      element.style.animation = 'none';
      element.offsetHeight; // Trigger reflow
      element.style.animation = 'countUp 0.3s ease forwards';
      console.log(`Counter animation completed for ${element.id || element}: ${end}`);
    }
    
    // Update the display with thousands separators
    element.textContent = current.toLocaleString();
  }, duration / steps);
}

// Get initials from first and last name
function getInitialsFromName(firstName, lastName) {
  if (!firstName && !lastName) return "U";
  
  let initials = "";
  if (firstName) initials += firstName.charAt(0).toUpperCase();
  if (lastName) initials += lastName.charAt(0).toUpperCase();
  
  return initials || "U";
}

// Export functions
window.setupNavigation = setupNavigation;
window.enlargeImage = enlargeImage;
window.animateCounter = animateCounter;
window.getInitialsFromName = getInitialsFromName; 