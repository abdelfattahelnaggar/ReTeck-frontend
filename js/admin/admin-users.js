// Admin Users Management Functions

// Load users data for the users section
function loadUsers() {
  console.log("Loading users data...");
  
  const tableBody = document.getElementById("usersTableBody");
  if (!tableBody) {
    console.error("usersTableBody element not found!");
    return;
  }

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get list of dummy users
  const users = getDummyUsers();
  console.log("Retrieved", users.length, "users");
  
  // Get all inventory devices
  const allDevices = getDummyDevices ? getDummyDevices() : [];
  console.log("Retrieved", allDevices.length, "devices for user stats");

  // Add users to table
  users.forEach((user) => {
    const row = document.createElement("tr");

    // User info cell
    const userInfoCell = document.createElement("td");
    userInfoCell.className = "user-row-info";

    // Avatar
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "user-avatar";
    
    if (user.profileImage) {
      avatarDiv.innerHTML = `<img src="${user.profileImage}" alt="${user.name}" class="rounded-circle" width="40" height="40">`;
    } else {
      const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
      avatarDiv.innerHTML = `
        <div class="avatar-text">${initials}</div>
        <div class="avatar-shine"></div>
      `;
    }
    
    // User name and email
    const userNameInfo = document.createElement("div");
    userNameInfo.className = "user-name-info";
    
    const userName = document.createElement("div");
    userName.className = "user-display-name";
    userName.textContent = `${user.firstName} ${user.lastName}`;
    
    const userEmail = document.createElement("div");
    userEmail.className = "user-email";
    userEmail.textContent = user.email;
    
    userNameInfo.appendChild(userName);
    userNameInfo.appendChild(userEmail);
    
    userInfoCell.appendChild(avatarDiv);
    userInfoCell.appendChild(userNameInfo);
    row.appendChild(userInfoCell);

    // Recycled devices cell
    const recycledCell = document.createElement("td");
    const recycledCount = document.createElement("span");
    recycledCount.className = "recycled-count";
    recycledCount.textContent = user.recycledDevices || 0;
    recycledCell.appendChild(recycledCount);
    row.appendChild(recycledCell);

    // Role cell
    const roleCell = document.createElement("td");
    const roleBadge = document.createElement("span");
    roleBadge.className = `user-role ${user.role.toLowerCase()}`;
    roleBadge.textContent = user.role === "admin" ? "Admin" : "Customer";
    roleCell.appendChild(roleBadge);
    row.appendChild(roleCell);

    // Requests cell
    const requestsCell = document.createElement("td");
    const requestsCount = document.createElement("span");
    requestsCount.className = "recycled-count";
    requestsCount.textContent = user.requestsCount || 0;
    requestsCell.appendChild(requestsCount);
    row.appendChild(requestsCell);

    // Points cell
    const pointsCell = document.createElement("td");
    const pointsCount = document.createElement("span");
    pointsCount.className = "user-points";
    pointsCount.innerHTML = `<i class="fas fa-coins me-1"></i>${user.points.toLocaleString()}`;
    pointsCell.appendChild(pointsCount);
    row.appendChild(pointsCell);

    // Actions cell
    const actionsCell = document.createElement("td");
    actionsCell.className = "actions-cell";

    // View details button
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn-user-action view-action";
    viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    viewBtn.setAttribute("data-bs-toggle", "tooltip");
    viewBtn.setAttribute("title", "View Details");
    viewBtn.addEventListener("click", () => viewUserDetails(user.email));
    actionsCell.appendChild(viewBtn);

    // Message button
    const messageBtn = document.createElement("button");
    messageBtn.className = "btn-user-action message-action";
    messageBtn.innerHTML = '<i class="fas fa-envelope"></i>';
    messageBtn.setAttribute("data-bs-toggle", "tooltip");
    messageBtn.setAttribute("title", "Send Message");
    messageBtn.addEventListener("click", () => messageUser(user.email));
    actionsCell.appendChild(messageBtn);

    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });

  // Initialize tooltips
  if (typeof bootstrap !== "undefined") {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Calculate user stats from user data
  const activeUsers = users.filter(u => u.role !== "admin" && u.status === "active").length;
  
  // Calculate stats from inventory data
  const totalDevices = allDevices.length;
  
  // Calculate total points from all devices
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);
  
  // Update dashboard stats with values from both users and inventory
  updateUserStats(activeUsers, totalPoints, totalDevices);
}

