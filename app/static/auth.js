let moodMeterGoogleClientId = null;


function getTokenInput() {
    return document.getElementById(
        "token"
    );
}


function hideDeveloperTokenField() {
    const tokenInput =
        getTokenInput();

    if (!tokenInput) {
        return;
    }

    const field =
        tokenInput.closest(
            ".field"
        );

    if (field) {
        field.style.display =
            "none";
    }
}


function setMoodMeterToken(
    token
) {
    const tokenInput =
        getTokenInput();

    if (tokenInput) {
        tokenInput.value =
            token;
    }

    sessionStorage.setItem(
        "moodmeter_access_token",
        token
    );
}


function clearMoodMeterToken() {
    const tokenInput =
        getTokenInput();

    if (tokenInput) {
        tokenInput.value =
            "";
    }

    sessionStorage.removeItem(
        "moodmeter_access_token"
    );
}


function restoreStoredToken() {
    const storedToken =
        sessionStorage.getItem(
            "moodmeter_access_token"
        );

    if (!storedToken) {
        return null;
    }

    const tokenInput =
        getTokenInput();

    if (tokenInput) {
        tokenInput.value =
            storedToken;
    }

    return storedToken;
}


function createAuthInterface() {
    const reviewForm =
        document.getElementById(
            "review-form"
        );

    if (!reviewForm) {
        return;
    }

    const authSection =
        document.createElement(
            "section"
        );

    authSection.id =
        "google-auth-section";

    authSection.className =
        "form-section";


    const heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        "Your Account";


    const description =
        document.createElement(
            "p"
        );

    description.className =
        "section-description";

    description.textContent =
        "Sign in with Google before submitting your review.";


    const signedOutContainer =
        document.createElement(
            "div"
        );

    signedOutContainer.id =
        "signed-out-container";


    const googleButton =
        document.createElement(
            "div"
        );

    googleButton.id =
        "google-signin-button";


    const signedInContainer =
        document.createElement(
            "div"
        );

    signedInContainer.id =
        "signed-in-container";

    signedInContainer.className =
        "hidden";


    const userStatus =
        document.createElement(
            "p"
        );

    userStatus.id =
        "signed-in-user";

    userStatus.className =
        "result-primary";


    const logoutButton =
        document.createElement(
            "button"
        );

    logoutButton.type =
        "button";

    logoutButton.id =
        "google-logout-button";

    logoutButton.className =
        "back-button";

    logoutButton.textContent =
        "Sign Out";


    const authStatus =
        document.createElement(
            "p"
        );

    authStatus.id =
        "auth-status";

    authStatus.className =
        "status-message";


    signedOutContainer.appendChild(
        googleButton
    );

    signedInContainer.appendChild(
        userStatus
    );

    signedInContainer.appendChild(
        logoutButton
    );


    authSection.appendChild(
        heading
    );

    authSection.appendChild(
        description
    );

    authSection.appendChild(
        signedOutContainer
    );

    authSection.appendChild(
        signedInContainer
    );

    authSection.appendChild(
        authStatus
    );


    reviewForm.insertBefore(
        authSection,
        reviewForm.firstChild
    );


    logoutButton.addEventListener(
        "click",
        handleLogout
    );
}


function showSignedOut() {
    const signedOutContainer =
        document.getElementById(
            "signed-out-container"
        );

    const signedInContainer =
        document.getElementById(
            "signed-in-container"
        );

    if (signedOutContainer) {
        signedOutContainer.classList.remove(
            "hidden"
        );
    }

    if (signedInContainer) {
        signedInContainer.classList.add(
            "hidden"
        );
    }
}


function showSignedIn(
    user
) {
    const signedOutContainer =
        document.getElementById(
            "signed-out-container"
        );

    const signedInContainer =
        document.getElementById(
            "signed-in-container"
        );

    const signedInUser =
        document.getElementById(
            "signed-in-user"
        );

    if (signedOutContainer) {
        signedOutContainer.classList.add(
            "hidden"
        );
    }

    if (signedInContainer) {
        signedInContainer.classList.remove(
            "hidden"
        );
    }

    if (signedInUser) {
        signedInUser.textContent =
            `Signed in as ${user.name}`;
    }
}


