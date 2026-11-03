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


function createAnswerCard(
    result
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
        "MoodMeter AI Answer";


    const answer =
        document.createElement(
            "p"
        );

    answer.className =
        "review-body";

    answer.textContent =
        result.answer;


    const support =
        document.createElement(
            "p"
        );

    support.className =
        "score-secondary";

    support.textContent =
        result.support_message;


    card.appendChild(
        heading
    );

    card.appendChild(
        answer
    );

    card.appendChild(
        support
    );


    return card;
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


async function getResponseData(
    response
) {

    try {

        return await response.json();

    }

    catch {

        return null;
    }
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
        "Searching verified MoodMeter reviews...";

    resultsSection.classList.add(
        "hidden"
    );

    resultsContainer.innerHTML =
        "";


    try {

        const response =
            await fetch(
                `/businesses/${businessId}/semantic-search`,
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
            await getResponseData(
                response
            );


        if (!response.ok) {

            let message =
                "MoodMeter could not complete "
                +
                "the AI review search.";


            if (
                result
                &&
                result.detail
            ) {

                message =
                    result.detail;
            }


            throw new Error(
                message
            );
        }


        if (!result) {

            throw new Error(
                "MoodMeter received an invalid "
                +
                "response from the server."
            );
        }


        searchStatus.textContent =
            result.supported
                ? "AI analysis completed."
                : (
                    "Not enough relevant review "
                    +
                    "information was found."
                );


        resultsSummary.textContent =
            `${result.result_count} supporting review${

                result.result_count
                === 1

                    ? ""

                    : "s"

            } found for: "${result.question}"`;


        resultsContainer.appendChild(
            createAnswerCard(
                result
            )
        );


        if (
            result.results
            &&
            result.results.length > 0
        ) {

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

        if (
            error instanceof TypeError
        ) {

            searchStatus.textContent =
                "MoodMeter could not connect "
                +
                "to the server. Check your "
                +
                "connection and try again.";
        }

        else {

            searchStatus.textContent =
                `Error: ${error.message}`;
        }
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