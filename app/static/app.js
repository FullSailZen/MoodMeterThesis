const form = document.getElementById("review-form");
const statusMessage = document.getElementById("status");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    statusMessage.textContent = "Submitting review...";

    const token = document.getElementById("token").value.trim();
    const businessId = Number(
        document.getElementById("business-id").value
    );

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

    try {
        const reviewResponse = await fetch("/reviews/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                business_id: businessId,
                body: reviewBody,
                rating: rating
            })
        });

        if (!reviewResponse.ok) {
            const error = await reviewResponse.json();
            throw new Error(
                error.detail || "Review submission failed"
            );
        }

        const review = await reviewResponse.json();

        statusMessage.textContent =
            "Review created. Uploading evidence...";

        const evidenceData = new FormData();

        evidenceData.append(
            "review_id",
            review.id
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

        if (!evidenceResponse.ok) {
            const error = await evidenceResponse.json();
            throw new Error(
                error.detail || "Evidence submission failed"
            );
        }

        const evidenceResult =
            await evidenceResponse.json();

        console.log(evidenceResult);

        statusMessage.textContent =
            `Review ${review.id} submitted successfully.`;

        form.reset();

    } catch (error) {
        statusMessage.textContent =
            `Error: ${error.message}`;
    }
});