function setAuthStatus(
    message
) {
    const authStatus =
        document.getElementById(
            "auth-status"
        );

    if (authStatus) {
        authStatus.textContent =
            message;
    }
}


async function loadGoogleClientId() {
    const response =
        await fetch(
            "/auth/config"
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail
            ||
            "Unable to load Google authentication configuration."
        );
    }

    moodMeterGoogleClientId =
        data.google_client_id;
}


function renderGoogleButton() {
    if (
        !window.google
        ||
        !window.google.accounts
        ||
        !moodMeterGoogleClientId
    ) {
        return false;
    }

    const buttonContainer =
        document.getElementById(
            "google-signin-button"
        );

    if (!buttonContainer) {
        return false;
    }

    buttonContainer.innerHTML =
        "";


    google.accounts.id.initialize({
        client_id:
            moodMeterGoogleClientId,

        callback:
            handleGoogleCredentialResponse
    });


    google.accounts.id.renderButton(
        buttonContainer,
        {
            theme:
                "filled_blue",

            size:
                "large",

            shape:
                "pill",

            text:
                "signin_with",

            width:
                280
        }
    );


    return true;
}


function waitForGoogleLibrary() {
    let attempts = 0;

    const interval =
        setInterval(
            function () {
                attempts += 1;

                if (
                    renderGoogleButton()
                    ||
                    attempts >= 50
                ) {
                    clearInterval(
                        interval
                    );
                }

                if (
                    attempts >= 50
                    &&
                    !window.google
                ) {
                    setAuthStatus(
                        "Google Sign-In could not be loaded."
                    );
                }
            },
            100
        );
}


async function handleGoogleCredentialResponse(
    response
) {
    setAuthStatus(
        "Signing in..."
    );

    try {
        const loginResponse =
            await fetch(
                "/auth/google",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            credential:
                                response.credential
                        })
                }
            );


        const data =
            await loginResponse.json();


        if (!loginResponse.ok) {
            throw new Error(
                data.detail
                ||
                "Google sign-in failed."
            );
        }


        setMoodMeterToken(
            data.access_token
        );

        showSignedIn(
            data.user
        );

        setAuthStatus(
            "You are signed in and ready to submit a review."
        );
    }

    catch (error) {
        clearMoodMeterToken();

        showSignedOut();

        setAuthStatus(
            `Sign-in error: ${error.message}`
        );
    }
}


async function validateStoredToken(
    token
) {
    try {
        const response =
            await fetch(
                "/auth/me",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {
            clearMoodMeterToken();

            showSignedOut();

            return;
        }


        const user =
            await response.json();


        showSignedIn(
            user
        );

        setAuthStatus(
            "You are signed in and ready to submit a review."
        );
    }

    catch {
        clearMoodMeterToken();

        showSignedOut();
    }
}


function handleLogout() {
    clearMoodMeterToken();

    showSignedOut();

    setAuthStatus(
        "You have been signed out."
    );


    if (
        window.google
        &&
        google.accounts
        &&
        google.accounts.id
    ) {
        google.accounts.id.disableAutoSelect();
    }
}


async function initializeAuthentication() {
    hideDeveloperTokenField();

    createAuthInterface();


    const storedToken =
        restoreStoredToken();


    if (storedToken) {
        await validateStoredToken(
            storedToken
        );
    }

    else {
        showSignedOut();
    }


    try {
        await loadGoogleClientId();

        waitForGoogleLibrary();
    }

    catch (error) {
        setAuthStatus(
            `Authentication setup error: ${error.message}`
        );
    }
}


window.handleGoogleCredentialResponse =
    handleGoogleCredentialResponse;


document.addEventListener(
    "DOMContentLoaded",
    initializeAuthentication
);