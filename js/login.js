const loginForm = document.querySelector("#loginForm");
const loginInput = document.querySelector("#loginInput");
const loginPassword = document.querySelector("#loginPassword");
const loginMessage = document.querySelector("#loginMessage");

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
            "https://civicvoice-ymbf.onrender.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            }
        );

        const data = await response.json();

        if (response.ok) {

            // Save username in localStorage
            try {
                localStorage.setItem(
                    "username",
                    data.username
                );
            } catch (error) {
                console.log(
                    "localStorage is not available."
                );
            }

            // Save username in sessionStorage
            try {
                sessionStorage.setItem(
                    "username",
                    data.username
                );
            } catch (error) {
                console.log(
                    "sessionStorage is not available."
                );
            }

            // Save username in cookie
            try {
                document.cookie =
                    "civicvoice_username=" +
                    encodeURIComponent(data.username) +
                    "; path=/; max-age=86400; SameSite=Lax; Secure";
            } catch (error) {
                console.log(
                    "Cookie unavailable."
                );
            }

            loginMessage.textContent =
                "Login successful!";

            loginMessage.className =
                "success";

            console.log(
                "Logged in as:",
                data.username
            );

            setTimeout(function() {

                window.location.href =
                    "index.html?username=" +
                    encodeURIComponent(
                        data.username
                    );

            }, 500);

        } else {

            loginMessage.textContent =
                data.message;

            loginMessage.className =
                "error";
        }

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        loginMessage.textContent =
            "Connection error: " +
            error.message;

        loginMessage.className =
            "error";
    }
});