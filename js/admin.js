/* =====================================================
   ADMIN CONFIGURATION
===================================================== */

const API_BASE_URL =
    "https://civicvoice-ymbf.onrender.com";


const adminLoginForm =
    document.querySelector("#adminLoginForm");

const adminLoginMessage =
    document.querySelector("#adminLoginMessage");

const adminLoginSection =
    document.querySelector("#adminLoginSection");

const adminDashboard =
    document.querySelector("#adminDashboard");

const loadProblemsButton =
    document.querySelector("#loadProblemsButton");

const adminProblemsContainer =
    document.querySelector("#adminProblemsContainer");


/* =====================================================
   ADMIN LOGIN
===================================================== */

adminLoginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const username =
            document.querySelector("#adminUsername")
            .value
            .trim();


        const password =
            document.querySelector("#adminPassword")
            .value;


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/admin/login`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })

                }
            );


            const data =
                await response.json();


            if (response.ok) {

                adminLoginMessage.textContent =
                    "Admin login successful!";

                adminLoginMessage.className =
                    "success";


                /* Save admin details */

                localStorage.setItem(
                    "adminUsername",
                    username
                );


                localStorage.setItem(
                    "adminPassword",
                    password
                );


                /* Hide login section */

                adminLoginSection.style.display =
                    "none";


                /* Show dashboard */

                adminDashboard.style.display =
                    "block";


                /* Load problems */

                loadAdminProblems();

            } else {

                adminLoginMessage.textContent =
                    data.message;

                adminLoginMessage.className =
                    "error";

            }


        } catch (error) {

            console.error(error);


            adminLoginMessage.textContent =
                "Could not connect to the CivicVoice server.";

            adminLoginMessage.className =
                "error";

        }

    }
);


/* =====================================================
   LOAD PROBLEMS BUTTON
===================================================== */

loadProblemsButton.addEventListener(
    "click",
    function() {

        loadAdminProblems();

    }
);


/* =====================================================
   GET PROBLEMS FROM BACKEND
===================================================== */

async function loadAdminProblems() {

    const username =
        localStorage.getItem("adminUsername");

    const password =
        localStorage.getItem("adminPassword");


    if (!username || !password) {

        return;

    }


    adminProblemsContainer.innerHTML =
        "<p>Loading problems...</p>";


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/problems`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })

            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            adminProblemsContainer.innerHTML =
                `<p>${data.message}</p>`;

            return;

        }


        if (data.problems.length === 0) {

            adminProblemsContainer.innerHTML =
                "<p>No problems reported yet.</p>";

            return;

        }


        adminProblemsContainer.innerHTML = "";


        /* =================================================
           DISPLAY EVERY REPORTED PROBLEM
        ================================================= */

        data.problems.forEach(problem => {

                    const problemCard =
                        document.createElement("div");


                    problemCard.className =
                        "problem-card";


                    problemCard.innerHTML = `

                <h3>
                    ${problem.category}
                </h3>


                <p>
                    <strong>Problem ID:</strong>
                    ${problem.id}
                </p>


                <p>
                    <strong>Location:</strong>
                    ${problem.location}
                </p>


                <p>
                    <strong>Description:</strong>
                    ${problem.description}
                </p>


                <p>
                    <strong>Reported by:</strong>
                    ${problem.username}
                </p>


                ${
                    problem.image
                        ?
                        `
                        <div>

                            <p>
                                <strong>Uploaded Photo:</strong>
                            </p>

                            <img
                                src="${problem.image}"
                                alt="Problem photo"
                                style="
                                    width: 300px;
                                    max-width: 100%;
                                    height: auto;
                                    border-radius: 8px;
                                    margin-bottom: 10px;
                                    display: block;
                                "
                            >

                        </div>
                        `
                        :
                        `
                        <p>
                            <strong>Uploaded Photo:</strong>
                            No photo uploaded.
                        </p>
                        `
                }


                <p>
                    <strong>Support:</strong>
                    ${problem.support_count}
                </p>


                <p>
                    <strong>Current Status:</strong>
                    ${problem.status}
                </p>


                <p>
                    <strong>Department:</strong>
                    ${problem.assigned_department || "Not assigned"}
                </p>


                <p>
                    <strong>Reported on:</strong>
                    ${problem.created_at}
                </p>


                <!-- ==============================
                     ADMIN REPLY
                =============================== -->

                <h4>
                    Admin Reply
                </h4>


                ${
                    problem.admin_reply
                        ?
                        `
                        <p>
                            <strong>Current Reply:</strong>
                            ${problem.admin_reply}
                        </p>
                        `
                        :
                        `
                        <p>
                            No reply sent yet.
                        </p>
                        `
                }


                <textarea
                    id="reply-${problem.id}"
                    placeholder="Write a reply to the citizen..."
                    rows="4"
                    style="width: 100%; margin-top: 10px;"
                ></textarea>


                <button
                    type="button"
                    class="reply-button"
                    data-id="${problem.id}"
                    style="margin-top: 10px;"
                >
                    Send Reply
                </button>


                <hr>

            `;


            adminProblemsContainer.appendChild(
                problemCard
            );

        });


        /* =================================================
           ADD REPLY BUTTON EVENTS
        ================================================= */

        const replyButtons =
            document.querySelectorAll(".reply-button");


        replyButtons.forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    sendAdminReply(
                        button.dataset.id
                    );

                }
            );

        });


    } catch (error) {

        console.error(error);


        adminProblemsContainer.innerHTML =
            "<p>Could not connect to the CivicVoice server.</p>";

    }

}


/* =====================================================
   SEND ADMIN REPLY
===================================================== */

async function sendAdminReply(problemId) {

    const replyInput =
        document.querySelector(
            `#reply-${problemId}`
        );


    const reply =
        replyInput.value.trim();


    /* Check reply */

    if (reply === "") {

        alert(
            "Please write a reply before sending."
        );

        return;

    }


    try {

        const response = await fetch(

            `${API_BASE_URL}/api/problems/${problemId}/reply`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    reply: reply

                })

            }

        );


        const data =
            await response.json();


        if (response.ok) {

            alert(
                "Admin reply sent successfully!"
            );


            /* Clear reply box */

            replyInput.value = "";


            /* Reload problems */

            loadAdminProblems();

        } else {

            alert(
                data.message
            );

        }


    } catch (error) {

        console.error(error);


        alert(
            "Could not connect to the CivicVoice server."
        );

    }

}