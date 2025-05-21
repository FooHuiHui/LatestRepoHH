function showSection(sectionId) {
  // Hide all tabs
  document.querySelectorAll('.tab').forEach(section => {
    section.style.display = 'none';
  });

  // Show selected tab
  const section = document.getElementById(sectionId);
  section.style.display = 'block';

  // Call relevant loader
  if (sectionId === 'kitchen') loadKitchen();
  else if (sectionId === 'consumed') loadConsumed();
  else if (sectionId === 'expiring') checkExpiring();
}

async function addItem() {
  const name = document.getElementById('itemName').value;
  const quantity = document.getElementById('quantity').value;
  const expiry = document.getElementById('expiry').value;
  
  /*
  if (!name || !quantity || !expiry) {
    alert("Please fill out all fields.");
    return;
  }
*/

  await fetch(`./add-item`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, quantity, expiry })
  });

  // if (res.ok) {
    // Add the item to the screen
    const kitchenList = document.getElementById('kitchenList');
    const div = document.createElement('div');
    div.textContent = `✅ ${name} - ${quantity}`;
    kitchenList.prepend(div); 

    // Reset fields
    document.getElementById('itemName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('expiry').value = '';

  alert('Item added!');
  /*} else {
    alert("Failed to add item.");
  } */
}

async function loadKitchen() {
  const res = await fetch(`./Items`);
  const food = await res.json();
  const list = document.getElementById('kitchenList');
  list.innerHTML = '';
  
  const activeItems = food.filter(i => i.quantity > 0);
  if (activeItems.length === 0) {
    list.innerHTML = '<li>No items currently in kitchen.</li>';
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

  activeItems.forEach(item => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;

    const qtyCell = document.createElement('td');
    qtyCell.textContent = item.quantity;

    const expiryCell = document.createElement('td');
    expiryCell.textContent = formatDate(item.expiry);

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
        loadKitchen(); // Refresh after update
      } else {
        checkbox.checked = false; // Uncheck if invalid input
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

function loadConsumed() {
  const consumedList = document.getElementById('consumedList');
  consumedList.innerHTML = 'Loading...';

  fetch('/items')
    .then(res => res.json())
    .then(data => {
      consumedList.innerHTML = '';

      const consumedItems = data.filter(item => item.consumed > 0);
      if (consumedItems.length === 0) {
        consumedList.textContent = 'No items consumed yet.';
        return;
      }

      const table = document.createElement('table');
      table.innerHTML = `
        <tr>
          <th>Item</th>
          <th>Consumed Quantity</th>
          <th>Expiry Date</th>
          <th>Return to Kitchen</th>
        </tr>
      `;

      consumedItems.forEach(item => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;

        const qtyCell = document.createElement('td');
        qtyCell.textContent = item.consumed;

        const expiryCell = document.createElement('td');
        expiryCell.textContent = formatDate(item.expiry);

        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        checkbox.onclick = async () => {
          const qty = prompt(`How much of "${item.name}" do you want to return to kitchen?`, 1);
          const qtyInt = parseInt(qty);
          if (qtyInt > 0 && qtyInt <= item.consumed) {
            await fetch('/return-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: item.name, quantity: qtyInt })
            });
            loadConsumed(); // refresh
          } else {
            alert('Invalid quantity.');
            checkbox.checked = false;
          }
        };

        checkboxCell.appendChild(checkbox);

        row.appendChild(nameCell);
        row.appendChild(qtyCell);
        row.appendChild(expiryCell);
        row.appendChild(checkboxCell);

        table.appendChild(row);
      });

      consumedList.appendChild(table);
    })
    .catch(err => {
      console.error('Error loading consumed items:', err);
      consumedList.textContent = 'Failed to load consumed items.';
    });
}

/*
async function loadConsumed() {
  const res = await fetch(`./Items`);
  const items = await res.json();
  const list = document.getElementById('consumedList');
  list.innerHTML = '';
  items.filter(i => i.consumed > 0).forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} - ${item.consumed}`;
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
    expiryCell.textContent = formatDate(item.expiry);

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

function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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


