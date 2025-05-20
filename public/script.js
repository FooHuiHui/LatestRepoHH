function showSection(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  if (id === 'kitchen') loadKitchen();
  if (id === 'consumed') loadConsumed();
}

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

async function loadKitchen() {
  const res = await fetch(`./items`);
  const items = await res.json();
  const list = document.getElementById('kitchenList');
  list.innerHTML = '';
  items.filter(i => i.quantity > 0).forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - ${item.quantity} (expires: ${item.expiry})`;
    const btn = document.createElement('button');
    btn.textContent = 'Consume';
    btn.onclick = async () => {
      const qty = prompt(`How much to consume from "${item.name}"?`);
      if (qty && parseInt(qty) > 0) {
        await fetch(`./consume-item`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name: item.name, quantity: parseInt(qty) })
        });
        loadKitchen();
      }
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function loadConsumed() {
  const res = await fetch(`./items`);
  const items = await res.json();
  const list = document.getElementById('consumedList');
  list.innerHTML = '';
  items.filter(i => i.consumed > 0).forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - ${item.consumed}`;
    list.appendChild(li);
  });
}

/*
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
*/

async function checkExpiring() {
  const days = document.getElementById('daysToExpire').value;
  const res = await fetch(`./expiring/${days}`);
  const data = await res.json();
  const list = document.getElementById('expiringList');
  list.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} expires on ${item.expiry}`;
    list.appendChild(li);
  });
}
