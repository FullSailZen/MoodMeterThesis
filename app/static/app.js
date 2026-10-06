const form = document.getElementById("review-form");
const statusMessage = document.getElementById("status");

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const maxFileSize = 10 * 1024 * 1024;


form.addEventListener("submit", async function (event) {
    event.preventDefault();

    statusMessage.textContent = "Submitting review...";

    const token = document
        .getElementById("token")
        .value
        .trim();

    const businessName = document
        .getElementById("business-name")
        .value
        .trim();

    const streetAddress = document
        .getElementById("street-address")
        .value
        .trim();

    const city = document
        .getElementById("city")
        .value
        .trim();

    const state = document
        .getElementById("state")
        .value
        .trim();

    const rating = Number(
        document.getElementById("rating").value
    );

    const reviewBody = document
        .getElementById("review-body")
        .value
        .trim();

    const receipt = document
        .getElementById("receipt")
        .files[0];

    const purchaseImages = document
        .getElementById("purchase-images")
        .files;


    if (!reviewBody) {
        statusMessage.textContent =
            "Review text is required.";

        return;
    }


    if (!receipt) {
        statusMessage.textContent =
            "A receipt is required.";

        return;
    }


    if (!allowedImageTypes.includes(receipt.type)) {
        statusMessage.textContent =
            "Receipt must be a JPEG, PNG, or WebP image.";

        return;
    }


    if (receipt.size > maxFileSize) {
        statusMessage.textContent =
            "Receipt cannot exceed 10 MB.";

        return;
    }


    if (purchaseImages.length === 0) {
        statusMessage.textContent =
            "At least one purchase evidence image is required.";

        return;
    }


    for (const image of purchaseImages) {
        if (!allowedImageTypes.includes(image.type)) {
            statusMessage.textContent =
                "Purchase evidence must be JPEG, PNG, or WebP.";

            return;
        }

        if (image.size > maxFileSize) {
            statusMessage.textContent =
                "Purchase evidence images cannot exceed 10 MB.";

            return;
        }
    }


    try {
        statusMessage.textContent =
            "Creating review...";


        const reviewResponse = await fetch(
            "/reviews/",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    business_name: businessName,
                    street_address: streetAddress,
                    city: city,
                    state: state,
                    body: reviewBody,
                    rating: rating
                })
            }
        );


        const reviewResult =
            await reviewResponse.json();


        if (!reviewResponse.ok) {
            throw new Error(
                reviewResult.detail ||
                "Review submission failed."
            );
        }


        statusMessage.textContent =
            "Review created. Uploading evidence...";


        const evidenceData = new FormData();

        evidenceData.append(
            "review_id",
            reviewResult.id
        );

        evidenceData.append(
            "receipt",
            receipt
        );


        for (const image of purchaseImages) {
            evidenceData.append(
                "purchase_images",
                image
            );
        }


        const evidenceResponse = await fetch(
            "/evidence/analyze",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                },

                body: evidenceData
            }
        );


        const evidenceResult =
            await evidenceResponse.json();


        if (!evidenceResponse.ok) {
            throw new Error(
                evidenceResult.detail ||
                "Evidence submission failed."
            );
        }


        console.log(evidenceResult);


        statusMessage.textContent =
            `Review ${reviewResult.id} submitted successfully.`;


        form.reset();

    } catch (error) {
        statusMessage.textContent =
            `Error: ${error.message}`;
    }
});