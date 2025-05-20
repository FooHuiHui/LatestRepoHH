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
*/

async function checkExpiring() {
  const days = document.getElementById('daysToExpire').value;
  const res = await fetch(`./expiring/${days}`);
  const data = await res.json();

  const list = document.getElementById('expiringList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>No items expiring soon.</li>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <tr>
      <th>Item</th>
      <th>Quantity Left</th>
      <th>Expiry Date</th>
      <th>Consumed?</th>
    </tr>
  `;

  data.forEach(item => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;

    const qtyCell = document.createElement('td');
    qtyCell.textContent = item.quantity;

    const expiryCell = document.createElement('td');
    expiryCell.textContent = item.expiry;

    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onclick = async () => {
      const qty = prompt(`How much of "${item.name}" do you want to consume?`, 1);
      if (qty && parseInt(qty) > 0) {
        await fetch(`./consume-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, quantity: parseInt(qty) })
        });
        checkExpiring(); // refresh the list
      } else {
        checkbox.checked = false; // uncheck if invalid input
      }
    };
    checkboxCell.appendChild(checkbox);

    row.appendChild(nameCell);
    row.appendChild(qtyCell);
    row.appendChild(expiryCell);
    row.appendChild(checkboxCell);

    table.appendChild(row);
  });

  list.appendChild(table);
}


/*
async function checkExpiring() {
  const days = document.getElementById('daysToExpire').value;
  const res = await fetch(`./expiring/${days}`);
  const data = await res.json();

  const list = document.getElementById('expiringList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>No items expiring soon.</li>';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <tr>
      <th>Item</th>
      <th>Quantity Left</th>
      <th>Expiry Date</th>
      <th>Action</th>
    </tr>
  `;

  data.forEach(item => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;

    const qtyCell = document.createElement('td');
    qtyCell.textContent = item.quantity;

    const expiryCell = document.createElement('td');
    expiryCell.textContent = item.expiry;

    const actionCell = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'Consume';
    btn.onclick = async () => {
      const qty = prompt(`How much of "${item.name}" do you want to consume?`, 1);
      if (qty && parseInt(qty) > 0) {
        await fetch(`./consume-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, quantity: parseInt(qty) })
        });
        checkExpiring(); // reload list
      }
    };
    actionCell.appendChild(btn);

    row.appendChild(nameCell);
    row.appendChild(qtyCell);
    row.appendChild(expiryCell);
    row.appendChild(actionCell);
    table.appendChild(row);
  });

  list.appendChild(table);
*/
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


