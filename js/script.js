/* =====================================================
   CIVICVOICE - MAIN JAVASCRIPT
   ===================================================== */


/* =====================================================
   BACKEND API URL
   ===================================================== */

const API_BASE_URL =
    "https://civicvoice-ymbf.onrender.com";


/* =====================================================
   GET LOGGED-IN USERNAME
   ===================================================== */

function getLoggedInUsername() {

    // 1. Try localStorage
    try {

        const username =
            localStorage.getItem("username");

        if (username) {
            return username;
        }

    } catch (error) {

        console.log(
            "localStorage unavailable."
        );

    }


    // 2. Try sessionStorage
    try {

        const username =
            sessionStorage.getItem("username");

        if (username) {
            return username;
        }

    } catch (error) {

        console.log(
            "sessionStorage unavailable."
        );

    }


    // 3. Try username from URL
    try {

        const urlParams =
            new URLSearchParams(window.location.search);

        const username =
            urlParams.get("username");

        if (username) {

            // Try saving it again
            try {
                sessionStorage.setItem(
                    "username",
                    username
                );
            } catch (error) {
                console.log(
                    "Could not save username to sessionStorage."
                );
            }

            return username;
        }

    } catch (error) {

        console.log(
            "Could not read username from URL."
        );

    }


    return null;
}


/* =====================================================
   SAVE LOGGED-IN USER
   ===================================================== */

function saveLoggedInUser(username, name) {

    // Save in localStorage
    try {

        localStorage.setItem(
            "username",
            username
        );

        localStorage.setItem(
            "name",
            name || ""
        );

    } catch (error) {

        console.log(
            "localStorage unavailable."
        );

    }


    // Save in sessionStorage
    try {

        sessionStorage.setItem(
            "username",
            username
        );

        sessionStorage.setItem(
            "name",
            name || ""
        );

    } catch (error) {

        console.log(
            "sessionStorage unavailable."
        );

    }
}


/* =====================================================
   REGISTRATION
   ===================================================== */

const registerForm =
    document.querySelector("#registerForm");

if (registerForm) {

    const name =
        document.querySelector("#name");

    const username =
        document.querySelector("#username");

    const phone =
        document.querySelector("#phone");

    const email =
        document.querySelector("#email");

    const password =
        document.querySelector("#password");

    const confirmPassword =
        document.querySelector("#confirmPassword");

    const message =
        document.querySelector("#message");


    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            message.textContent = "";
            message.className = "";


            if (name.value.trim() === "") {

                message.textContent =
                    "Please enter your name.";

                message.className =
                    "error";

                return;
            }


            if (username.value.trim() === "") {

                message.textContent =
                    "Please create a username.";

                message.className =
                    "error";

                return;
            }


            if (
                phone.value.trim() === "" &&
                email.value.trim() === ""
            ) {

                message.textContent =
                    "Please enter your phone number or email.";

                message.className =
                    "error";

                return;
            }


            if (phone.value.trim() !== "") {

                if (!/^[0-9]{10}$/.test(
                        phone.value.trim()
                    )) {

                    message.textContent =
                        "Please enter a valid 10-digit phone number.";

                    message.className =
                        "error";

                    return;
                }
            }


            if (email.value.trim() !== "") {

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        email.value.trim()
                    )) {

                    message.textContent =
                        "Please enter a valid email address.";

                    message.className =
                        "error";

                    return;
                }
            }


            if (password.value === "") {

                message.textContent =
                    "Please enter a password.";

                message.className =
                    "error";

                return;
            }


            if (
                password.value !==
                confirmPassword.value
            ) {

                message.textContent =
                    "Passwords do not match.";

                message.className =
                    "error";

                return;
            }


            const userData = {

                name: name.value.trim(),

                username: username.value.trim(),

                phone: phone.value.trim(),

                email: email.value.trim(),

                password: password.value

            };


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/register`, {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify(
                                userData
                            )
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    message.textContent =
                        "Account created successfully! You can now login.";

                    message.className =
                        "success";

                } else {

                    message.textContent =
                        data.message ||
                        "Could not create account.";

                    message.className =
                        "error";
                }


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Could not connect to the CivicVoice server.";

                message.className =
                    "error";
            }

        }
    );

}


/* =====================================================
   LOGIN
   ===================================================== */

const loginForm =
    document.querySelector("#loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const login =
                document
                .querySelector("#login")
                .value
                .trim();


            const password =
                document
                .querySelector("#password")
                .value;


            const loginMessage =
                document.querySelector(
                    "#loginMessage"
                );


            if (
                login === "" ||
                password === ""
            ) {

                loginMessage.textContent =
                    "Please enter your login details.";

                loginMessage.className =
                    "error";

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/login`, {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                login: login,

                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    saveLoggedInUser(
                        data.username,
                        data.name
                    );


                    loginMessage.textContent =
                        "Login successful!";

                    loginMessage.className =
                        "success";


                    /*
                     * Add username to the URL.
                     * This acts as a backup on phones
                     * where browser storage is restricted.
                     */

                    setTimeout(
                        function() {

                            window.location.href =
                                "index.html?username=" +
                                encodeURIComponent(
                                    data.username
                                );

                        },
                        500
                    );


                } else {

                    loginMessage.textContent =
                        data.message ||
                        "Login failed.";

                    loginMessage.className =
                        "error";
                }


            } catch (error) {

                console.error(error);

                loginMessage.textContent =
                    "Could not connect to the CivicVoice server.";

                loginMessage.className =
                    "error";
            }

        }
    );

}


