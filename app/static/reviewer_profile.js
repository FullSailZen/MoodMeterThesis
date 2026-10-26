const loadingSection =
    document.getElementById(
        "reviewer-loading"
    );

const errorSection =
    document.getElementById(
        "reviewer-error"
    );

const contentSection =
    document.getElementById(
        "reviewer-content"
    );


function createStars(rating) {
    if (
        rating === null
        || rating === undefined
    ) {
        return "☆☆☆☆☆";
    }

    const rounded =
        Math.round(
            rating
        );

    return (
        "★".repeat(
            rounded
        )
        +
        "☆".repeat(
            5 - rounded
        )
    );
}


function formatRole(role) {
    if (!role) {
        return "Consumer";
    }

    return (
        role
            .charAt(0)
            .toUpperCase()
        +
        role.slice(1)
    );
}


function formatDate(dateValue) {
    return new Date(
        dateValue
    ).toLocaleDateString(
        undefined,
        {
            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"
        }
    );
}


function getReviewerId() {
    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const reviewerId =
        parameters.get(
            "user"
        );


    if (!reviewerId) {
        return null;
    }


    const parsedReviewerId =
        Number(
            reviewerId
        );


    if (
        !Number.isInteger(
            parsedReviewerId
        )
        ||
        parsedReviewerId <= 0
    ) {
        return null;
    }


    return parsedReviewerId;
}


function calculateVerificationRate(
    totalReviews,
    verifiedReviews
) {
    if (
        !totalReviews
        ||
        totalReviews <= 0
    ) {
        return "0%";
    }


    const percentage =
        (
            verifiedReviews
            /
            totalReviews
        )
        *
        100;


    return (
        `${Math.round(
            percentage
        )}%`
    );
}


async function loadReviewerProfile() {
    const reviewerId =
        getReviewerId();


    if (!reviewerId) {
        showReviewerError(
            "A valid reviewer ID was not provided."
        );

        return;
    }


    try {
        const response =
            await fetch(
                `/users/${reviewerId}/profile`
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.detail
                ||
                "Unable to load the reviewer profile."
            );
        }


        displayReviewerProfile(
            data
        );
    }

    catch (error) {
        showReviewerError(
            error.message
        );
    }
}


function displayReviewerProfile(
    reviewer
) {
    loadingSection.classList.add(
        "hidden"
    );

    errorSection.classList.add(
        "hidden"
    );

    contentSection.classList.remove(
        "hidden"
    );


    document.title =
        `${reviewer.name} | MoodMeter`;


    document.getElementById(
        "reviewer-name"
    ).textContent =
        reviewer.name;


    document.getElementById(
        "reviewer-member-since"
    ).textContent =
        `MoodMeter member since ${formatDate(
            reviewer.created_at
        )}`;


    document.getElementById(
        "reviewer-user-id"
    ).textContent =
        reviewer.id;


    document.getElementById(
        "reviewer-role"
    ).textContent =
        formatRole(
            reviewer.role
        );


    document.getElementById(
        "reviewer-created-date"
    ).textContent =
        formatDate(
            reviewer.created_at
        );


    document.getElementById(
        "reviewer-total-reviews"
    ).textContent =
        reviewer.total_reviews;


    document.getElementById(
        "reviewer-verified-reviews"
    ).textContent =
        reviewer.verified_reviews;


    document.getElementById(
        "reviewer-verification-rate"
    ).textContent =
        calculateVerificationRate(
            reviewer.total_reviews,
            reviewer.verified_reviews
        );


    const averageRating =
        document.getElementById(
            "reviewer-average-rating"
        );


    if (
        reviewer.average_rating
        === null
    ) {
        averageRating.textContent =
            "—";
    }

    else {
        averageRating.textContent =
            `${reviewer.average_rating}/5`;
    }


    document.getElementById(
        "reviewer-average-stars"
    ).textContent =
        createStars(
            reviewer.average_rating
        );


    displayReviews(
        reviewer.reviews
    );
}


function displayReviews(reviews) {
    const reviewsList =
        document.getElementById(
            "reviewer-reviews-list"
        );


    reviewsList.innerHTML =
        "";


    if (
        !reviews
        ||
        reviews.length === 0
    ) {
        reviewsList.innerHTML = `
            <div class="empty-state">

                <h3>
                    No published reviews
                </h3>

                <p>
                    This reviewer does not have any
                    eligible public reviews yet.
                </p>

            </div>
        `;

        return;
    }


    for (
        const review
        of reviews
    ) {
        const card =
            document.createElement(
                "article"
            );


        card.className =
            "review-card";


        const top =
            document.createElement(
                "div"
            );


        top.className =
            "review-card-top";


        const businessContainer =
            document.createElement(
                "div"
            );


        const businessName =
            document.createElement(
                "h3"
            );


        businessName.textContent =
            review.business_name;


        const businessLocation =
            document.createElement(
                "p"
            );


        businessLocation.className =
            "review-date";


        businessLocation.textContent =
            [
                review.business_city,
                review.business_state
            ]
                .filter(
                    Boolean
                )
                .join(
                    ", "
                );


        businessContainer.appendChild(
            businessName
        );

        businessContainer.appendChild(
            businessLocation
        );


        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "verification-badge";


        if (
            review.verification_status
            === "verified"
        ) {
            badge.classList.add(
                "verified-badge"
            );

            badge.textContent =
                "Verified Purchase";
        }

        else {
            badge.classList.add(
                "unverified-badge"
            );

            badge.textContent =
                "Unverified";
        }


        top.appendChild(
            businessContainer
        );

        top.appendChild(
            badge
        );


        const stars =
            document.createElement(
                "div"
            );


        stars.className =
            "review-stars";


        stars.textContent =
            createStars(
                review.rating
            );


        const body =
            document.createElement(
                "p"
            );


        body.className =
            "review-body";


        body.textContent =
            review.body;


        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "review-card-top";


        const date =
            document.createElement(
                "p"
            );


        date.className =
            "review-date";


        date.textContent =
            formatDate(
                review.created_at
            );


        const businessLink =
            document.createElement(
                "a"
            );


        businessLink.href =
            `/businesses-page?business_id=${review.business_id}`;


        businessLink.className =
            "back-button";


        businessLink.textContent =
            "View Business";


        footer.appendChild(
            date
        );

        footer.appendChild(
            businessLink
        );


        card.appendChild(
            top
        );

        card.appendChild(
            stars
        );

        card.appendChild(
            body
        );

        card.appendChild(
            footer
        );


        reviewsList.appendChild(
            card
        );
    }
}


function showReviewerError(
    message
) {
    loadingSection.classList.add(
        "hidden"
    );

    contentSection.classList.add(
        "hidden"
    );

    errorSection.classList.remove(
        "hidden"
    );


    document.getElementById(
        "reviewer-error-message"
    ).textContent =
        message;
}


loadReviewerProfile();