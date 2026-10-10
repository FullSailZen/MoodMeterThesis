const loadingSection =
    document.getElementById(
        "review-loading"
    );

const errorSection =
    document.getElementById(
        "review-error"
    );

const content =
    document.getElementById(
        "review-content"
    );

const backButton =
    document.getElementById(
        "back-to-business"
    );


let currentBusinessId =
    null;


function getReviewId() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const value =
        params.get(
            "review_id"
        );

    if (!value) {
        return null;
    }

    const reviewId =
        Number(value);

    if (
        !Number.isInteger(
            reviewId
        )
        ||
        reviewId <= 0
    ) {
        return null;
    }

    return reviewId;
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
        return "Not available";
    }

    return (
        sentiment
            .charAt(0)
            .toUpperCase()
        +
        sentiment.slice(1)
    );
}


function formatBoolean(
    value
) {
    if (
        value === true
    ) {
        return "Pass";
    }

    if (
        value === false
    ) {
        return "Fail";
    }

    return "Not determined";
}


function formatMoney(
    amount,
    currency
) {
    if (
        amount === null
        ||
        amount === undefined
    ) {
        return "Not identified";
    }

    if (
        currency === "USD"
    ) {
        return `$${Number(
            amount
        ).toFixed(2)}`;
    }

    return `${amount} ${
        currency || ""
    }`.trim();
}


function showError(
    message
) {
    loadingSection
        .classList
        .add(
            "hidden"
        );

    content
        .classList
        .add(
            "hidden"
        );

    errorSection
        .classList
        .remove(
            "hidden"
        );

    document.getElementById(
        "review-error-message"
    ).textContent =
        message;
}


function createBadge(
    text,
    positive
) {
    const badge =
        document.createElement(
            "span"
        );

    badge.className =
        "verification-badge";

    badge.classList.add(
        positive
            ? "verified-badge"
            : "unverified-badge"
    );

    badge.textContent =
        text;

    return badge;
}


function displayReview(
    review
) {
    currentBusinessId =
        review.business.id;


    document.getElementById(
        "review-business-name"
    ).textContent =
        review.business.name;


    document.getElementById(
        "review-business-address"
    ).textContent = [
        review.business.address,
        review.business.city,
        review.business.state
    ]
        .filter(Boolean)
        .join(", ");


    document.getElementById(
        "review-stars"
    ).textContent =
        createStars(
            review.rating
        );


    document.getElementById(
        "review-body"
    ).textContent =
        review.body;


    document.getElementById(
        "review-date"
    ).textContent =
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


    const badges =
        document.getElementById(
            "review-badges"
        );

    badges.innerHTML =
        "";


    const verified =
        review.verification_status
        === "verified";


    badges.appendChild(
        createBadge(
            verified
                ? "Verified Purchase"
                : "Unverified",
            verified
        )
    );


    if (
        review.sentiment
    ) {
        badges.appendChild(
            createBadge(
                formatSentiment(
                    review.sentiment
                    .sentiment
                ),
                review.sentiment
                    .sentiment
                === "positive"
            )
        );
    }


    displaySentiment(
        review.sentiment
    );

    displayEvidence(
        review
    );


    loadingSection
        .classList
        .add(
            "hidden"
        );

    errorSection
        .classList
        .add(
            "hidden"
        );

    content
        .classList
        .remove(
            "hidden"
        );
}


function displaySentiment(
    sentiment
) {
    const section =
        document.getElementById(
            "sentiment-section"
        );

    if (!sentiment) {
        section
            .classList
            .add(
                "hidden"
            );

        return;
    }


    section
        .classList
        .remove(
            "hidden"
        );


    const overall =
        document.getElementById(
            "sentiment-overall"
        );

    overall.textContent =
        formatSentiment(
            sentiment.sentiment
        );

    overall.className =
        (
            sentiment.sentiment
            === "positive"
        )
            ? "check-pass"
            : "check-fail";


    const themes =
        document.getElementById(
            "sentiment-themes"
        );

    themes.innerHTML =
        "";


    if (
        sentiment.themes
        &&
        sentiment.themes.length
        > 0
    ) {
        for (
            const theme
            of sentiment.themes
        ) {
            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                theme;

            themes.appendChild(
                item
            );
        }

    } else {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            "No themes available.";

        themes.appendChild(
            item
        );
    }


    const aspects =
        document.getElementById(
            "sentiment-aspects"
        );

    aspects.innerHTML =
        "";


    if (
        sentiment.aspects
        &&
        sentiment.aspects.length
        > 0
    ) {
        for (
            const aspect
            of sentiment.aspects
        ) {
            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "check-row";


            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                aspect.aspect;


            const value =
                document.createElement(
                    "span"
                );

            value.textContent =
                formatSentiment(
                    aspect.sentiment
                );

            value.className =
                (
                    aspect.sentiment
                    === "positive"
                )
                    ? "check-pass"
                    : "check-fail";


            row.appendChild(
                name
            );

            row.appendChild(
                value
            );

            aspects.appendChild(
                row
            );
        }

    } else {
        const row =
            document.createElement(
                "div"
            );

        row.className =
            "check-row";

        row.textContent =
            "No aspect results available.";

        aspects.appendChild(
            row
        );
    }
}


