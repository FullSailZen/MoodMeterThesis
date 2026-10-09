const loadingSection =
    document.getElementById(
        "account-loading"
    );

const errorSection =
    document.getElementById(
        "account-error"
    );

const contentSection =
    document.getElementById(
        "account-content"
    );

const signOutButton =
    document.getElementById(
        "account-sign-out"
    );


function getMoodMeterToken() {
    return sessionStorage.getItem(
        "moodmeter_access_token"
    );
}


function createStars(rating) {
    if (
        rating === null
        || rating === undefined
    ) {
        return "☆☆☆☆☆";
    }

    const rounded =
        Math.round(rating);

    return (
        "★".repeat(rounded)
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

    return role
        .charAt(0)
        .toUpperCase()
        +
        role.slice(1);
}


function formatDate(dateValue) {
    return new Date(
        dateValue
    ).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


async function loadAccount() {
    const token =
        getMoodMeterToken();

    if (!token) {
        showAccountError(
            "You must sign in with Google before viewing your account."
        );

        return;
    }


    try {
        const response =
            await fetch(
                "/users/me/profile",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.detail
                ||
                "Unable to load your account."
            );
        }


        displayAccount(
            data
        );
    }

    catch (error) {
        showAccountError(
            error.message
        );
    }
}


function displayAccount(user) {
    loadingSection.classList.add(
        "hidden"
    );

    errorSection.classList.add(
        "hidden"
    );

    contentSection.classList.remove(
        "hidden"
    );


    document.getElementById(
        "account-name"
    ).textContent =
        user.name;


    document.getElementById(
        "account-member-since"
    ).textContent =
        `Member since ${formatDate(
            user.created_at
        )}`;


    document.getElementById(
        "account-user-id"
    ).textContent =
        user.id;


    document.getElementById(
        "account-role"
    ).textContent =
        formatRole(
            user.role
        );


    document.getElementById(
        "account-provider"
    ).textContent =
        user.auth_provider;


    document.getElementById(
        "account-total-reviews"
    ).textContent =
        user.total_reviews;


    document.getElementById(
        "account-verified-reviews"
    ).textContent =
        user.verified_reviews;


    document.getElementById(
        "account-unverified-reviews"
    ).textContent =
        user.unverified_reviews;


    const averageRating =
        document.getElementById(
            "account-average-rating"
        );


    if (
        user.average_rating
        === null
    ) {
        averageRating.textContent =
            "—";
    }

    else {
        averageRating.textContent =
            `${user.average_rating}/5`;
    }


    document.getElementById(
        "account-average-stars"
    ).textContent =
        createStars(
            user.average_rating
        );


    displayReviews(
        user.reviews
    );
}


function displayReviews(reviews) {
    const reviewsList =
        document.getElementById(
            "account-reviews-list"
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
                <h3>No reviews yet</h3>

                <p>
                    Reviews you submit will appear here.
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
                .filter(Boolean)
                .join(", ");


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
            `/businesses-page?business=${review.business_id}`;

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


function showAccountError(message) {
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
        "account-error-message"
    ).textContent =
        message;
}


signOutButton.addEventListener(
    "click",
    function () {
        sessionStorage.removeItem(
            "moodmeter_access_token"
        );

        window.location.href =
            "/";
    }
);


loadAccount();