const originalDisplayResults =
    window.displayResults;


window.displayResults = function (data) {
    originalDisplayResults(data);


    displaySelectedBusiness();

    displayEvidenceBusiness(
        data
    );

    displaySentimentAnalysis(
        data
    );
};


function displaySelectedBusiness() {
    const selectedBusinessName =
        document.getElementById(
            "business-name"
        ).value.trim();

    const selectedStreetAddress =
        document.getElementById(
            "street-address"
        ).value.trim();

    const selectedCity =
        document.getElementById(
            "city"
        ).value.trim();

    const selectedState =
        document.getElementById(
            "state"
        ).value.trim();


    document.getElementById(
        "result-selected-business-name"
    ).textContent =
        selectedBusinessName
        ||
        "Business not provided";


    const selectedLocationParts = [
        selectedStreetAddress,
        selectedCity,
        selectedState
    ].filter(Boolean);


    document.getElementById(
        "result-selected-business-location"
    ).textContent =
        selectedLocationParts.join(", ");
}


function displayEvidenceBusiness(data) {
    const analysis =
        data.analysis;


    document.getElementById(
        "result-evidence-business-name"
    ).textContent =
        analysis.business_name
        ||
        "Business not identified";


    const evidenceLocationParts = [
        analysis.street_address,
        analysis.city,
        analysis.state,
        analysis.postal_code
    ].filter(Boolean);


    document.getElementById(
        "result-evidence-business-location"
    ).textContent =
        evidenceLocationParts.join(", ");
}


function displaySentimentAnalysis(data) {
    const status =
        document.getElementById(
            "result-sentiment-status"
        );

    const explanation =
        document.getElementById(
            "result-sentiment-message"
        );

    const themesContainer =
        document.getElementById(
            "result-sentiment-themes"
        );

    const aspectsContainer =
        document.getElementById(
            "result-sentiment-aspects"
        );


    status.classList.remove(
        "check-pass",
        "check-fail",
        "check-neutral"
    );


    if (
        data.sentiment_status
        === "analyzed"
    ) {
        const sentiment =
            data.sentiment || "";

        status.textContent =
            sentiment
                .charAt(0)
                .toUpperCase()
            +
            sentiment.slice(1);


        if (
            sentiment
            === "positive"
        ) {
            status.classList.add(
                "check-pass"
            );
        } else {
            status.classList.add(
                "check-fail"
            );
        }

    } else if (
        data.sentiment_status
        === "failed"
    ) {
        status.textContent =
            "Analysis Failed";

        status.classList.add(
            "check-fail"
        );

    } else {
        status.textContent =
            "Not Eligible";

        status.classList.add(
            "check-neutral"
        );
    }


    explanation.textContent =
        data.sentiment_message;


    themesContainer.innerHTML =
        "";


    if (
        data.sentiment_themes
        &&
        data.sentiment_themes.length
        > 0
    ) {

        for (
            const theme
            of data.sentiment_themes
        ) {
            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                theme;

            themesContainer.appendChild(
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

        themesContainer.appendChild(
            item
        );
    }


    aspectsContainer.innerHTML =
        "";


    if (
        data.sentiment_aspects
        &&
        data.sentiment_aspects.length
        > 0
    ) {

        for (
            const aspect
            of data.sentiment_aspects
        ) {
            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "check-row";


            const aspectName =
                document.createElement(
                    "span"
                );

            aspectName.textContent =
                aspect.aspect;


            const aspectSentiment =
                document.createElement(
                    "span"
                );

            aspectSentiment.textContent =
                aspect.sentiment
                    .charAt(0)
                    .toUpperCase()
                +
                aspect.sentiment.slice(1);


            if (
                aspect.sentiment
                === "positive"
            ) {
                aspectSentiment.className =
                    "check-pass";
            } else {
                aspectSentiment.className =
                    "check-fail";
            }


            row.appendChild(
                aspectName
            );

            row.appendChild(
                aspectSentiment
            );

            aspectsContainer.appendChild(
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


        const text =
            document.createElement(
                "span"
            );

        text.textContent =
            "No aspect results available.";


        row.appendChild(
            text
        );

        aspectsContainer.appendChild(
            row
        );
    }
}