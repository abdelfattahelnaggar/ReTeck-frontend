# RETECH - Electronics Recycling Service

RETECH is a web application designed to provide electronics recycling services, where users can recycle their electronic devices and earn rewards.

## Project Structure

The project is organized as follows:

```
RETECH/
│
├── css/                  # Stylesheet files
│   ├── main.css          # Main styles 
│   ├── about-us.css      # About us page styles
│   ├── admin.css         # Admin page styles
│   ├── admin-dashboard.css # Admin dashboard styles
│   ├── contact.css       # Contact page styles
│   ├── faq.css           # FAQ page styles
│   ├── login.css         # Login page styles
│   ├── profile.css       # User profile styles
│   └── signup.css        # Signup page styles
│
├── js/                   # JavaScript files
│   ├── main.js           # Main application logic
│   ├── auth.js           # Authentication functionality
│   ├── utils.js          # Utility functions
│   ├── admin.js          # Admin functionality
│   ├── login.js          # Login page functionality
│   ├── profile.js        # Profile page functionality
│   ├── about-us.js       # About us page functionality
│   ├── contact.js        # Contact page functionality
│   ├── faq.js            # FAQ page functionality
│   ├── image-upload.js   # Image upload functionality
│   └── recycle-forms.js  # Recycling forms functionality
│
├── html/                 # HTML files
│   ├── index.html        # Home page
│   ├── login.html        # Login page
│   ├── signup.html       # Signup page
│   ├── profile.html      # User profile page
│   ├── about-us.html     # About us page
│   ├── contact-us.html   # Contact page
│   ├── faq.html          # FAQ page
│   ├── admin-dashboard.html # Admin dashboard
│   ├── recycle-laptop.html  # Laptop recycling page
│   ├── recycle-phone.html   # Phone recycling page
│   ├── recycle-electronics.html # Electronics recycling page
│   └── recycle-kitchen.html     # Kitchen appliances recycling page
│
└── images/               # Image assets
```

## Features

- **User Authentication**: Sign up, login, and profile management
- **Electronics Recycling**: Forms to submit electronic devices for recycling
- **Rewards Program**: Points-based rewards for recycling activities
- **Admin Dashboard**: For managing recycling requests and users
- **Responsive Design**: Mobile-friendly layout for all devices

## Code Organization

### JavaScript

The JavaScript code is organized as follows:

- **main.js**: Core application functionality and bootstrapping
- **utils.js**: Utility functions used across the application
- **auth.js**: Authentication logic and user management
- **Page-specific files**: Functionality specific to each page

Code is organized by feature and follows a modular approach with clear separation of concerns.

### CSS

CSS is organized using:

- **CSS Variables**: For consistent theming and easy customization
- **Modularity**: Separate files for different pages and components
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Getting Started

1. Clone the repository
2. Open the project in your preferred code editor
3. Open `html/index.html` in a web browser to view the application

## Development

For local development:

```bash
# Start a local server
npx serve
```

## Demo Account

For testing purposes, you can use these demo accounts:

- **Customer**: 
  - Email: user@example.com
  - Password: User@123

- **Admin**:
  - Email: admin@retech.com
  - Password: Admin@123

## Browser Compatibility

The application is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest) 