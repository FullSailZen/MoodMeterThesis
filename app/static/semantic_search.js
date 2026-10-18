const businessIdInput =
    document.getElementById(
        "business-id"
    );

const questionInput =
    document.getElementById(
        "semantic-question"
    );

const limitSelect =
    document.getElementById(
        "semantic-limit"
    );

const searchButton =
    document.getElementById(
        "semantic-search-button"
    );

const searchStatus =
    document.getElementById(
        "semantic-search-status"
    );

const resultsSection =
    document.getElementById(
        "semantic-results-section"
    );

const resultsSummary =
    document.getElementById(
        "semantic-results-summary"
    );

const resultsContainer =
    document.getElementById(
        "semantic-results"
    );


function getBusinessIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const businessId =
        Number(
            params.get(
                "business_id"
            )
        );

    if (
        Number.isInteger(
            businessId
        )
        &&
        businessId > 0
    ) {

        businessIdInput.value =
            String(
                businessId
            );
    }
}


function createResultCard(
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
        `Result ${position}`;


    const similarity =
        document.createElement(
            "p"
        );

    similarity.className =
        "result-primary";

    similarity.textContent =
        `Similarity: ${(
            result.similarity
            * 100
        ).toFixed(2)}%`;


    const reviewId =
        document.createElement(
            "p"
        );

    reviewId.className =
        "score-secondary";

    reviewId.textContent =
        `Review ID: ${result.review_id}`;


    const rating =
        document.createElement(
            "p"
        );

    rating.className =
        "score-secondary";

    rating.textContent =
        `Rating: ${result.rating} / 5`;


    const verification =
        document.createElement(
            "p"
        );

    verification.className =
        "score-secondary";

    verification.textContent =
        `Verification: ${result.verification_status}`;


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
        reviewId
    );

    card.appendChild(
        rating
    );

    card.appendChild(
        verification
    );

    card.appendChild(
        body
    );


    return card;
}


async function searchReviews() {

    const businessId =
        Number(
            businessIdInput.value
        );

    const question =
        questionInput.value
            .trim();

    const limit =
        Number(
            limitSelect.value
        );


    if (
        !Number.isInteger(
            businessId
        )
        ||
        businessId <= 0
    ) {

        searchStatus.textContent =
            "Enter a valid business ID.";

        return;
    }


    if (!question) {

        searchStatus.textContent =
            "Enter a question.";

        return;
    }


    searchButton.disabled =
        true;

    searchStatus.textContent =
        "Searching stored review embeddings...";

    resultsSection.classList.add(
        "hidden"
    );

    resultsContainer.innerHTML =
        "";


    try {

        const response =
            await fetch(
                `/semantic-retrieval/businesses/${businessId}`,
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
                "Semantic retrieval failed."
            );
        }


        searchStatus.textContent =
            "Semantic retrieval completed.";


        resultsSummary.textContent =
            `${result.result_count} review${

                result.result_count
                === 1

                    ? ""

                    : "s"

            } retrieved for: "${result.question}"`;


        if (
            result.results.length
            === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.className =
                "empty-state";


            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                "No embedded reviews found";


            const message =
                document.createElement(
                    "p"
                );

            message.textContent =
                "This business does not currently have verified reviews with stored embeddings.";


            empty.appendChild(
                heading
            );

            empty.appendChild(
                message
            );


            resultsContainer.appendChild(
                empty
            );
        }

        else {

            let position =
                1;


            for (
                const review
                of result.results
            ) {

                resultsContainer.appendChild(
                    createResultCard(
                        review,
                        position
                    )
                );

                position += 1;
            }
        }


        resultsSection.classList.remove(
            "hidden"
        );


        resultsSection.scrollIntoView({
            behavior:
                "smooth",
            block:
                "start"
        });

    }

    catch (error) {

        searchStatus.textContent =
            `Error: ${error.message}`;
    }

    finally {

        searchButton.disabled =
            false;
    }
}


searchButton.addEventListener(
    "click",
    searchReviews
);


questionInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
            &&
            !event.shiftKey
        ) {

            event.preventDefault();

            searchReviews();
        }
    }
);


getBusinessIdFromUrl();