// Get dummy users data for testing
function getDummyUsers() {
  return [
    {
      id: "USR12345",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "customer",
      recycledDevices: 3,
      requestsCount: 5,
      points: 2800,
      joinDate: "2023-05-12T09:30:00",
      lastActive: "2023-09-10T14:45:00",
      status: "active",
      address: "123 Main Street, San Francisco, CA 94105",
      phone: "415-555-1234",
      profileImage: "https://placehold.co/400x400?text=JD"
    },
    {
      id: "USR12346",
      firstName: "Sarah",
      lastName: "Miller",
      email: "sarah.miller@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 1200,
      joinDate: "2023-06-18T11:15:00",
      lastActive: "2023-09-08T10:30:00",
      status: "active",
      address: "456 Oak Avenue, Seattle, WA 98101",
      phone: "206-555-5678"
    },
    {
      id: "USR12347",
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      role: "customer",
      recycledDevices: 2,
      requestsCount: 3,
      points: 2200,
      joinDate: "2023-04-22T15:45:00",
      lastActive: "2023-09-05T16:20:00",
      status: "active",
      address: "789 Pine Street, Chicago, IL 60601",
      phone: "312-555-9012",
      profileImage: "https://placehold.co/400x400?text=DW"
    },
    {
      id: "USR12348",
      firstName: "Emily",
      lastName: "Johnson",
      email: "emily.johnson@example.com",
      role: "customer",
      recycledDevices: 4,
      requestsCount: 6,
      points: 4100,
      joinDate: "2023-02-14T08:50:00",
      lastActive: "2023-09-09T13:15:00",
      status: "active",
      address: "321 Elm Street, Austin, TX 78701",
      phone: "512-555-3456"
    },
    {
      id: "USR12349",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 900,
      joinDate: "2023-07-30T14:20:00",
      lastActive: "2023-09-01T11:40:00",
      status: "active",
      address: "654 Maple Avenue, Boston, MA 02108",
      phone: "617-555-7890"
    },
    {
      id: "USR12350",
      firstName: "Jennifer",
      lastName: "Davis",
      email: "jennifer.davis@example.com",
      role: "customer",
      recycledDevices: 0,
      requestsCount: 1,
      points: 0,
      joinDate: "2023-08-29T09:10:00",
      lastActive: "2023-08-29T15:35:00",
      status: "active",
      address: "987 Cedar Road, Denver, CO 80202",
      phone: "303-555-2345",
      profileImage: "https://placehold.co/400x400?text=JD"
    },
    {
      id: "USR12351",
      firstName: "Robert",
      lastName: "Taylor",
      email: "robert.taylor@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 1,
      points: 500,
      joinDate: "2023-08-15T10:30:00",
      lastActive: "2023-08-27T12:45:00",
      status: "active",
      address: "753 Birch Street, Portland, OR 97201",
      phone: "503-555-6789"
    },
    {
      id: "USR12352",
      firstName: "Lisa",
      lastName: "Martinez",
      email: "lisa.martinez@example.com",
      role: "customer",
      recycledDevices: 0,
      requestsCount: 1,
      points: 0,
      joinDate: "2023-08-20T13:25:00",
      lastActive: "2023-08-25T16:50:00",
      status: "inactive",
      address: "246 Spruce Lane, Miami, FL 33101",
      phone: "305-555-0123"
    },
    {
      id: "USR12353",
      firstName: "Kevin",
      lastName: "Anderson",
      email: "kevin.anderson@example.com",
      role: "customer",
      recycledDevices: 2,
      requestsCount: 3,
      points: 3500,
      joinDate: "2023-05-05T11:20:00",
      lastActive: "2023-08-30T09:15:00",
      status: "active",
      address: "135 Aspen Court, Nashville, TN 37201",
      phone: "615-555-4567",
      profileImage: "https://placehold.co/400x400?text=KA"
    },
    {
      id: "USR12354",
      firstName: "Patricia",
      lastName: "White",
      email: "patricia.white@example.com",
      role: "customer",
      recycledDevices: 1,
      requestsCount: 2,
      points: 900,
      joinDate: "2023-07-12T14:10:00",
      lastActive: "2023-08-21T13:40:00",
      status: "active",
      address: "864 Redwood Drive, San Diego, CA 92101",
      phone: "619-555-8901"
    },
    {
      id: "USR12355",
      firstName: "Admin",
      lastName: "User",
      email: "admin@retech.com",
      role: "admin",
      recycledDevices: 0,
      requestsCount: 0,
      points: 0,
      joinDate: "2023-01-01T09:00:00",
      lastActive: "2023-09-10T16:30:00",
      status: "active",
      address: "RETECH Headquarters",
      phone: "888-555-TECH",
      profileImage: "https://placehold.co/400x400?text=A"
    }
  ];
}

