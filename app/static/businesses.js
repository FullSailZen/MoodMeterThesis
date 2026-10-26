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

const historicalPeriodSelect =
    document.getElementById(
        "historical-period-select"
    );

const semanticQuestionInput =
    document.getElementById(
        "semantic-question"
    );

const semanticLimitSelect =
    document.getElementById(
        "semantic-limit"
    );

const semanticSearchButton =
    document.getElementById(
        "semantic-search-button"
    );

const semanticSearchStatus =
    document.getElementById(
        "semantic-search-status"
    );

const semanticResultsSection =
    document.getElementById(
        "semantic-results-section"
    );

const semanticResultsSummary =
    document.getElementById(
        "semantic-results-summary"
    );

const semanticResultsContainer =
    document.getElementById(
        "semantic-results"
    );

const semanticResultsHeading =
    semanticResultsSection
        .querySelector(
            ".reviews-heading h3"
        );


let currentBusinessId =
    null;

let historicalPeriod =
    "all";


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

    currentBusinessId =
        null;
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


function formatDateForApi(
    dateValue
) {
    const year =
        dateValue.getFullYear();

    const month =
        String(
            dateValue.getMonth()
            + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            dateValue.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        `${year}-${month}-${day}`
    );
}


function buildHistoricalSentimentUrl(
    businessId,
    period
) {
    const baseUrl =
        `/businesses/${businessId}/moodscore/history/visualization`;

    if (
        period === "all"
    ) {
        return baseUrl;
    }

    const days =
        Number(
            period
        );

    if (
        !Number.isInteger(
            days
        )
        ||
        days <= 0
    ) {
        return baseUrl;
    }

    const endDate =
        new Date();

    const startDate =
        new Date();

    startDate.setDate(
        startDate.getDate()
        -
        (
            days - 1
        )
    );

    const params =
        new URLSearchParams();

    params.set(
        "start_date",
        formatDateForApi(
            startDate
        )
    );

    params.set(
        "end_date",
        formatDateForApi(
            endDate
        )
    );

    return (
        baseUrl
        +
        "?"
        +
        params.toString()
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

        currentBusinessId =
            businessId;

        resetSemanticSearch();

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

        await Promise.all([
            loadMoodScore(
                businessId
            ),

            loadHistoricalSentiment(
                businessId,
                historicalPeriod
            ),

            loadReviewSummary(
                businessId
            )
        ]);

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


async function loadMoodScore(
    businessId
) {
    const loading =
        document.getElementById(
            "moodscore-loading"
        );

    const content =
        document.getElementById(
            "moodscore-content"
        );

    const unavailable =
        document.getElementById(
            "moodscore-unavailable"
        );

    const errorContainer =
        document.getElementById(
            "moodscore-error"
        );


    loading.classList.remove(
        "hidden"
    );

    content.classList.add(
        "hidden"
    );

    unavailable.classList.add(
        "hidden"
    );

    errorContainer.classList.add(
        "hidden"
    );


    try {
        const response =
            await fetch(
                `/businesses/${businessId}/moodscore`
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail
                ||
                "Unable to calculate MoodScore."
            );
        }


        loading.classList.add(
            "hidden"
        );


        if (
            result.moodscore === null
        ) {
            displayUnavailableMoodScore(
                result,
                unavailable
            );

            unavailable.classList.remove(
                "hidden"
            );

            return;
        }


        displayMoodScore(
            result
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

        unavailable.classList.add(
            "hidden"
        );

        errorContainer
            .classList
            .remove(
                "hidden"
            );

        document.getElementById(
            "moodscore-error-message"
        ).textContent =
            error.message;
    }
}


function displayUnavailableMoodScore(
    result,
    unavailable
) {
    const title =
        unavailable.querySelector(
            "h3"
        );

    const message =
        unavailable.querySelector(
            "p"
        );


    if (
        result.overall_sentiment
        === "insufficient_data"
        &&
        result.eligible_review_count > 0
    ) {
        title.textContent =
            "Not enough data yet";

        message.textContent =
            `MoodMeter requires at least 3 eligible verified reviews with completed sentiment analysis before displaying a MoodScore. ${result.eligible_review_count} of 3 eligible reviews currently available.`;

        return;
    }


    title.textContent =
        "MoodScore unavailable";

    message.textContent =
        "This business does not currently have any verified reviews with completed sentiment analysis.";
}


function displayMoodScore(
    result
) {
    document.getElementById(
        "moodscore-value"
    ).textContent =
        Number(
            result.moodscore
        ).toFixed(2);


    document.getElementById(
        "moodscore-sentiment"
    ).textContent =
        formatSentiment(
            result.overall_sentiment
        );


    document.getElementById(
        "moodscore-eligible-count"
    ).textContent =
        result.eligible_review_count;


    if (
        result.average_rating
        === null
    ) {
        document.getElementById(
            "moodscore-average-rating"
        ).textContent =
            "—";

    } else {
        document.getElementById(
            "moodscore-average-rating"
        ).textContent =
            `${Number(
                result.average_rating
            ).toFixed(2)} / 5`;
    }


    if (
        result.positive_sentiment_percentage
        === null
    ) {
        document.getElementById(
            "moodscore-positive-percentage"
        ).textContent =
            "—";

    } else {
        document.getElementById(
            "moodscore-positive-percentage"
        ).textContent =
            `${Number(
                result
                    .positive_sentiment_percentage
            ).toFixed(2)}%`;
    }


    document.getElementById(
        "moodscore-positive-count"
    ).textContent =
        `${result.positive_review_count} positive review${
            result.positive_review_count === 1
                ? ""
                : "s"
        }`;


    if (
        result.negative_sentiment_percentage
        === null
    ) {
        document.getElementById(
            "moodscore-negative-percentage"
        ).textContent =
            "—";

    } else {
        document.getElementById(
            "moodscore-negative-percentage"
        ).textContent =
            `${Number(
                result
                    .negative_sentiment_percentage
            ).toFixed(2)}%`;
    }


    document.getElementById(
        "moodscore-negative-count"
    ).textContent =
        `${result.negative_review_count} negative review${
            result.negative_review_count === 1
                ? ""
                : "s"
        }`;


    document.getElementById(
        "moodscore-theme-count"
    ).textContent =
        result.theme_count;


    document.getElementById(
        "moodscore-aspect-count"
    ).textContent =
        result.aspect_count;


    if (
        result.positive_aspect_percentage
        === null
    ) {
        document.getElementById(
            "moodscore-positive-aspect-percentage"
        ).textContent =
            "No theme data";

    } else {
        document.getElementById(
            "moodscore-positive-aspect-percentage"
        ).textContent =
            `${Number(
                result
                    .positive_aspect_percentage
            ).toFixed(2)}%`;
    }


    document.getElementById(
        "moodscore-positive-aspect-count"
    ).textContent =
        `${result.positive_aspect_count} positive topic${
            result.positive_aspect_count === 1
                ? ""
                : "s"
        }`;


    if (
        result.negative_aspect_percentage
        === null
    ) {
        document.getElementById(
            "moodscore-negative-aspect-percentage"
        ).textContent =
            "No theme data";

    } else {
        document.getElementById(
            "moodscore-negative-aspect-percentage"
        ).textContent =
            `${Number(
                result
                    .negative_aspect_percentage
            ).toFixed(2)}%`;
    }


    document.getElementById(
        "moodscore-negative-aspect-count"
    ).textContent =
        `${result.negative_aspect_count} negative topic${
            result.negative_aspect_count === 1
                ? ""
                : "s"
        }`;
}


async function loadHistoricalSentiment(
    businessId,
    period = "all"
) {
    const loading =
        document.getElementById(
            "historical-sentiment-loading"
        );

    const content =
        document.getElementById(
            "historical-sentiment-content"
        );

    const unavailable =
        document.getElementById(
            "historical-sentiment-unavailable"
        );

    const errorContainer =
        document.getElementById(
            "historical-sentiment-error"
        );

    const chart =
        document.getElementById(
            "historical-sentiment-chart"
        );


    loading.classList.remove(
        "hidden"
    );

    content.classList.add(
        "hidden"
    );

    unavailable.classList.add(
        "hidden"
    );

    errorContainer.classList.add(
        "hidden"
    );


    if (
        typeof Plotly
        === "undefined"
    ) {
        loading.classList.add(
            "hidden"
        );

        errorContainer.classList.remove(
            "hidden"
        );

        document.getElementById(
            "historical-sentiment-error-message"
        ).textContent =
            "Plotly could not be loaded.";

        return;
    }


    try {
        const url =
            buildHistoricalSentimentUrl(
                businessId,
                period
            );

        const response =
            await fetch(
                url
            );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail
                ||
                "Unable to load historical sentiment."
            );
        }


        loading.classList.add(
            "hidden"
        );


        if (
            result.record_count === 0
        ) {
            Plotly.purge(
                chart
            );

            const message =
                unavailable.querySelector(
                    "p"
                );

            if (
                period === "all"
            ) {
                message.textContent =
                    "This business does not currently have historical MoodScore results to display.";

            } else {
                message.textContent =
                    "This business does not have historical MoodScore results within the selected reporting period.";
            }

            unavailable.classList.remove(
                "hidden"
            );

            return;
        }


        const customData =
            result.dates.map(
                function (
                    dateValue,
                    index
                ) {
                    return [
                        result.overall_sentiments[
                            index
                        ],

                        result.eligible_review_counts[
                            index
                        ],

                        result.positive_sentiment_percentages[
                            index
                        ],

                        result.negative_sentiment_percentages[
                            index
                        ]
                    ];
                }
            );


        const trace = {
            x:
                result.dates,

            y:
                result.moodscores,

            type:
                "scatter",

            mode:
                "lines+markers",

            name:
                "MoodScore",

            line: {
                color:
                    "#FF3DA5",

                width:
                    3
            },

            marker: {
                color:
                    "#00A8FF",

                size:
                    9,

                line: {
                    color:
                        "#71D2FF",

                    width:
                        1
                }
            },

            customdata:
                customData,

            hovertemplate:
                "<b>%{x|%b %d, %Y %I:%M %p}</b>"
                +
                "<br>MoodScore: %{y:.2f} / 100"
                +
                "<br>Sentiment: %{customdata[0]}"
                +
                "<br>Eligible reviews: %{customdata[1]}"
                +
                "<br>Positive reviews: %{customdata[2]:.2f}%"
                +
                "<br>Negative reviews: %{customdata[3]:.2f}%"
                +
                "<extra></extra>"
        };


        const layout = {
            margin: {
                l: 55,
                r: 20,
                t: 20,
                b: 55
            },

            paper_bgcolor:
                "rgba(0, 0, 0, 0)",

            plot_bgcolor:
                "rgba(13, 6, 31, 0.45)",

            font: {
                color:
                    "#E6DDFF",

                family:
                    "Inter, Arial, Helvetica, sans-serif"
            },

            xaxis: {
                title:
                    "Date",

                gridcolor:
                    "rgba(125, 80, 224, 0.18)",

                linecolor:
                    "rgba(125, 80, 224, 0.55)",

                tickfont: {
                    color:
                        "#BCAEE2"
                }
            },

            yaxis: {
                title:
                    "MoodScore",

                range: [
                    0,
                    100
                ],

                gridcolor:
                    "rgba(125, 80, 224, 0.18)",

                linecolor:
                    "rgba(125, 80, 224, 0.55)",

                tickfont: {
                    color:
                        "#BCAEE2"
                }
            },

            hoverlabel: {
                bgcolor:
                    "#24134F",

                bordercolor:
                    "#7D50E0",

                font: {
                    color:
                        "#E6DDFF"
                }
            },

            showlegend:
                false
        };


        const config = {
            responsive:
                true,

            displaylogo:
                false,

            modeBarButtonsToRemove: [
                "lasso2d",
                "select2d"
            ]
        };


        await Plotly.newPlot(
            chart,
            [
                trace
            ],
            layout,
            config
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

        unavailable.classList.add(
            "hidden"
        );

        errorContainer.classList.remove(
            "hidden"
        );

        document.getElementById(
            "historical-sentiment-error-message"
        ).textContent =
            error.message;
    }
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
                    event.preventDefault();

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


        const footer =
            document.createElement(
                "div"
            );

        footer.className =
            "review-card-top";


        const reviewerInfo =
            document.createElement(
                "div"
            );


        const reviewerName =
            document.createElement(
                "p"
            );

        reviewerName.className =
            "review-date";

        reviewerName.textContent =
            `Reviewed by ${review.author_name}`;


        reviewerInfo.appendChild(
            reviewerName
        );

        reviewerInfo.appendChild(
            date
        );


        const reviewerLink =
            document.createElement(
                "a"
            );

        reviewerLink.href =
            `/reviewer-profile?user=${review.author_id}`;

        reviewerLink.className =
            "back-button";

        reviewerLink.textContent =
            "View Reviewer Profile";

        reviewerLink.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();
            }
        );

        reviewerLink.addEventListener(
            "keydown",
            function (event) {
                event.stopPropagation();
            }
        );


        footer.appendChild(
            reviewerInfo
        );

        footer.appendChild(
            reviewerLink
        );


        card.appendChild(
            top
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


function resetSemanticSearch() {
    semanticQuestionInput.value =
        "";

    semanticLimitSelect.value =
        "5";

    semanticSearchStatus.textContent =
        "";

    semanticResultsSummary.textContent =
        "";

    semanticResultsContainer.innerHTML =
        "";

    semanticResultsHeading.textContent =
        "AI Answer";

    semanticResultsSection
        .classList
        .add(
            "hidden"
        );
}


function createAgentAnswerCard(
    answer,
    supported,
    supportMessage
) {
    const card =
        document.createElement(
            "div"
        );

    card.className =
        "result-box";


    const heading =
        document.createElement(
            "h3"
        );

    if (supported) {
        heading.textContent =
            "MoodMeter Analysis";

    } else {
        heading.textContent =
            "Insufficient Review Evidence";
    }


    const answerText =
        document.createElement(
            "p"
        );

    answerText.className =
        "review-body";

    answerText.textContent =
        answer;


    const supportText =
        document.createElement(
            "p"
        );

    supportText.className =
        "score-secondary";

    supportText.textContent =
        supportMessage;


    card.appendChild(
        heading
    );

    card.appendChild(
        answerText
    );

    card.appendChild(
        supportText
    );


    return card;
}


function createEvidenceHeading() {
    const container =
        document.createElement(
            "div"
        );

    container.className =
        "reviews-heading";


    const heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        "Supporting Evidence";


    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        "These verified MoodMeter reviews were retrieved as relevant evidence used to ground the AI response.";


    container.appendChild(
        heading
    );

    container.appendChild(
        description
    );


    return container;
}


function createSemanticResultCard(
    result,
    position
) {
    const card =
        document.createElement(
            "div"
        );

    card.className =
        "result-box";


    const heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        `Supporting Review ${position}`;


    const similarity =
        document.createElement(
            "p"
        );

    similarity.className =
        "result-primary";

    similarity.textContent =
        `Semantic Similarity: ${(
            result.similarity
            * 100
        ).toFixed(2)}%`;


    const details =
        document.createElement(
            "p"
        );

    details.className =
        "score-secondary";

    details.textContent =
        `Review ID ${result.review_id} · ${result.rating}/5 · Verified`;


    const body =
        document.createElement(
            "p"
        );

    body.className =
        "review-body";

    body.textContent =
        result.body;


    card.appendChild(
        heading
    );

    card.appendChild(
        similarity
    );

    card.appendChild(
        details
    );

    card.appendChild(
        body
    );


    return card;
}


async function searchSemanticReviews() {
    if (!currentBusinessId) {
        semanticSearchStatus.textContent =
            "Open a business before asking MoodMeter.";

        return;
    }


    const question =
        semanticQuestionInput.value
            .trim();

    const limit =
        Number(
            semanticLimitSelect.value
        );


    if (!question) {
        semanticSearchStatus.textContent =
            "Enter a question about this business.";

        return;
    }


    semanticSearchButton.disabled =
        true;

    semanticSearchStatus.textContent =
        "Retrieving relevant reviews and generating a grounded answer...";

    semanticResultsSection
        .classList
        .add(
            "hidden"
        );

    semanticResultsContainer.innerHTML =
        "";


    try {
        const response =
            await fetch(
                `/businesses/${currentBusinessId}/semantic-search`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                question,

                            limit:
                                limit
                        })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {
            throw new Error(
                result.detail
                ||
                "MoodMeter AI analysis failed."
            );
        }


        if (
            result.supported
        ) {
            semanticSearchStatus.textContent =
                "MoodMeter analysis completed.";

        } else {
            semanticSearchStatus.textContent =
                "MoodMeter could not reliably answer this question from the available verified reviews.";
        }


        semanticResultsHeading.textContent =
            "AI Answer";


        semanticResultsSummary.textContent =
            `Question: "${result.question}"`;


        semanticResultsContainer
            .appendChild(
                createAgentAnswerCard(
                    result.answer,
                    result.supported,
                    result.support_message
                )
            );


        if (
            result.supported
            &&
            result.results.length > 0
        ) {
            semanticResultsContainer
                .appendChild(
                    createEvidenceHeading()
                );


            let position =
                1;


            for (
                const review
                of result.results
            ) {
                semanticResultsContainer
                    .appendChild(
                        createSemanticResultCard(
                            review,
                            position
                        )
                    );

                position += 1;
            }
        }


        semanticResultsSection
            .classList
            .remove(
                "hidden"
            );

    } catch (error) {
        semanticSearchStatus.textContent =
            `Error: ${error.message}`;

    } finally {
        semanticSearchButton.disabled =
            false;
    }
}


semanticSearchButton.addEventListener(
    "click",
    searchSemanticReviews
);


semanticQuestionInput.addEventListener(
    "keydown",
    function (event) {
        if (
            event.key === "Enter"
            &&
            !event.shiftKey
        ) {
            event.preventDefault();

            searchSemanticReviews();
        }
    }
);


historicalPeriodSelect.addEventListener(
    "change",
    function () {
        historicalPeriod =
            historicalPeriodSelect.value;

        if (
            currentBusinessId
        ) {
            loadHistoricalSentiment(
                currentBusinessId,
                historicalPeriod
            );
        }
    }
);


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
            event.preventDefault();

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