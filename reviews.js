// ServEase Reviews Logic

document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const reviewModal = document.getElementById('review-modal');
    const closeBtn = document.querySelector('.close-modal');
    const writeReviewBtn = document.getElementById('write-review-btn');
    const reviewForm = document.getElementById('review-form');
    const successState = document.getElementById('review-success');

    // Star Rating Elements
    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('rating-value');
    let currentRating = 0;

    // Function to open modal
    function openModal() {
        reviewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Reset form
        reviewForm.style.display = 'block';
        successState.classList.add('hidden');
        reviewForm.reset();

        // Reset stars
        currentRating = 0;
        ratingInput.value = '';
        updateStars(0);
    }

    // Function to close modal
    function closeModal() {
        reviewModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Star Rating Logic
    function updateStars(rating) {
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            if (val <= rating) {
                star.classList.replace('ph-bold', 'ph-fill');
                star.classList.add('active');
            } else {
                star.classList.replace('ph-fill', 'ph-bold');
                star.classList.remove('active');
            }
        });
    }

    stars.forEach(star => {
        // Hover effect over stars
        star.addEventListener('mouseover', function () {
            const hoverValue = parseInt(this.getAttribute('data-value'));
            stars.forEach(s => {
                const val = parseInt(s.getAttribute('data-value'));
                if (val <= hoverValue) {
                    s.classList.add('hover');
                    s.classList.replace('ph-bold', 'ph-fill');
                } else {
                    s.classList.remove('hover');
                    // If it's not part of the current saved rating, turn it back to outline
                    if (val > currentRating) {
                        s.classList.replace('ph-fill', 'ph-bold');
                    }
                }
            });
        });

        // Remove hover effect when mouse leaves
        star.addEventListener('mouseout', function () {
            stars.forEach(s => {
                s.classList.remove('hover');
                const val = parseInt(s.getAttribute('data-value'));
                if (val <= currentRating) {
                    s.classList.replace('ph-bold', 'ph-fill');
                } else {
                    s.classList.replace('ph-fill', 'ph-bold');
                }
            });
        });

        // Click to set rating
        star.addEventListener('click', function () {
            currentRating = parseInt(this.getAttribute('data-value'));
            ratingInput.value = currentRating;
            updateStars(currentRating);
        });
    });

    // Event Listeners for opening/closing
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', openModal);
    }

    const navWriteReviewBtn = document.getElementById('nav-write-review-btn');
    if (navWriteReviewBtn) {
        navWriteReviewBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                closeModal();
            }
        });
    }

    // Form Submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (currentRating === 0) {
                alert("Please select a star rating!");
                return;
            }

            const submitBtn = reviewForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const reviewData = {
                reviewerName: document.getElementById('reviewer-name').value,
                service: document.getElementById('review-service').value,
                rating: currentRating,
                reviewText: document.getElementById('review-text').value
            };

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });

                if (response.ok) {
                    reviewForm.style.display = 'none';
                    successState.classList.remove('hidden');

                    // Add the new review to the DOM dynamically
                    addNewReviewToGrid(reviewData.reviewerName, reviewData.service, currentRating, reviewData.reviewText);

                    // Auto close
                    setTimeout(() => {
                        closeModal();
                    }, 2000);
                } else {
                    alert('Submission failed.');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Server error.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Fetch Reviews from Backend
    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (response.ok) {
                const reviews = await response.json();
                const reviewsContainer = document.getElementById('reviews-container');
                if (reviewsContainer && reviews.length > 0) {
                    // Clear existing dummy reviews if we have real data
                    reviewsContainer.innerHTML = '';
                    reviews.forEach(review => {
                        addNewReviewToGrid(review.reviewerName, review.service, review.rating, review.reviewText, review.createdAt);
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    }

    fetchReviews();

    function addNewReviewToGrid(name, service, rating, text, date) {
        const reviewsContainer = document.getElementById('reviews-container');
        if (!reviewsContainer) return;

        // Generate Initials
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        // Date
        const reviewDate = date ? new Date(date) : new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const dateString = reviewDate.toLocaleDateString('en-US', dateOptions);

        // Generate stars HTML
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="ph-fill ph-star"></i>';
            } else {
                starsHtml += '<i class="ph-bold ph-star" style="color: var(--border-color);"></i>';
            }
        }

        const newReviewHTML = `
            <div class="review-card" style="animation: scaleIn 0.5s ease;">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="avatar">${initials}</div>
                        <div>
                            <h4>${name}</h4>
                            <span class="service-tag">${service}</span>
                        </div>
                    </div>
                    <div class="stars">${starsHtml}</div>
                </div>
                <p class="review-text">"${text}"</p>
                <div class="review-date">${dateString}</div>
            </div>
        `;

        // Add to the top of the grid
        reviewsContainer.insertAdjacentHTML('afterbegin', newReviewHTML);
    }
});
