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

const searchStatus =
    document.getElementById(
        "business-search-status"
    );

const backButton =
    document.getElementById(
        "back-to-businesses"
    );


function setBusinessUrl(
    businessId
) {
    const url =
        new URL(
            window.location.href
        );

    url.searchParams.set(
        "business_id",
        String(
            businessId
        )
    );

    window.history.pushState(
        {
            businessId:
                Number(
                    businessId
                )
        },
        "",
        url.pathname
        +
        "?"
        +
        url.searchParams
            .toString()
    );
}


function clearBusinessUrl() {
    const url =
        new URL(
            window.location.href
        );

    url.searchParams.delete(
        "business_id"
    );

    const queryString =
        url.searchParams
            .toString();

    window.history.pushState(
        {},
        "",
        url.pathname
        +
        (
            queryString
                ? `?${queryString}`
                : ""
        )
    );
}


function getBusinessIdFromUrl() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const value =
        params.get(
            "business_id"
        );

    if (!value) {
        return null;
    }

    const businessId =
        Number(
            value
        );

    if (
        !Number.isInteger(
            businessId
        )
        ||
        businessId <= 0
    ) {
        return null;
    }

    return businessId;
}


function showBusinessList() {
    businessProfileSection
        .classList
        .add(
            "hidden"
        );

    businessListSection
        .classList
        .remove(
            "hidden"
        );
}


function createStars(
    rating
) {
    if (
        rating === null
        ||
        rating === undefined
    ) {
        return "☆☆☆☆☆";
    }

    const roundedRating =
        Math.round(
            rating
        );

    return (
        "★".repeat(
            roundedRating
        )
        +
        "☆".repeat(
            5 - roundedRating
        )
    );
}


function formatSentiment(
    sentiment
) {
    if (!sentiment) {
        return "";
    }

    return (
        sentiment
            .charAt(0)
            .toUpperCase()
        +
        sentiment.slice(1)
    );
}


