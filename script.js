document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle
    const toggleSidebar = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
     window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const hero = document.querySelector('.hero');
    const heroHeight = hero.offsetHeight;
    const background = document.querySelector('.hero-background');
    
    if (background && hero) {
        let opacity = 1 - (scrollTop / heroHeight);
        opacity = Math.max(opacity, 0); // Ensure opacity doesn't go below 0
        background.style.opacity = opacity;
    }
});
    }

    // Latest News functionality
    const latestNewsContent = document.getElementById('latestNewsContent');
    if (latestNewsContent) {
        fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=5')
            .then(response => response.json())
            .then(data => {
                const newsData = data.hits.map(hit => ({
                    title: hit.title || 'Untitled Story',
                    summary: `Score: ${hit.points || 0}, Comments: ${hit.num_comments || 0}`,
                    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`
                }));
                newsData.forEach(news => {
                    const newsItem = document.createElement('div');
                    newsItem.classList.add('news-item');
                    newsItem.innerHTML = `
                        <h3>${news.title}</h3>
                        <p>${news.summary}</p>
                        <a href="${news.url}" target="_blank">Read More</a>
                    `;
                    newsItem.addEventListener('click', () => {
                        newsItem.classList.toggle('expanded');
                    });
                    latestNewsContent.appendChild(newsItem);
                });
            })
            .catch(error => {
                console.error('Error fetching news:', error);
                latestNewsContent.innerHTML = '<p>Failed to load news. Please try again later.</p>';
            });
    }

    // Form validation
    const form = document.getElementById('contactForm');
    if (form) {
        // Get form elements
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInputField = document.getElementById('phone');
        const phoneTypeSelect = document.getElementById('phoneType');
        const companyInput = document.getElementById('company');
        const messageInput = document.getElementById('message');
        const waitlistInputs = document.getElementsByName('waitlist');

        // Initialize intl-tel-input
        const phoneInput = window.intlTelInput(phoneInputField, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
        });

        // Get error elements
        const firstNameError = firstNameInput.nextElementSibling;
        const lastNameError = lastNameInput.nextElementSibling;
        const emailError = emailInput.nextElementSibling;
        const phoneError = phoneInputField.nextElementSibling;
        const phoneTypeError = phoneTypeSelect.nextElementSibling;
        const companyError = companyInput.nextElementSibling;
        const messageError = messageInput.nextElementSibling;
        const waitlistError = document.getElementById('waitlistError');

        // Validation functions
        const validateName = (value) => /^[a-zA-Z\s]{2,}$/.test(value);
        const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const validatePhone = () => phoneInput.isValidNumber();
        const validateMessage = (value) => value.trim().length >= 10;
        const validatePhoneType = (value) => value !== '';
        const validateCompany = (value) => true; // Optional

        // Show/hide error messages
        const setFieldState = (input, errorElement, isValid, errorMessage) => {
            if (isValid) {
                input.classList.remove('invalid');
                errorElement.classList.remove('active');
                errorElement.textContent = '';
            } else {
                input.classList.add('invalid');
                errorElement.classList.add('active');
                errorElement.textContent = errorMessage;
            }
        };

        // Real-time validation
        firstNameInput.addEventListener('input', () => setFieldState(firstNameInput, firstNameError, validateName(firstNameInput.value.trim()), 'Please enter a valid first name (at least 2 characters, letters only)'));
        lastNameInput.addEventListener('input', () => setFieldState(lastNameInput, lastNameError, validateName(lastNameInput.value.trim()), 'Please enter a valid last name (at least 2 characters, letters only)'));
        emailInput.addEventListener('input', () => setFieldState(emailInput, emailError, validateEmail(emailInput.value.trim()), 'Please enter a valid email address'));
        messageInput.addEventListener('input', () => setFieldState(messageInput, messageError, validateMessage(messageInput.value.trim()), 'Please enter a message (at least 10 characters)'));
        phoneTypeSelect.addEventListener('change', () => setFieldState(phoneTypeSelect, phoneTypeError, validatePhoneType(phoneTypeSelect.value), 'Please select a contact purpose'));
        phoneInputField.addEventListener('blur', () => setFieldState(phoneInputField, phoneError, validatePhone(), 'Please enter a valid phone number'));

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate all fields
            const isFirstNameValid = validateName(firstNameInput.value.trim());
            setFieldState(firstNameInput, firstNameError, isFirstNameValid, 'Please enter a valid first name (at least 2 characters, letters only)');
            const isLastNameValid = validateName(lastNameInput.value.trim());
            setFieldState(lastNameInput, lastNameError, isLastNameValid, 'Please enter a valid last name (at least 2 characters, letters only)');
            const isEmailValid = validateEmail(emailInput.value.trim());
            setFieldState(emailInput, emailError, isEmailValid, 'Please enter a valid email address');
            const isPhoneValid = validatePhone();
            setFieldState(phoneInputField, phoneError, isPhoneValid, 'Please enter a valid phone number');
            const isPhoneTypeValid = validatePhoneType(phoneTypeSelect.value);
            setFieldState(phoneTypeSelect, phoneTypeError, isPhoneTypeValid, 'Please select a contact purpose');
            const isMessageValid = validateMessage(messageInput.value.trim());
            setFieldState(messageInput, messageError, isMessageValid, 'Please enter a message (at least 10 characters)');

            // Check waitlist
            const waitlist = Array.from(waitlistInputs).find(input => input.checked);
            const isWaitlistValid = !!waitlist;
            setFieldState(null, waitlistError, isWaitlistValid, 'Please select whether to join the waitlist');

            // Proceed if all fields are valid
            if (isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid && isPhoneTypeValid && isMessageValid && isWaitlistValid) {
                const formData = {
                    firstName: firstNameInput.value.trim(),
                    lastName: lastNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.getNumber(),
                    phoneType: phoneTypeSelect.value,
                    company: companyInput.value.trim() || 'Not provided',
                    message: messageInput.value.trim(),
                    waitlist: waitlist.value
                };

                // Display form data in alert
                alert(`
                    Form Submission Details:
                    First Name: ${formData.firstName}
                    Last Name: ${formData.lastName}
                    Email: ${formData.email}
                    Phone: ${formData.phone}
                    Contact Purpose: ${formData.phoneType}
                    Company: ${formData.company}
                    Message: ${formData.message}
                    Join Waitlist: ${formData.waitlist === 'yes' ? 'Yes' : 'No'}
                `);

                console.log('Form submitted:', formData);
                form.reset();
                // Reset error states
                [firstNameInput, lastNameInput, emailInput, phoneInputField, phoneTypeSelect, companyInput, messageInput].forEach(input => {
                    if (input) {
                        input.classList.remove('invalid');
                        const errorElement = input.nextElementSibling;
                        if (errorElement) {
                            errorElement.classList.remove('active');
                            errorElement.textContent = '';
                        }
                    }
                });
                waitlistError.textContent = '';
            } else {
                console.log('Form validation failed');
            }
        });
    }

    // Scroll-based animations
    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-contact, .animate-on-scroll-advancements');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    animateElements.forEach(element => {
        observer.observe(element);
    });
});