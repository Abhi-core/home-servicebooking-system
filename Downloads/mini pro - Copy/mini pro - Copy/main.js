// ServEase Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const serviceSelect = document.getElementById('service-type');
    const successState = document.getElementById('booking-success');
    
    // Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const navMenu = document.getElementById('nav-menu');
    const mobileCloseItems = document.querySelectorAll('.mobile-close');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (navMenu.classList.contains('active')) {
                hamburgerIcon.classList.replace('ph-list', 'ph-x');
                document.body.style.overflow = 'hidden';
            } else {
                hamburgerIcon.classList.replace('ph-x', 'ph-list');
                document.body.style.overflow = '';
            }
        });
    }

    const closeMobileBtn = document.getElementById('close-mobile-menu');
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (hamburgerIcon) hamburgerIcon.classList.replace('ph-x', 'ph-list');
            document.body.style.overflow = '';
        });
    }

    if (mobileCloseItems) {
        mobileCloseItems.forEach(item => {
            item.addEventListener('click', () => {
                if(navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (hamburgerIcon) hamburgerIcon.classList.replace('ph-x', 'ph-list');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // ==========================================
    // Modal & Validation Helper
    // ==========================================
    function toggleRequired(container, isRequired) {
        if (!container) return;
        const inputs = container.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (isRequired) {
                // Restore required if it was previously marked
                if (input.dataset.required === 'true') input.required = true;
            } else {
                // Save and remove required
                if (input.required) {
                    input.dataset.required = 'true';
                    input.required = false;
                }
            }
        });
    }

    const openModal = (modalEl, formEl, serviceVal = null) => {
        if (!modalEl) return;
        modalEl.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        if (formEl) {
            toggleRequired(formEl, true);
            formEl.style.display = 'block';
            const success = modalEl.querySelector('.success-state');
            if (success) success.classList.add('hidden');
            formEl.reset();

            if (serviceVal && serviceSelect) {
                const optionToSelect = Array.from(serviceSelect.options).find(opt => opt.value === serviceVal);
                if (optionToSelect) optionToSelect.selected = true;
            }
        }
    };

    const closeModal = () => {
        const modals = document.querySelectorAll('.modal-backdrop');
        modals.forEach(m => {
            const form = m.querySelector('form');
            if (form) toggleRequired(form, false);
            m.classList.add('hidden');
        });
        document.body.style.overflow = '';
    };

    // Initialize: Hide required on all modals to prevent background validation errors
    document.querySelectorAll('.modal-backdrop form').forEach(f => toggleRequired(f, false));

    // Attach click events to all booking buttons
    const bookBtns = document.querySelectorAll('[data-service]');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceRequested = btn.getAttribute('data-service');
            openModal(bookingModal, bookingForm, serviceRequested);
        });
    });

    // Specific Nav Book Button (if it doesn't have data-service)
    const navBookBtn = document.querySelector('.nav-cta');
    if (navBookBtn && !navBookBtn.hasAttribute('data-service')) {
        navBookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(bookingModal, bookingForm);
        });
    }

    // Close buttons within modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close on clicking backdrop
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // ==========================================
    // Handle Booking Form Submission
    // ==========================================
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = bookingForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const formData = {
                serviceType: document.getElementById('service-type').value,
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                email: document.getElementById('email').value
            };

            try {
                const response = await fetch('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    console.log('Booking successful');
                    bookingForm.style.display = 'none';
                    successState.classList.remove('hidden');
                    
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                } else {
                    const error = await response.json();
                    alert('Booking failed: ' + (error.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('Network error:', err);
                alert('Could not connect to the server.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // Worker Registration Logic
    // ==========================================
    const workerRegModal = document.getElementById('worker-reg-modal');
    const openWorkerRegBtn = document.getElementById('open-worker-reg-btn');
    const workerRegForm = document.getElementById('worker-reg-form');
    const workerRegSuccess = document.getElementById('worker-reg-success');
    const workerRegFormContainer = document.getElementById('worker-reg-form-container');

    if(openWorkerRegBtn) {
        openWorkerRegBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            openModal(workerRegModal, workerRegForm); 
        });
    }

    if(workerRegForm) {
        workerRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = workerRegForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const regData = {
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                serviceType: document.getElementById('reg-service').value,
                experience: document.getElementById('reg-exp').value,
                bio: document.getElementById('reg-bio').value
            };

            try {
                const res = await fetch('/api/workers/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(regData)
                });
                if(res.ok) {
                    workerRegFormContainer.style.display = 'none';
                    workerRegSuccess.classList.remove('hidden');
                } else {
                    alert('Submission failed. Please try again.');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    const closeRegSuccess = document.getElementById('close-reg-success');
    if(closeRegSuccess) closeRegSuccess.addEventListener('click', closeModal);

    // ==========================================
    // Support Chat Widget Logic
    // ==========================================
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatIcon = document.getElementById('chat-icon');
    const chatCloseIcon = document.getElementById('chat-close-icon');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesContainer = document.getElementById('chat-messages');

    let botTyping = false;

    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            const isHidden = chatWindow.classList.contains('hidden');
            if (isHidden) {
                chatWindow.classList.remove('hidden');
                chatIcon.classList.add('hidden');
                chatCloseIcon.classList.remove('hidden');
                setTimeout(() => chatInput.focus(), 300);
            } else {
                chatWindow.classList.add('hidden');
                chatIcon.classList.remove('hidden');
                chatCloseIcon.classList.add('hidden');
            }
        });
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '' || botTyping) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message user-message';
        msgDiv.textContent = text;
        chatMessagesContainer.appendChild(msgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        chatInput.value = '';

        botTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessagesContainer.appendChild(indicator);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        setTimeout(() => {
            indicator.remove();
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-message bot-message';
            botMsg.textContent = getBotResponse(text);
            chatMessagesContainer.appendChild(botMsg);
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            botTyping = false;
        }, 1500);
    }

    if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "Hello! How can I assist you with your home services today?";
        if (lowerInput.includes('price')) return "Pricing varies by service. Try booking a specific service for a quote!";
        if (lowerInput.includes('book')) return "You can book any service via the 'Book Now' button!";
        return "Thanks for your message! A representative will be with you shortly.";
    }
});