async function loadBusinesses(
    searchTerm = ""
) {
    searchStatus.textContent =
        "Loading businesses...";

    businessGrid.innerHTML =
        "";

    try {
        let url =
            "/businesses/";

        if (
            searchTerm.trim()
        ) {
            url += (
                "?q="
                +
                encodeURIComponent(
                    searchTerm.trim()
                )
            );
        }

        const response =
            await fetch(
                url
            );

        const businesses =
            await response.json();

        if (!response.ok) {
            throw new Error(
                businesses.detail
                ||
                "Unable to load businesses."
            );
        }

        searchStatus.textContent =
            "";

        if (
            businesses.length
            === 0
        ) {
            businessGrid.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No businesses found
                    </h3>

                    <p>
                        Try another business name.
                    </p>

                </div>
            `;

            return;
        }

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

    } catch (error) {
        searchStatus.textContent =
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


    const name =
        document.createElement(
            "h3"
        );

    name.textContent =
        business.name;


    const address =
        document.createElement(
            "p"
        );

    address.className =
        "business-card-address";

    address.textContent = [
        business.address,
        business.city,
        business.state
    ]
        .filter(Boolean)
        .join(", ");


    const ratingContainer =
        document.createElement(
            "div"
        );

    ratingContainer.className =
        "business-card-rating";


    const stars =
        document.createElement(
            "div"
        );

    stars.className =
        "business-stars";

    stars.textContent =
        createStars(
            business.average_rating
        );


    const ratingText =
        document.createElement(
            "span"
        );

    ratingText.className =
        "score-secondary";


    if (
        business.average_rating
        === null
    ) {
        ratingText.textContent =
            "No ratings yet";

    } else {
        ratingText.textContent =
            `${business.average_rating} / 5`;
    }


    ratingContainer.appendChild(
        stars
    );

    ratingContainer.appendChild(
        ratingText
    );


    const stats =
        document.createElement(
            "div"
        );

    stats.className =
        "business-card-stats";


    const reviewCount =
        document.createElement(
            "span"
        );

    reviewCount.textContent =
        `${business.review_count} review${
            business.review_count === 1
                ? ""
                : "s"
        }`;


    const verifiedPercentage =
        document.createElement(
            "span"
        );

    verifiedPercentage.textContent =
        `${business.verified_percentage}% verified`;


    stats.appendChild(
        reviewCount
    );

    stats.appendChild(
        verifiedPercentage
    );


    const progress =
        document.createElement(
            "div"
        );

    progress.className =
        "business-mini-progress";


    const progressFill =
        document.createElement(
            "div"
        );

    progressFill.className =
        "business-mini-progress-fill";

    progressFill.style.width =
        `${business.verified_percentage}%`;


    progress.appendChild(
        progressFill
    );


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
        name
    );

    card.appendChild(
        address
    );

    card.appendChild(
        ratingContainer
    );

    card.appendChild(
        stats
    );

    card.appendChild(
        progress
    );

    card.appendChild(
        button
    );


    return card;
}


async function loadBusinessProfile(
    businessId,
    updateUrl = true
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

        businessListSection
            .classList
            .add(
                "hidden"
            );

        businessProfileSection
            .classList
            .remove(
                "hidden"
            );

        if (updateUrl) {
            setBusinessUrl(
                businessId
            );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        await loadReviewSummary(
            businessId
        );

    } catch (error) {
        searchStatus.textContent =
            `Error: ${error.message}`;
    }
}


function displayBusinessProfile(
    business
) {
    document.getElementById(
        "business-profile-name"
    ).textContent =
        business.name;


    document.getElementById(
        "business-profile-address"
    ).textContent = [
        business.address,
        business.city,
        business.state
    ]
        .filter(Boolean)
        .join(", ");


    const averageRating =
        document.getElementById(
            "profile-average-rating"
        );


    if (
        business.average_rating
        === null
    ) {
        averageRating.textContent =
            "—";

    } else {
        averageRating.textContent =
            business.average_rating;
    }


    document.getElementById(
        "profile-stars"
    ).textContent =
        createStars(
            business.average_rating
        );


    document.getElementById(
        "profile-rating-count"
    ).textContent =
        `Based on ${business.review_count} review${
            business.review_count === 1
                ? ""
                : "s"
        }`;


    document.getElementById(
        "profile-verified-percentage"
    ).textContent =
        `${business.verified_percentage}%`;


    document.getElementById(
        "profile-verification-progress"
    ).style.width =
        `${business.verified_percentage}%`;


    document.getElementById(
        "profile-total-reviews"
    ).textContent =
        business.review_count;


    document.getElementById(
        "profile-verified-reviews"
    ).textContent =
        business
            .verified_review_count;


    document.getElementById(
        "profile-unverified-reviews"
    ).textContent =
        (
            business.review_count
            -
            business
                .verified_review_count
        );


    displayReviews(
        business.reviews
    );
}


function openReview(
    reviewId
) {
    window.location.href =
        "/review-page"
        +
        `?review_id=${reviewId}`;
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
        !reviews
        ||
        reviews.length === 0
    ) {
        reviewsList.innerHTML = `
            <div class="empty-state">

                <h3>
                    No reviews yet
                </h3>

                <p>
                    This business has not received
                    any MoodMeter reviews yet.
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

        card.style.cursor =
            "pointer";

        card.tabIndex =
            0;

        card.setAttribute(
            "role",
            "link"
        );

        card.setAttribute(
            "aria-label",
            `Open review ${review.id}`
        );


        card.addEventListener(
            "click",
            function () {
                openReview(
                    review.id
                );
            }
        );


        card.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Enter"
                    ||
                    event.key === " "
                ) {
                    event
                        .preventDefault();

                    openReview(
                        review.id
                    );
                }
            }
        );


        const top =
            document.createElement(
                "div"
            );

        top.className =
            "review-card-top";


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


        const badges =
            document.createElement(
                "div"
            );

        badges.style.display =
            "flex";

        badges.style.gap =
            "8px";

        badges.style.flexWrap =
            "wrap";


        const verificationBadge =
            document.createElement(
                "span"
            );

        verificationBadge.className =
            "verification-badge";


        if (
            review.verification_status
            === "verified"
        ) {
            verificationBadge
                .classList
                .add(
                    "verified-badge"
                );

            verificationBadge.textContent =
                "Verified Purchase";

        } else {
            verificationBadge
                .classList
                .add(
                    "unverified-badge"
                );

            verificationBadge.textContent =
                "Unverified";
        }


        badges.appendChild(
            verificationBadge
        );


        if (
            review.sentiment
        ) {
            const sentimentBadge =
                document.createElement(
                    "span"
                );

            sentimentBadge.className =
                "verification-badge";

            sentimentBadge.textContent =
                formatSentiment(
                    review.sentiment
                );


            if (
                review.sentiment
                === "positive"
            ) {
                sentimentBadge
                    .classList
                    .add(
                        "verified-badge"
                    );

            } else {
                sentimentBadge
                    .classList
                    .add(
                        "unverified-badge"
                    );
            }


            badges.appendChild(
                sentimentBadge
            );
        }


        top.appendChild(
            stars
        );

        top.appendChild(
            badges
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
                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"
                }
            );


        card.appendChild(
            top
        );

        card.appendChild(
            body
        );

        card.appendChild(
            date
        );


        reviewsList.appendChild(
            card
        );
    }
}