/* =====================================================
   REPORT A PROBLEM
   ===================================================== */

const reportForm =
    document.querySelector("#reportForm");

if (reportForm) {

    reportForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const username =
                getLoggedInUsername();


            if (!username) {

                alert(
                    "Please login before reporting a problem."
                );

                return;
            }


            const category =
                document
                .querySelector("#category")
                .value;


            const location =
                document
                .querySelector("#location")
                .value
                .trim();


            const description =
                document
                .querySelector("#description")
                .value
                .trim();


            const imageInput =
                document.querySelector("#image");


            /* Check Category */

            if (category === "") {

                alert(
                    "Please select a problem category."
                );

                return;
            }


            /* Check Location */

            if (location === "") {

                alert(
                    "Please enter the location."
                );

                return;
            }


            /* Check Description */

            if (description === "") {

                alert(
                    "Please describe the problem."
                );

                return;
            }


            /* Create FormData */

            const formData =
                new FormData();


            formData.append(
                "username",
                username
            );


            formData.append(
                "category",
                category
            );


            formData.append(
                "location",
                location
            );


            formData.append(
                "description",
                description
            );


            /* Add Image */

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                formData.append(
                    "image",
                    imageInput.files[0]
                );

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/problems`, {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    alert(
                        "Problem reported successfully!"
                    );


                    reportForm.reset();


                    window.location.href =
                        "problems.html";


                } else {

                    alert(
                        data.message ||
                        "Could not report the problem."
                    );

                }


            } catch (error) {

                console.error(error);

                alert(
                    "Could not connect to the CivicVoice server."
                );

            }

        }
    );

}


/* =====================================================
   COMMUNITY FEED
   ===================================================== */

const problemsContainer =
    document.querySelector(
        "#problemsContainer"
    );

if (problemsContainer) {

    loadCommunityProblems();

}


/* =====================================================
   LOAD COMMUNITY PROBLEMS
   ===================================================== */

async function loadCommunityProblems() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/problems`
            );


        const data =
            await response.json();


        if (
            data.status !==
            "success"
        ) {

            problemsContainer.innerHTML =
                "<p>Could not load problems.</p>";

            return;
        }


        if (!data.problems ||
            data.problems.length === 0
        ) {

            problemsContainer.innerHTML =
                "<p>No problems have been reported yet.</p>";

            return;
        }


        problemsContainer.innerHTML =
            "";


        data.problems.forEach(
            function(problem) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "problem-card";


                let imageHTML =
                    "";


                if (problem.image) {

                    imageHTML = `

                        <div>

                            <p>

                                <strong>
                                    Uploaded Photo:
                                </strong>

                            </p>

                            <img

                                src="${problem.image}"

                                alt="Problem photo"

                                style="
                                    width:300px;
                                    max-width:100%;
                                    height:auto;
                                    border-radius:8px;
                                "

                            >

                        </div>

                    `;
                }


                card.innerHTML = `

                    <h3>
                        ${problem.category}
                    </h3>


                    <p>

                        <strong>
                            Location:
                        </strong>

                        ${problem.location}

                    </p>


                    <p>

                        <strong>
                            Description:
                        </strong>

                        ${problem.description}

                    </p>


                    ${imageHTML}


                    <p>

                        <strong>
                            Reported by:
                        </strong>

                        ${problem.username}

                    </p>


                    <p>

                        <strong>
                            Status:
                        </strong>

                        ${problem.status}

                    </p>


                    <p>

                        <strong>
                            Admin Reply:
                        </strong>

                        ${
                            problem.admin_reply
                                ?
                                problem.admin_reply
                                :
                                "No reply from admin yet."
                        }

                    </p>


                    <p>

                        <strong>
                            Reported on:
                        </strong>

                        ${problem.created_at}

                    </p>


                    <p>

                        <strong>
                            Support:
                        </strong>

                        <span
                            id="support-count-${problem.id}"
                        >

                            ${problem.support_count || 0}

                        </span>

                    </p>


                    <button

                        type="button"

                        class="support-button"

                        data-id="${problem.id}"

                    >

                        👍 Support

                    </button>


                    <h4>
                        Comments
                    </h4>


                    <div
                        id="comments-${problem.id}"
                    >

                        <p>
                            Loading comments...
                        </p>

                    </div>


                    <input

                        type="text"

                        id="comment-input-${problem.id}"

                        placeholder="Write a comment..."

                    >


                    <button

                        type="button"

                        class="comment-button"

                        data-id="${problem.id}"

                    >

                        Post Comment

                    </button>


                    <hr>

                `;


                problemsContainer.appendChild(
                    card
                );


                loadComments(
                    problem.id
                );

            }
        );


        /* =================================================
           SUPPORT BUTTON EVENTS
           ================================================= */

        const supportButtons =
            document.querySelectorAll(
                ".support-button"
            );


        supportButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        supportProblem(
                            button.dataset.id
                        );

                    }
                );

            }
        );


        /* =================================================
           COMMENT BUTTON EVENTS
           ================================================= */

        const commentButtons =
            document.querySelectorAll(
                ".comment-button"
            );


        commentButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        addComment(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.error(error);

        problemsContainer.innerHTML =
            "<p>Could not connect to the CivicVoice server.</p>";

    }

}