// Update user statistics
function updateUserStats(activeUsers, totalPoints, recycledItems) {
  const activeUsersElement = document.getElementById("activeUsersCount");
  const totalPointsElement = document.getElementById("totalPointsAwarded");
  const recycleItemsElement = document.getElementById("recycleItemsCount");

  if (activeUsersElement) {
    animateCounter(activeUsersElement, 0, activeUsers);
  }
  
  if (totalPointsElement) {
    animateCounter(totalPointsElement, 0, totalPoints);
  }
  
  if (recycleItemsElement) {
    animateCounter(recycleItemsElement, 0, recycledItems);
  }
}

// View user details
function viewUserDetails(email) {
  console.log("View details for user:", email);
  
  // Get user data
  const users = getDummyUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    console.log("Showing details for user:", user);
    
    // Create a modal to display user details
    const modalHTML = `
      <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-user-circle me-2"></i>User Details
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="text-center mb-4">
                ${user.profileImage ? 
                  `<img src="${user.profileImage}" alt="${user.firstName} ${user.lastName}" class="rounded-circle mb-3" width="80" height="80">` : 
                  `<div class="user-avatar mx-auto mb-3" style="width: 80px; height: 80px;">
                    <div class="avatar-text" style="font-size: 32px;">${user.firstName.charAt(0)}${user.lastName.charAt(0)}</div>
                    <div class="avatar-shine"></div>
                  </div>`
                }
                <h5 class="mb-0">${user.firstName} ${user.lastName}</h5>
                <p class="text-muted">${user.email}</p>
                <span class="user-role ${user.role.toLowerCase()}" style="font-size: 14px; padding: 5px 15px;">
                  ${user.role === "admin" ? "Admin" : "Customer"}
                </span>
              </div>
              
              <div class="row mb-3">
                <div class="col-6">
                  <div class="card">
                    <div class="card-body text-center">
                      <h3>${user.recycledDevices}</h3>
                      <small class="text-muted">Recycled Devices</small>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="card">
                    <div class="card-body text-center">
                      <h3>${user.points.toLocaleString()}</h3>
                      <small class="text-muted">Points</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <ul class="list-group list-group-flush mb-4">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-calendar me-2"></i>Join Date</span>
                  <span class="text-muted">${new Date(user.joinDate).toLocaleDateString()}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-clock me-2"></i>Last Active</span>
                  <span class="text-muted">${new Date(user.lastActive).toLocaleDateString()}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-phone me-2"></i>Phone</span>
                  <span class="text-muted">${user.phone || 'N/A'}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-map-marker-alt me-2"></i>Address</span>
                  <span class="text-muted">${user.address || 'N/A'}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-clipboard-list me-2"></i>Request Count</span>
                  <span class="text-muted">${user.requestsCount || 0}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span><i class="fas fa-check-circle me-2"></i>Status</span>
                  <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}">${user.status || 'inactive'}</span>
                </li>
              </ul>
            </div>
            <div class="modal-footer">
              <a href="mailto:${user.email}" class="btn btn-primary">
                <i class="fas fa-envelope me-2"></i>Send Email
              </a>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Check if the modal already exists and remove it
    let existingModal = document.getElementById('userDetailsModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Add the modal to the DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize and show the modal
    const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    modal.show();
  } else {
    console.error("User not found:", email);
  }
}

// Send message to user by opening email client
function messageUser(email) {
  console.log("Opening email client for:", email);
  
  // Get user data for a more personalized subject line
  const users = getDummyUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Create a mailto link with pre-filled subject
    const subject = `Message from RETECH Admin`;
    const body = `Hello ${user.firstName},\n\n`;
    
    // Create the mailto URL
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the user's email client
    window.location.href = mailtoUrl;
  } else {
    console.error("User not found:", email);
    
    // Fallback to just opening the email with the address
    window.location.href = `mailto:${email}`;
  }
}

// Make functions available globally
window.loadUsers = loadUsers;
window.getDummyUsers = getDummyUsers;
window.viewUserDetails = viewUserDetails;
window.messageUser = messageUser;
window.updateUserStats = updateUserStats; 