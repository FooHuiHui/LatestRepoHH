
async function addItem() {
  const name = document.getElementById('itemName').value;
  const quantity = document.getElementById('quantity').value;
  const expiry = document.getElementById('expiry').value;
  

  await fetch(`./add-item`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, quantity, expiry })
  });
  alert('Item added!');
}

async function consumeItem() {
  const name = document.getElementById('consumeName').value;
  const quantity = document.getElementById('consumeQuantity').value;
  await fetch(`./consume-item`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, quantity })
  });
  alert('Item consumed!');
}

async function checkExpiring() {
  const days = document.getElementById('daysToExpire').value;
  const res = await fetch(`${api}/expiring/${days}`);
  const data = await res.json();
  const list = document.getElementById('expiringList');
  list.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} expires on ${item.expiry}`;
    list.appendChild(li);
  });
}
