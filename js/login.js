const loginForm = document.querySelector("#loginForm");

const loginInput = document.querySelector("#loginInput");

const loginPassword =
    document.querySelector("#loginPassword");

const loginMessage =
    document.querySelector("#loginMessage");


loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    loginMessage.textContent = "";

    loginMessage.className = "";


    const loginData = {

        login: loginInput.value.trim(),

        password: loginPassword.value

    };


    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(loginData)

            }
        );


        const data = await response.json();


        if (response.ok) {

            loginMessage.textContent =
                "Login successful!";

            loginMessage.className =
                "success";


            // Save username for Report Problem
            localStorage.setItem(
                "username",
                data.username
            );


            console.log(
                "Logged in as:",
                data.username
            );

        } else {

            loginMessage.textContent =
                data.message;

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

});