function displayEvidence(
    review
) {
    const evidenceSection =
        document.getElementById(
            "evidence-section"
        );

    const noEvidenceSection =
        document.getElementById(
            "no-evidence-section"
        );


    if (!review.evidence) {
        evidenceSection
            .classList
            .add(
                "hidden"
            );

        noEvidenceSection
            .classList
            .remove(
                "hidden"
            );

        return;
    }


    evidenceSection
        .classList
        .remove(
            "hidden"
        );

    noEvidenceSection
        .classList
        .add(
            "hidden"
        );


    const analysis =
        review.evidence.analysis;


    document.getElementById(
        "selected-business-name"
    ).textContent =
        review.business.name;


    document.getElementById(
        "selected-business-location"
    ).textContent = [
        review.business.address,
        review.business.city,
        review.business.state
    ]
        .filter(Boolean)
        .join(", ");


    document.getElementById(
        "evidence-business-name"
    ).textContent =
        analysis.business_name
        ||
        "Not identified";


    document.getElementById(
        "evidence-business-location"
    ).textContent = [
        analysis.street_address,
        analysis.city,
        analysis.state,
        analysis.postal_code
    ]
        .filter(Boolean)
        .join(", ");


    const confidence =
        analysis.confidence_score;


    document.getElementById(
        "evidence-confidence"
    ).textContent =
        (
            confidence
            === null
            ||
            confidence
            === undefined
        )
            ? "—"
            : `${Math.round(
                confidence * 100
            )}%`;


    const verificationStatus =
        document.getElementById(
            "detail-verification-status"
        );

    verificationStatus.textContent =
        review.verification_status
            .charAt(0)
            .toUpperCase()
        +
        review.verification_status
            .slice(1);

    verificationStatus.className =
        (
            review.verification_status
            === "verified"
        )
            ? "check-pass"
            : "check-fail";


    displayVerificationChecks(
        review.evidence
            .verification_checks
    );


    document.getElementById(
        "receipt-date"
    ).textContent =
        analysis.transaction_date
        ||
        "Not identified";


    document.getElementById(
        "receipt-time"
    ).textContent =
        analysis.transaction_time
        ||
        "Not identified";


    document.getElementById(
        "receipt-number"
    ).textContent =
        analysis.receipt_number
        ||
        "Not identified";


    document.getElementById(
        "receipt-total"
    ).textContent =
        formatMoney(
            analysis.total_amount,
            analysis.currency
        );


    displayPurchasedItems(
        analysis.purchased_items
        || []
    );


    document.getElementById(
        "product-description"
    ).textContent =
        analysis
            .purchase_photo_description
        ||
        "No product description available.";


    document.getElementById(
        "matched-product-name"
    ).textContent =
        analysis
            .matched_purchase_item_name
            ? (
                "Matched receipt item: "
                +
                analysis
                    .matched_purchase_item_name
            )
            : (
                "No matched receipt item "
                + "was identified."
            );


    document.getElementById(
        "matched-product-upc"
    ).textContent =
        analysis
            .matched_purchase_item_upc
            ? (
                "UPC: "
                +
                analysis
                    .matched_purchase_item_upc
            )
            : "UPC not identified";


    const productMatch =
        document.getElementById(
            "product-match"
        );


    if (
        analysis
            .purchase_photo_matches_receipt
        === true
    ) {
        productMatch.textContent =
            "Product photo matches "
            + "a receipt item.";

        productMatch.className =
            "check-pass";

    } else if (
        analysis
            .purchase_photo_matches_receipt
        === false
    ) {
        productMatch.textContent =
            "Product photo does not "
            + "match a receipt item.";

        productMatch.className =
            "check-fail";

    } else {
        productMatch.textContent =
            "Product match could not "
            + "be determined.";

        productMatch.className =
            "check-neutral";
    }


    displayNotes(
        analysis.notes
        || []
    );
}