/* =====================================================
   SUPPORT PROBLEM
   ===================================================== */

async function supportProblem(problemId) {

    const username =
        getLoggedInUsername();


    if (!username) {

        alert(
            "Please login before supporting a problem."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/problems/${problemId}/support`, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username
                    })
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            const count =
                document.querySelector(
                    `#support-count-${problemId}`
                );


            if (
                count &&
                data.support_count !==
                undefined
            ) {

                count.textContent =
                    data.support_count;

            }


            alert(
                "Problem supported successfully!"
            );


        } else {

            alert(
                data.message ||
                "Could not support the problem."
            );

        }


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CivicVoice server."
        );

    }

}


/* =====================================================
   LOAD COMMENTS
   ===================================================== */

async function loadComments(problemId) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/problems/${problemId}/comments`
            );


        const data =
            await response.json();


        const commentsContainer =
            document.querySelector(
                `#comments-${problemId}`
            );


        if (!commentsContainer) {

            return;

        }


        if (!data.comments ||
            data.comments.length === 0
        ) {

            commentsContainer.innerHTML =
                "<p>No comments yet.</p>";

            return;

        }


        commentsContainer.innerHTML =
            "";


        data.comments.forEach(
            function(comment) {

                const commentElement =
                    document.createElement(
                        "p"
                    );


                commentElement.innerHTML = `

                    <strong>
                        ${comment.username}
                    </strong>:

                    ${comment.comment}

                `;


                commentsContainer.appendChild(
                    commentElement
                );

            }
        );


    } catch (error) {

        console.error(error);

    }

}


/* =====================================================
   ADD COMMENT
   ===================================================== */

async function addComment(problemId) {

    const username =
        getLoggedInUsername();


    if (!username) {

        alert(
            "Please login before commenting."
        );

        return;
    }


    const commentInput =
        document.querySelector(
            `#comment-input-${problemId}`
        );


    if (!commentInput) {

        return;

    }


    const comment =
        commentInput.value.trim();


    if (comment === "") {

        alert(
            "Please write a comment."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/problems/${problemId}/comments`, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        username: username,

                        comment: comment

                    })
                }
            );


        const data =
            await response.json();


        if (response.ok) {

            commentInput.value =
                "";


            alert(
                "Comment added successfully!"
            );


            loadComments(
                problemId
            );


        } else {

            alert(
                data.message ||
                "Could not add comment."
            );

        }


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the CivicVoice server."
        );

    }

}


/* =====================================================
   PRESERVE USERNAME WHEN MOVING BETWEEN PAGES
   ===================================================== */

(function preserveUsernameInLinks() {

    const username =
        getLoggedInUsername();

    if (!username) {
        return;
    }


    const links =
        document.querySelectorAll(
            "a[href]"
        );


    links.forEach(
        function(link) {

            const href =
                link.getAttribute("href");


            if (!href) {
                return;
            }


            /*
             * Only modify CivicVoice HTML page links.
             * External links are left unchanged.
             */

            if (
                href.endsWith(".html") ||
                href === "index.html"
            ) {

                if (!href.includes("username=")) {

                    const separator =
                        href.includes("?") ?
                        "&" :
                        "?";


                    link.setAttribute(
                        "href",
                        href +
                        separator +
                        "username=" +
                        encodeURIComponent(
                            username
                        )
                    );

                }

            }

        }
    );

})();