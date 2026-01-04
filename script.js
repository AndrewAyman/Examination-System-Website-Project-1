// ====== Utility Functions ======
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "-error");
  if (!input || !error) return;
  input.classList.add("invalid");
  error.textContent = message;
  error.style.display = "block";
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "-error");
  if (!input || !error) return;
  input.classList.remove("invalid");
  error.textContent = "";
  error.style.display = "none";
}

// ====== Enhanced Validation ======
function validateField(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const value = el.value.trim();
  
  // Regex patterns - حروف فقط للأسماء
  const nameRegex = /^[A-Za-z\u0600-\u06FF\s]{2,}$/; // Support Arabic & English, min 2 chars
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordMinLength = 8;

  if (inputId === "firstName" || inputId === "lastName") {
    if (value.length === 0) {
      showError(inputId, "This field is required");
    } else if (!nameRegex.test(value)) {
      showError(inputId, "Only alphabetical characters allowed (min 2 characters)");
    } else {
      clearError(inputId);
    }
  }

  if (inputId === "email") {
    if (value.length === 0) {
      showError(inputId, "Email is required");
    } else if (!emailRegex.test(value)) {
      showError(inputId, "Please enter a valid email (e.g., user@example.com)");
    } else {
      clearError(inputId);
    }
  }

  if (inputId === "password") {
    if (value.length === 0) {
      showError(inputId, "Password is required");
    } else if (value.length < passwordMinLength) {
      showError(inputId, `Password must be at least ${passwordMinLength} characters`);
    } else {
      clearError(inputId);
      // Re-validate confirm password if it has a value
      const confirmPass = document.getElementById("confirmPassword");
      if (confirmPass && confirmPass.value) {
        validateField("confirmPassword");
      }
    }
  }

  if (inputId === "confirmPassword") {
    const password = document.getElementById("password")?.value || "";
    if (value.length === 0) {
      showError(inputId, "Please confirm your password");
    } else if (value !== password) {
      showError(inputId, "Passwords do not match");
    } else if (value.length < passwordMinLength) {
      showError(inputId, `Password must be at least ${passwordMinLength} characters`);
    } else {
      clearError(inputId);
    }
  }

  if (inputId === "loginEmail") {
    if (value.length === 0) {
      showError(inputId, "Email is required");
    } else if (!emailRegex.test(value)) {
      showError(inputId, "Please enter a valid email");
    } else {
      clearError(inputId);
    }
  }

  if (inputId === "loginPassword") {
    if (value.length === 0) {
      showError(inputId, "Password is required");
    } else if (value.length < passwordMinLength) {
      showError(inputId, `Password must be at least ${passwordMinLength} characters`);
    } else {
      clearError(inputId);
    }
  }
}

// ====== Real-time Validation Setup ======
document.addEventListener("DOMContentLoaded", () => {
  const inputs = [
    "firstName",
    "lastName",
    "email",
    "password",
    "confirmPassword",
    "loginEmail",
    "loginPassword",
  ];
  
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("blur", () => validateField(id));
      input.addEventListener("input", () => {
        // Clear error on input if field was invalid
        const error = document.getElementById(id + "-error");
        if (error && error.style.display === "block") {
          validateField(id);
        }
      });
    }
  });
});

// ====== Registration Form Handler ======
function validateRegistrationForm(event) {
  event.preventDefault();
  
  // Validate all fields
  const fieldsToValidate = ["firstName", "lastName", "email", "password", "confirmPassword"];
  fieldsToValidate.forEach(validateField);

  // Check if there are any errors
  const errors = document.querySelectorAll(".error-message");
  const hasError = Array.from(errors).some((e) => e.style.display === "block");
  
  if (hasError) {
    // Scroll to first error
    const firstError = document.querySelector(".error-message[style*='display: block']");
    if (firstError) {
      firstError.previousElementSibling?.focus();
    }
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();

  // Check if email already exists
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const existingUser = users.find((u) => u.email === email);
  
  if (existingUser) {
    showError("email", "This email is already registered. Please use another one.");
    return;
  }

  // Save new user
  users.push({ 
    email, 
    password,
    firstName,
    lastName,
    registeredAt: new Date().toISOString()
  });
  localStorage.setItem("users", JSON.stringify(users));

  // Show success message with custom styling
  showSuccessMessage("Account created successfully! Redirecting to login...");
  
  // Redirect after 1.5 seconds
  setTimeout(() => {
    window.location.href = "signin.html";
  }, 1500);
}

// ====== Sign In Form Handler ======
function validateSignInForm(event) {
  event.preventDefault();
  
  // Validate fields
  ["loginEmail", "loginPassword"].forEach(validateField);

  const errors = document.querySelectorAll(".error-message");
  const hasError = Array.from(errors).some((e) => e.style.display === "block");
  
  if (hasError) return;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const matchedUser = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!matchedUser) {
    showError("loginPassword", "Invalid email or password. Please try again.");
    return;
  }

  // Save login state
  localStorage.setItem("currentUserEmail", email);
  localStorage.setItem("currentUserName", matchedUser.firstName || "User");
  
  showSuccessMessage("Login successful! Redirecting...");
  
  setTimeout(() => {
    window.location.href = "start-exam.html";
  }, 1000);
}

// ====== Success Message Helper ======
function showSuccessMessage(message) {
  // Create success overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  
  const messageBox = document.createElement("div");
  messageBox.style.cssText = `
    background: white;
    padding: 30px 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    text-align: center;
    animation: slideUp 0.4s ease;
  `;
  
  messageBox.innerHTML = `
    <div style="font-size: 48px; color: #4caf50; margin-bottom: 15px;">✓</div>
    <div style="font-size: 18px; color: #333; font-weight: 600;">${message}</div>
  `;
  
  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);
  
  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}