function displayVerificationChecks(
    checks
) {
    const container =
        document.getElementById(
            "verification-checks"
        );

    container.innerHTML =
        "";


    const values = [
        [
            "Business Match",
            checks.business_match
        ],
        [
            "Product Match",
            checks.product_match
        ],
        [
            "Transaction Date",
            checks
                .transaction_date_present
        ],
        [
            "Duplicate Evidence",
            checks.duplicate_evidence
                ? false
                : true
        ],
        [
            "Receipt Readable",
            checks.receipt_readable
        ]
    ];


    for (
        const [
            label,
            value
        ]
        of values
    ) {
        const row =
            document.createElement(
                "div"
            );

        row.className =
            "check-row";


        const name =
            document.createElement(
                "span"
            );

        name.textContent =
            label;


        const result =
            document.createElement(
                "span"
            );

        result.textContent =
            formatBoolean(
                value
            );


        if (
            value === true
        ) {
            result.className =
                "check-pass";

        } else if (
            value === false
        ) {
            result.className =
                "check-fail";

        } else {
            result.className =
                "check-neutral";
        }


        row.appendChild(
            name
        );

        row.appendChild(
            result
        );

        container.appendChild(
            row
        );
    }
}


function displayPurchasedItems(
    items
) {
    const container =
        document.getElementById(
            "purchased-items"
        );

    container.innerHTML =
        "";


    if (
        !items
        ||
        items.length === 0
    ) {
        const empty =
            document.createElement(
                "p"
            );

        empty.textContent =
            "No purchased items "
            + "were identified.";

        container.appendChild(
            empty
        );

        return;
    }


    for (
        const item
        of items
    ) {
        const row =
            document.createElement(
                "div"
            );

        row.className =
            "item-row";


        const name =
            document.createElement(
                "div"
            );

        name.className =
            "item-name";

        name.textContent =
            item.name
            ||
            "Unnamed item";


        const quantity =
            document.createElement(
                "div"
            );

        quantity.className =
            "item-secondary";

        quantity.textContent =
            (
                item.quantity
                !== null
                &&
                item.quantity
                !== undefined
            )
                ? `Qty: ${item.quantity}`
                : "Quantity unavailable";


        const price =
            document.createElement(
                "div"
            );

        price.className =
            "item-secondary";


        if (
            item.line_total
            !== null
            &&
            item.line_total
            !== undefined
        ) {
            price.textContent =
                `$${Number(
                    item.line_total
                ).toFixed(2)}`;

        } else if (
            item.unit_price
            !== null
            &&
            item.unit_price
            !== undefined
        ) {
            price.textContent =
                `$${Number(
                    item.unit_price
                ).toFixed(2)}`;

        } else {
            price.textContent =
                "Price unavailable";
        }


        row.appendChild(
            name
        );

        row.appendChild(
            quantity
        );

        row.appendChild(
            price
        );

        container.appendChild(
            row
        );
    }
}


function displayNotes(
    notes
) {
    const list =
        document.getElementById(
            "analysis-notes"
        );

    list.innerHTML =
        "";


    if (
        !notes
        ||
        notes.length === 0
    ) {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            "No additional analysis "
            + "notes were returned.";

        list.appendChild(
            item
        );

        return;
    }


    for (
        const note
        of notes
    ) {
        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            note;

        list.appendChild(
            item
        );
    }
}


async function loadReview() {
    const reviewId =
        getReviewId();


    if (!reviewId) {
        showError(
            "A valid review ID "
            + "was not provided."
        );

        return;
    }


    try {
        const response =
            await fetch(
                `/reviews/${reviewId}/details`
            );

        const review =
            await response.json();


        if (!response.ok) {
            throw new Error(
                review.detail
                ||
                "Unable to load review."
            );
        }


        displayReview(
            review
        );

    } catch (error) {
        showError(
            error.message
        );
    }
}


backButton.addEventListener(
    "click",
    function () {
        if (currentBusinessId) {
            window.location.href =
                "/businesses-page"
                +
                `?business_id=${
                    currentBusinessId
                }`;

            return;
        }

        window.location.href =
            "/businesses-page";
    }
);


loadReview();