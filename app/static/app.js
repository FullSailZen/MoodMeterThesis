const form = document.getElementById("review-form");

const reviewSection = document.getElementById("review-section");
const progressSection = document.getElementById("progress-section");
const resultSection = document.getElementById("result-section");

const statusMessage = document.getElementById("status");
const submitButton = document.getElementById("submit-button");

const receiptInput = document.getElementById("receipt");
const purchaseImagesInput = document.getElementById("purchase-images");

const receiptPreview = document.getElementById("receipt-preview");
const purchasePreview = document.getElementById("purchase-preview");

const receiptDropZone = document.getElementById("receipt-drop-zone");
const purchaseDropZone = document.getElementById("purchase-drop-zone");

const newReviewButton = document.getElementById("new-review-button");


const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const maxFileSize = 10 * 1024 * 1024;


/*
Keeps track of product files independently from the browser's
native file input so repeated selections can be accumulated.
*/
let selectedPurchaseFiles = [];


/*
Prevents the programmatic update of purchaseImagesInput.files
from being treated like a new user selection.
*/
let updatingPurchaseInput = false;


function isValidImageFile(file) {
    return (
        allowedImageTypes.includes(file.type)
        && file.size <= maxFileSize
    );
}


function filesAreSame(fileA, fileB) {
    return (
        fileA.name === fileB.name
        && fileA.size === fileB.size
        && fileA.lastModified === fileB.lastModified
    );
}


function addPurchaseFiles(files) {
    for (const file of files) {
        if (!isValidImageFile(file)) {
            purchaseDropZone.classList.add("invalid-drop");

            statusMessage.textContent =
                "Product photos must be JPEG, PNG, or WebP and cannot exceed 10 MB each.";

            return false;
        }
    }


    for (const file of files) {
        const alreadySelected = selectedPurchaseFiles.some(
            existingFile => filesAreSame(existingFile, file)
        );

        if (!alreadySelected) {
            selectedPurchaseFiles.push(file);
        }
    }


    updatePurchaseInput();
    updatePurchasePreview();

    purchaseDropZone.classList.remove("invalid-drop");

    return true;
}


function updatePurchaseInput() {
    const dataTransfer = new DataTransfer();

    for (const file of selectedPurchaseFiles) {
        dataTransfer.items.add(file);
    }

    updatingPurchaseInput = true;

    purchaseImagesInput.files = dataTransfer.files;

    updatingPurchaseInput = false;
}


function updatePurchasePreview() {
    if (selectedPurchaseFiles.length === 0) {
        purchasePreview.textContent =
            "No product photos selected";

        return;
    }


    const names = selectedPurchaseFiles.map(
        file => file.name
    );


    purchasePreview.textContent =
        `✓ ${selectedPurchaseFiles.length} file(s): ${names.join(", ")}`;
}


function updateReceiptPreview() {
    const file = receiptInput.files[0];

    if (!file) {
        receiptPreview.textContent =
            "No receipt selected";

        return;
    }


    receiptPreview.textContent =
        `✓ ${file.name}`;

    receiptDropZone.classList.remove(
        "invalid-drop"
    );
}


receiptInput.addEventListener(
    "change",
    function () {
        const file = receiptInput.files[0];

        if (!file) {
            updateReceiptPreview();
            return;
        }


        if (!isValidImageFile(file)) {
            receiptDropZone.classList.add(
                "invalid-drop"
            );

            statusMessage.textContent =
                "Receipt must be JPEG, PNG, or WebP and cannot exceed 10 MB.";

            receiptInput.value = "";

            updateReceiptPreview();

            return;
        }


        updateReceiptPreview();
    }
);


purchaseImagesInput.addEventListener(
    "change",
    function () {
        if (updatingPurchaseInput) {
            return;
        }


        const newlySelectedFiles = Array.from(
            purchaseImagesInput.files
        );


        if (newlySelectedFiles.length === 0) {
            return;
        }


        addPurchaseFiles(
            newlySelectedFiles
        );
    }
);


