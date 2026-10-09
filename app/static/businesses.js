const businessListSection =
    document.getElementById(
        "business-list-section"
    );

const businessProfileSection =
    document.getElementById(
        "business-profile-section"
    );

const businessGrid =
    document.getElementById(
        "business-grid"
    );

const searchInput =
    document.getElementById(
        "business-search-input"
    );

const searchButton =
    document.getElementById(
        "business-search-button"
    );

const listStatus =
    document.getElementById(
        "business-list-status"
    );

const backButton =
    document.getElementById(
        "back-to-businesses"
    );


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
        "☆".repeat(5 - rounded)
    );
}


function formatRating(rating) {
    if (
        rating === null
        || rating === undefined
    ) {
        return "No rating yet";
    }

    return `${rating.toFixed(1)} / 5`;
}


async function loadBusinesses(
    searchTerm = ""
) {
    listStatus.textContent =
        "Loading businesses...";

    businessGrid.innerHTML =
        "";


    try {
        let url =
            "/businesses/";

        if (searchTerm) {
            url +=
                `?q=${encodeURIComponent(
                    searchTerm
                )}`;
        }


        const response =
            await fetch(url);

        const businesses =
            await response.json();


        if (!response.ok) {
            throw new Error(
                businesses.detail
                ||
                "Unable to load businesses."
            );
        }


        if (
            businesses.length === 0
        ) {
            listStatus.textContent =
                "No businesses found.";

            return;
        }


        listStatus.textContent =
            `${businesses.length} business(es) found.`;


        for (
            const business
            of businesses
        ) {
            businessGrid.appendChild(
                createBusinessCard(
                    business
                )
            );
        }
    }

    catch (error) {
        listStatus.textContent =
            `Error: ${error.message}`;
    }
}


function createBusinessCard(
    business
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "business-card";


    const heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        business.name;


    const address =
        document.createElement(
            "p"
        );

    address.className =
        "business-card-address";

    address.textContent =
        `${business.address}, ${business.city}, ${business.state}`;


    const rating =
        document.createElement(
            "div"
        );

    rating.className =
        "business-card-rating";

    rating.innerHTML =
        `
        <span class="business-stars">
            ${createStars(
                business.average_rating
            )}
        </span>

        <strong>
            ${formatRating(
                business.average_rating
            )}
        </strong>
        `;


    const stats =
        document.createElement(
            "div"
        );

    stats.className =
        "business-card-stats";

    stats.innerHTML =
        `
        <span>
            ${business.review_count}
            review${business.review_count === 1 ? "" : "s"}
        </span>

        <span>
            ${business.verified_percentage}%
            verified
        </span>
        `;


    const verifiedBar =
        document.createElement(
            "div"
        );

    verifiedBar.className =
        "business-mini-progress";

    verifiedBar.innerHTML =
        `
        <div
            class="business-mini-progress-fill"
            style="width: ${business.verified_percentage}%"
        ></div>
        `;


    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "business-card-button";

    button.textContent =
        "View Business";


    button.addEventListener(
        "click",
        function () {
            loadBusinessProfile(
                business.id
            );
        }
    );


    card.appendChild(
        heading
    );

    card.appendChild(
        address
    );

    card.appendChild(
        rating
    );

    card.appendChild(
        stats
    );

    card.appendChild(
        verifiedBar
    );

    card.appendChild(
        button
    );


    return card;
}


async function loadBusinessProfile(
    businessId
) {
    try {
        const response =
            await fetch(
                `/businesses/${businessId}`
            );

        const business =
            await response.json();


        if (!response.ok) {
            throw new Error(
                business.detail
                ||
                "Unable to load business."
            );
        }


        displayBusinessProfile(
            business
        );
    }

    catch (error) {
        listStatus.textContent =
            `Error: ${error.message}`;
    }
}


