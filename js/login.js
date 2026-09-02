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

            // Save username separately.
            // If the browser blocks localStorage,
            // login should still be considered successful.
            try {
                localStorage.setItem("username", data.username);
            } catch (storageError) {
                console.log(
                    "Storage access denied, but login was successful."
                );
            }

            loginMessage.textContent = "Login successful!";
            loginMessage.className = "success";

            console.log("Logged in as:", data.username);

        } else {

            loginMessage.textContent = data.message;
            loginMessage.className = "error";
        }

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        loginMessage.textContent =
            "Connection error: " + error.message;

        loginMessage.className = "error";
    }
});