function replaceReceiptFile(file) {
    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);

    receiptInput.files =
        dataTransfer.files;

    updateReceiptPreview();
}


function setupReceiptDropZone() {
    receiptDropZone.addEventListener(
        "dragover",
        function (event) {
            event.preventDefault();

            receiptDropZone.classList.add(
                "drag-over"
            );
        }
    );


    receiptDropZone.addEventListener(
        "dragleave",
        function () {
            receiptDropZone.classList.remove(
                "drag-over"
            );
        }
    );


    receiptDropZone.addEventListener(
        "drop",
        function (event) {
            event.preventDefault();

            receiptDropZone.classList.remove(
                "drag-over"
            );

            receiptDropZone.classList.remove(
                "invalid-drop"
            );


            const droppedFiles = Array.from(
                event.dataTransfer.files
            );


            if (droppedFiles.length === 0) {
                return;
            }


            const receiptFile =
                droppedFiles[0];


            if (!isValidImageFile(receiptFile)) {
                receiptDropZone.classList.add(
                    "invalid-drop"
                );

                statusMessage.textContent =
                    "Receipt must be JPEG, PNG, or WebP and cannot exceed 10 MB.";

                return;
            }


            replaceReceiptFile(
                receiptFile
            );
        }
    );
}


function setupPurchaseDropZone() {
    purchaseDropZone.addEventListener(
        "dragover",
        function (event) {
            event.preventDefault();

            purchaseDropZone.classList.add(
                "drag-over"
            );
        }
    );


    purchaseDropZone.addEventListener(
        "dragleave",
        function () {
            purchaseDropZone.classList.remove(
                "drag-over"
            );
        }
    );


    purchaseDropZone.addEventListener(
        "drop",
        function (event) {
            event.preventDefault();

            purchaseDropZone.classList.remove(
                "drag-over"
            );

            purchaseDropZone.classList.remove(
                "invalid-drop"
            );


            const droppedFiles = Array.from(
                event.dataTransfer.files
            );


            if (droppedFiles.length === 0) {
                return;
            }


            addPurchaseFiles(
                droppedFiles
            );
        }
    );
}


setupReceiptDropZone();
setupPurchaseDropZone();


function resetProgress() {
    const ids = [
        "progress-review",
        "progress-upload",
        "progress-analysis",
        "progress-product",
        "progress-verification"
    ];


    for (const id of ids) {
        const item =
            document.getElementById(id);

        item.classList.remove(
            "active",
            "complete",
            "error"
        );

        item.querySelector(
            ".progress-icon"
        ).textContent = "○";
    }
}


function setProgressActive(id) {
    const item =
        document.getElementById(id);

    item.classList.remove(
        "complete",
        "error"
    );

    item.classList.add(
        "active"
    );

    item.querySelector(
        ".progress-icon"
    ).textContent = "●";
}


function setProgressComplete(id) {
    const item =
        document.getElementById(id);

    item.classList.remove(
        "active",
        "error"
    );

    item.classList.add(
        "complete"
    );

    item.querySelector(
        ".progress-icon"
    ).textContent = "✓";
}


function setProgressError(id) {
    const item =
        document.getElementById(id);

    item.classList.remove(
        "active",
        "complete"
    );

    item.classList.add(
        "error"
    );

    item.querySelector(
        ".progress-icon"
    ).textContent = "✕";
}


function validateFiles(
    receipt,
    purchaseImages
) {
    if (!receipt) {
        throw new Error(
            "A receipt is required."
        );
    }


    if (!allowedImageTypes.includes(receipt.type)) {
        throw new Error(
            "Receipt must be JPEG, PNG, or WebP."
        );
    }


    if (receipt.size > maxFileSize) {
        throw new Error(
            "Receipt cannot exceed 10 MB."
        );
    }


    if (purchaseImages.length === 0) {
        throw new Error(
            "At least one product photo is required."
        );
    }


    for (const image of purchaseImages) {
        if (!allowedImageTypes.includes(image.type)) {
            throw new Error(
                "Product photos must be JPEG, PNG, or WebP."
            );
        }


        if (image.size > maxFileSize) {
            throw new Error(
                "Product photos cannot exceed 10 MB."
            );
        }
    }
}


