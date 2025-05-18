document.getElementById('userForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        birthdate: document.getElementById('birthdate').value
    };

    const response = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    alert(result.message);
});