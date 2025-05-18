const API_URL = "http://localhost:5000";
let token = "";

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    token = data.token;
}

async function addFood() {
    const food_name = document.getElementById("food_name").value;
    const quantity = document.getElementById("quantity").value;
    const expiry_date = document.getElementById("expiry_date").value;
    const reminder_days = document.getElementById("reminder_days").value;

    await fetch(`${API_URL}/food_items`, {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ food_name, quantity, expiry_date, reminder_days })
    });
}