function formatBooleanCheck(
    label,
    value
) {
    let resultText;
    let resultClass;


    if (value === true) {
        resultText = "Passed";
        resultClass = "check-pass";
    }

    else if (value === false) {
        resultText = "Not Passed";
        resultClass = "check-fail";
    }

    else {
        resultText = "Not Available";
        resultClass = "check-neutral";
    }


    const row =
        document.createElement("div");

    row.className =
        "check-row";


    const labelElement =
        document.createElement("span");

    labelElement.textContent =
        label;


    const resultElement =
        document.createElement("span");

    resultElement.textContent =
        resultText;

    resultElement.className =
        resultClass;


    row.appendChild(
        labelElement
    );

    row.appendChild(
        resultElement
    );


    return row;
}


function displayResults(data) {
    progressSection.classList.add(
        "hidden"
    );

    resultSection.classList.remove(
        "hidden"
    );


    const banner =
        document.getElementById(
            "verification-banner"
        );

    const verificationIcon =
        document.getElementById(
            "verification-icon"
        );

    const verificationTitle =
        document.getElementById(
            "verification-title"
        );

    const verificationDescription =
        document.getElementById(
            "verification-description"
        );


    const verified =
        data.verification_status ===
        "verified";


    banner.classList.remove(
        "verified",
        "unverified"
    );


    if (verified) {
        banner.classList.add(
            "verified"
        );

        verificationIcon.textContent =
            "✓";

        verificationTitle.textContent =
            "Review Verified";

        verificationDescription.textContent =
            "MoodMeter was able to verify the submitted purchase evidence.";
    }

    else {
        banner.classList.add(
            "unverified"
        );

        verificationIcon.textContent =
            "!";

        verificationTitle.textContent =
            "Review Unverified";

        verificationDescription.textContent =
            "MoodMeter could not verify all required evidence for this review.";
    }


    const analysis =
        data.analysis;


    document.getElementById(
        "result-business-name"
    ).textContent =
        analysis.business_name ||
        "Business not identified";


    const locationParts = [
        analysis.street_address,
        analysis.city,
        analysis.state,
        analysis.postal_code
    ].filter(Boolean);


    document.getElementById(
        "result-business-location"
    ).textContent =
        locationParts.join(", ");


    const confidence =
        Math.round(
            analysis.confidence_score * 100
        );


    document.getElementById(
        "result-confidence"
    ).textContent =
        `${confidence}%`;


    document.getElementById(
        "result-date"
    ).textContent =
        analysis.transaction_date ||
        "Not determined";


    document.getElementById(
        "result-time"
    ).textContent =
        analysis.transaction_time ||
        "Not determined";


    document.getElementById(
        "result-receipt-number"
    ).textContent =
        analysis.receipt_number ||
        "Not determined";


    let totalText =
        "Not determined";


    if (
        analysis.total_amount !== null
        && analysis.total_amount !== undefined
    ) {
        totalText =
            `$${Number(
                analysis.total_amount
            ).toFixed(2)}`;
    }


    document.getElementById(
        "result-total"
    ).textContent =
        totalText;


    const checksContainer =
        document.getElementById(
            "verification-checks"
        );


    checksContainer.innerHTML = "";


    checksContainer.appendChild(
        formatBooleanCheck(
            "Receipt readable",
            data.verification_checks
                .receipt_readable
        )
    );


    checksContainer.appendChild(
        formatBooleanCheck(
            "Business matched",
            data.verification_checks
                .business_match
        )
    );


    checksContainer.appendChild(
        formatBooleanCheck(
            "Transaction date identified",
            data.verification_checks
                .transaction_date_present
        )
    );


    checksContainer.appendChild(
        formatBooleanCheck(
            "Product matched",
            data.verification_checks
                .product_match
        )
    );


    const duplicateRow =
        document.createElement("div");

    duplicateRow.className =
        "check-row";


    const duplicateLabel =
        document.createElement("span");

    duplicateLabel.textContent =
        "Previously uploaded evidence";


    const duplicateValue =
        document.createElement("span");


    if (data.duplicate_evidence) {
        duplicateValue.textContent =
            "Detected";

        duplicateValue.className =
            "check-neutral";
    }

    else {
        duplicateValue.textContent =
            "Not Detected";

        duplicateValue.className =
            "check-pass";
    }


    duplicateRow.appendChild(
        duplicateLabel
    );

    duplicateRow.appendChild(
        duplicateValue
    );


    checksContainer.appendChild(
        duplicateRow
    );


    const itemsContainer =
        document.getElementById(
            "purchased-items"
        );


    itemsContainer.innerHTML = "";


    if (
        analysis.purchased_items.length === 0
    ) {
        itemsContainer.textContent =
            "No purchased items were identified.";
    }

    else {
        for (
            const item
            of analysis.purchased_items
        ) {
            const row =
                document.createElement("div");

            row.className =
                "item-row";


            const nameColumn =
                document.createElement("div");


            const itemName =
                document.createElement("div");

            itemName.className =
                "item-name";

            itemName.textContent =
                item.name ||
                "Unknown item";


            const itemUpc =
                document.createElement("div");

            itemUpc.className =
                "item-secondary";

            itemUpc.textContent =
                item.upc
                    ? `UPC: ${item.upc}`
                    : "UPC unavailable";


            nameColumn.appendChild(
                itemName
            );

            nameColumn.appendChild(
                itemUpc
            );


            const quantityColumn =
                document.createElement("div");

            quantityColumn.textContent =
                item.quantity !== null
                    ? `Qty: ${item.quantity}`
                    : "Qty: —";


            const priceColumn =
                document.createElement("div");


            if (
                item.line_total !== null
                && item.line_total !== undefined
            ) {
                priceColumn.textContent =
                    `$${Number(
                        item.line_total
                    ).toFixed(2)}`;
            }

            else {
                priceColumn.textContent =
                    "Price unavailable";
            }


            row.appendChild(
                nameColumn
            );

            row.appendChild(
                quantityColumn
            );

            row.appendChild(
                priceColumn
            );


            itemsContainer.appendChild(
                row
            );
        }
    }


    document.getElementById(
        "product-description"
    ).textContent =
        analysis.purchase_photo_description ||
        "No product description available.";


    const productMatch =
        document.getElementById(
            "product-match-result"
        );


    if (
        analysis.purchase_photo_matches_receipt
        === true
    ) {
        productMatch.textContent =
            "✓ Product photo matches the receipt.";
    }

    else if (
        analysis.purchase_photo_matches_receipt
        === false
    ) {
        productMatch.textContent =
            "✕ Product photo does not match the receipt.";
    }

    else {
        productMatch.textContent =
            "Product match could not be determined.";
    }


    const notesList =
        document.getElementById(
            "analysis-notes"
        );


    notesList.innerHTML = "";


    if (analysis.notes.length === 0) {
        const item =
            document.createElement("li");

        item.textContent =
            "No additional analysis notes.";

        notesList.appendChild(
            item
        );
    }

    else {
        for (
            const note
            of analysis.notes
        ) {
            const item =
                document.createElement("li");

            item.textContent =
                note;

            notesList.appendChild(
                item
            );
        }
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


form.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();


        const token =
            document.getElementById(
                "token"
            ).value.trim();


        const businessName =
            document.getElementById(
                "business-name"
            ).value.trim();


        const streetAddress =
            document.getElementById(
                "street-address"
            ).value.trim();


        const city =
            document.getElementById(
                "city"
            ).value.trim();


        const state =
            document.getElementById(
                "state"
            ).value.trim();


        const rating =
            Number(
                document.getElementById(
                    "rating"
                ).value
            );


        const reviewBody =
            document.getElementById(
                "review-body"
            ).value.trim();


        const receipt =
            receiptInput.files[0];


        const purchaseImages =
            selectedPurchaseFiles;


        try {
            if (!token) {
                throw new Error(
                    "Authentication token is required."
                );
            }

            if (!businessName) {
                throw new Error(
                    "Business name is required."
                );
            }

            if (!streetAddress) {
                throw new Error(
                    "Street address is required."
                );
            }

            if (!city) {
                throw new Error(
                    "City is required."
                );
            }

            if (!state) {
                throw new Error(
                    "State is required."
                );
            }

            if (
                rating < 1
                || rating > 5
            ) {
                throw new Error(
                    "Select a rating."
                );
            }

            if (!reviewBody) {
                throw new Error(
                    "Review text is required."
                );
            }


            validateFiles(
                receipt,
                purchaseImages
            );


            reviewSection.classList.add(
                "hidden"
            );

            progressSection.classList.remove(
                "hidden"
            );

            resultSection.classList.add(
                "hidden"
            );


            resetProgress();

            submitButton.disabled =
                true;


            setProgressActive(
                "progress-review"
            );


            statusMessage.textContent =
                "Creating your review...";


            const reviewResponse =
                await fetch(
                    "/reviews/",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            business_name:
                                businessName,

                            street_address:
                                streetAddress,

                            city:
                                city,

                            state:
                                state.toUpperCase(),

                            body:
                                reviewBody,

                            rating:
                                rating
                        })
                    }
                );


            const reviewResult =
                await reviewResponse.json();


            if (!reviewResponse.ok) {
                setProgressError(
                    "progress-review"
                );

                throw new Error(
                    reviewResult.detail ||
                    "Review creation failed."
                );
            }


            setProgressComplete(
                "progress-review"
            );


            setProgressActive(
                "progress-upload"
            );


            statusMessage.textContent =
                "Uploading your purchase evidence...";


            const evidenceData =
                new FormData();


            evidenceData.append(
                "review_id",
                reviewResult.id
            );


            evidenceData.append(
                "receipt",
                receipt
            );


            for (
                const image
                of purchaseImages
            ) {
                evidenceData.append(
                    "purchase_images",
                    image
                );
            }


            setProgressComplete(
                "progress-upload"
            );


            setProgressActive(
                "progress-analysis"
            );


            statusMessage.textContent =
                "Analyzing the receipt and product photos...";


            const evidenceResponse =
                await fetch(
                    "/evidence/analyze",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            evidenceData
                    }
                );


            const evidenceResult =
                await evidenceResponse.json();


            if (!evidenceResponse.ok) {
                setProgressError(
                    "progress-analysis"
                );

                throw new Error(
                    evidenceResult.detail ||
                    "Evidence analysis failed."
                );
            }


            setProgressComplete(
                "progress-analysis"
            );


            setProgressActive(
                "progress-product"
            );


            statusMessage.textContent =
                "Checking product information...";


            setProgressComplete(
                "progress-product"
            );


            setProgressActive(
                "progress-verification"
            );


            statusMessage.textContent =
                "Finalizing verification...";


            setProgressComplete(
                "progress-verification"
            );


            statusMessage.textContent =
                "Verification complete.";


            displayResults(
                evidenceResult
            );
        }

        catch (error) {
            statusMessage.textContent =
                `Error: ${error.message}`;

            progressSection.classList.remove(
                "hidden"
            );

            reviewSection.classList.remove(
                "hidden"
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        finally {
            submitButton.disabled =
                false;
        }
    }
);


newReviewButton.addEventListener(
    "click",
    function () {
        const token =
            document.getElementById(
                "token"
            ).value;


        form.reset();

        selectedPurchaseFiles = [];


        document.getElementById(
            "token"
        ).value =
            token;


        updatePurchaseInput();


        receiptPreview.textContent =
            "No receipt selected";

        purchasePreview.textContent =
            "No product photos selected";


        receiptDropZone.classList.remove(
            "drag-over",
            "invalid-drop"
        );

        purchaseDropZone.classList.remove(
            "drag-over",
            "invalid-drop"
        );


        resetProgress();


        resultSection.classList.add(
            "hidden"
        );

        progressSection.classList.add(
            "hidden"
        );

        reviewSection.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);