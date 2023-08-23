// JavaScript to handle form switching
document.addEventListener("DOMContentLoaded", function () {
    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    const loginModalLabel = document.getElementById("loginModalLabel");
    const registerLink = document.getElementById("registerLink");
    const loginLink = document.getElementById("loginLink");
    const showRegisterForm = document.getElementById("showRegisterForm");
    const showLoginForm = document.getElementById("showLoginForm");
    const corporateButton = document.getElementById("corporate");
    const employeeButton = document.getElementById("employee");
    const loginForm = document.getElementById("loginForm");
    const employeeRegistrationForm = document.getElementById("employeeRegistrationForm");
    const corporateRegisterForm = document.getElementById("corporateRegisterForm");
    const employeeRegisterButton = document.getElementById("employeeRegisterButton");
    const corporateRegisterButton = document.getElementById("corporateRegisterButton");
    
    showRegisterForm.addEventListener("click", function (event) {
      loginModalLabel.textContent = "Register";
      loginForm.style.display = "none";
      registerLink.style.display = "none";
      corporateButton.style.display = "block";
      employeeButton.style.display = "block";
    });

    employeeRegisterButton.addEventListener("click", function (event) {
        
    });

    corporateRegisterButton.addEventListener("click", function (event) {
        
    });


    showLoginForm.addEventListener("click", function (event) {
        loginForm.style.display = "block";
        loginModalLabel.textContent = "Login";
        loginLink.style.display = "none";
        employeeRegistrationForm.style.display = "none";
        corporateRegisterForm.style.display = "none";
        registerLink.style.display = "block";
        corporateButton.style.display = "none";
        employeeButton.style.display = "none";
      });

    employeeButton.addEventListener("click", function (event) {
        event.preventDefault();
        loginModalLabel.textContent = "Employee Register";
        loginLink.style.display = "block";
        employeeRegistrationForm.style.display = "block";
        corporateRegisterForm.style.display = "none";
        corporateButton.style.display = "none";
        employeeButton.style.display = "none";
      });
  
    corporateButton.addEventListener("click", function (event) {
        event.preventDefault();
        loginLink.style.display = "block";
        loginModalLabel.textContent = "Corporate Register";
        employeeRegistrationForm.style.display = "none";
        corporateRegisterForm.style.display = "block";
        corporateButton.style.display = "none";
        employeeButton.style.display = "none";
      });
  

    $(loginModal._element).on("hidden.bs.modal", function () {
        loginForm.style.display = "block";
        loginLink.style.display = "none";
        loginModalLabel.textContent = "Login";
        employeeRegistrationForm.style.display = "none";
        corporateRegisterForm.style.display = "none";
        registerLink.style.display = "block";
        corporateButton.style.display = "none";
        employeeButton.style.display = "none";
    });
  });