function displayBusinessProfile(
    business
) {
    businessListSection.classList.add(
        "hidden"
    );

    businessProfileSection.classList.remove(
        "hidden"
    );


    document.getElementById(
        "profile-business-name"
    ).textContent =
        business.name;


    document.getElementById(
        "profile-business-address"
    ).textContent =
        `${business.address}, ${business.city}, ${business.state}`;


    const ratingNumber =
        document.getElementById(
            "profile-average-rating-number"
        );


    if (
        business.average_rating === null
        || business.average_rating === undefined
    ) {
        ratingNumber.textContent =
            "—";
    }

    else {
        ratingNumber.textContent =
            business.average_rating.toFixed(
                1
            );
    }


    document.getElementById(
        "profile-stars"
    ).textContent =
        createStars(
            business.average_rating
        );


    document.getElementById(
        "profile-rating-review-count"
    ).textContent =
        `Based on ${business.review_count} review${business.review_count === 1 ? "" : "s"}`;


    document.getElementById(
        "profile-verified-percentage"
    ).textContent =
        `${business.verified_percentage}%`;


    document.getElementById(
        "verification-progress-fill"
    ).style.width =
        `${business.verified_percentage}%`;


    document.getElementById(
        "profile-verified-count"
    ).textContent =
        `${business.verified_review_count} of ${business.review_count} reviews are verified`;


    document.getElementById(
        "profile-review-count"
    ).textContent =
        business.review_count;


    document.getElementById(
        "profile-verified-total"
    ).textContent =
        business.verified_review_count;


    const unverifiedCount =
        business.review_count
        -
        business.verified_review_count;


    document.getElementById(
        "profile-unverified-total"
    ).textContent =
        unverifiedCount;


    displayReviews(
        business.reviews
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function displayReviews(
    reviews
) {
    const reviewsList =
        document.getElementById(
            "reviews-list"
        );


    reviewsList.innerHTML =
        "";


    if (
        reviews.length === 0
    ) {
        reviewsList.innerHTML =
            `
            <div class="empty-state">
                <h3>No reviews yet</h3>
                <p>
                    Be the first person to review this business.
                </p>
            </div>
            `;

        return;
    }


    for (
        const review
        of reviews
    ) {
        const reviewCard =
            document.createElement(
                "article"
            );

        reviewCard.className =
            "review-card";


        const topRow =
            document.createElement(
                "div"
            );

        topRow.className =
            "review-card-top";


        const rating =
            document.createElement(
                "span"
            );

        rating.className =
            "review-stars";

        rating.textContent =
            createStars(
                review.rating
            );


        const verificationBadge =
            document.createElement(
                "span"
            );


        if (
            review.verification_status
            === "verified"
        ) {
            verificationBadge.className =
                "verification-badge verified-badge";

            verificationBadge.textContent =
                "✓ Verified Purchase";
        }

        else {
            verificationBadge.className =
                "verification-badge unverified-badge";

            verificationBadge.textContent =
                "Unverified";
        }


        topRow.appendChild(
            rating
        );

        topRow.appendChild(
            verificationBadge
        );


        const body =
            document.createElement(
                "p"
            );

        body.className =
            "review-body";

        body.textContent =
            review.body;


        const date =
            document.createElement(
                "p"
            );

        date.className =
            "review-date";

        date.textContent =
            new Date(
                review.created_at
            ).toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );


        reviewCard.appendChild(
            topRow
        );

        reviewCard.appendChild(
            body
        );

        reviewCard.appendChild(
            date
        );


        reviewsList.appendChild(
            reviewCard
        );
    }
}


searchButton.addEventListener(
    "click",
    function () {
        loadBusinesses(
            searchInput.value.trim()
        );
    }
);


searchInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Enter"
        ) {
            loadBusinesses(
                searchInput.value.trim()
            );
        }
    }
);


backButton.addEventListener(
    "click",
    function () {
        businessProfileSection.classList.add(
            "hidden"
        );

        businessListSection.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


loadBusinesses();