async function loadReviewSummary(
    businessId
) {
    const loading =
        document.getElementById(
            "ai-summary-loading"
        );

    const content =
        document.getElementById(
            "ai-summary-content"
        );

    const errorContainer =
        document.getElementById(
            "ai-summary-error"
        );


    loading.classList.remove(
        "hidden"
    );

    content.classList.add(
        "hidden"
    );

    errorContainer.classList.add(
        "hidden"
    );


    try {
        const response =
            await fetch(
                `/businesses/${businessId}/summary`
            );

        const summary =
            await response.json();

        if (!response.ok) {
            throw new Error(
                summary.detail
                ||
                "Unable to generate review summary."
            );
        }


        displayReviewSummary(
            summary
        );

        loading.classList.add(
            "hidden"
        );

        content.classList.remove(
            "hidden"
        );

    } catch (error) {
        loading.classList.add(
            "hidden"
        );

        content.classList.add(
            "hidden"
        );

        errorContainer
            .classList
            .remove(
                "hidden"
            );

        document.getElementById(
            "ai-summary-error-message"
        ).textContent =
            error.message;
    }
}


function displayReviewSummary(
    summary
) {
    document.getElementById(
        "ai-summary-text"
    ).textContent =
        summary.summary;


    document.getElementById(
        "ai-overall-sentiment"
    ).textContent =
        formatSentiment(
            summary
                .overall_sentiment
        );


    document.getElementById(
        "ai-review-count"
    ).textContent =
        summary.review_count;


    populateThemeList(
        "ai-positive-themes",
        summary.positive_themes,
        "No recurring positive themes yet."
    );


    populateThemeList(
        "ai-negative-themes",
        summary.negative_themes,
        "No recurring concerns yet."
    );


    populateThemeList(
        "ai-recurring-themes",
        summary.recurring_themes,
        "Not enough recurring themes yet."
    );
}


function populateThemeList(
    elementId,
    themes,
    emptyMessage
) {
    const list =
        document.getElementById(
            elementId
        );

    list.innerHTML =
        "";


    if (
        !themes
        ||
        themes.length === 0
    ) {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            emptyMessage;

        list.appendChild(
            item
        );

        return;
    }


    for (
        const theme
        of themes
    ) {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            theme;

        list.appendChild(
            item
        );
    }
}


searchButton.addEventListener(
    "click",
    function () {
        loadBusinesses(
            searchInput.value
        );
    }
);


searchInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Enter"
        ) {
            event
                .preventDefault();

            loadBusinesses(
                searchInput.value
            );
        }
    }
);


backButton.addEventListener(
    "click",
    function () {
        clearBusinessUrl();

        showBusinessList();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


window.addEventListener(
    "popstate",
    function () {
        const businessId =
            getBusinessIdFromUrl();

        if (businessId) {
            loadBusinessProfile(
                businessId,
                false
            );

            return;
        }

        showBusinessList();

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    }
);


const initialBusinessId =
    getBusinessIdFromUrl();


loadBusinesses();


if (
    initialBusinessId
) {
    loadBusinessProfile(
        initialBusinessId,
        false
    );
}