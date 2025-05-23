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
  
  // Check that all fields are filled
  if (!name || !quantity || !expiry) {
    alert("Please fill out all fields.");
    return;
  }

  await fetch(`./add-item`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, quantity, expiry })
  });

  // Refresh the kitchen list
  loadKitchen();

  // Reset fields
  document.getElementById('itemName').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('expiry').value = '';

  alert('Item added!');

}

async function loadKitchen(sortBy = 'name') {
  const res = await fetch(`./Items`);
  const food = await res.json();
  const list = document.getElementById('kitchenList');
  list.innerHTML = '';
  
  const activeItems = food.filter(i => i.quantity > 0);
  if (activeItems.length === 0) {
    list.innerHTML = '<li>No items currently in kitchen.</li>';
    return;
  }
  
  // Sort items
  activeItems.sort((a, b) => {
    if (sortBy === 'expiry') {
      return new Date(a.expiry) - new Date(b.expiry);
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  // Add sort buttons
  const sortDiv = document.createElement('div');
  sortDiv.style.marginBottom = '10px';
  sortDiv.innerHTML = `
    <button id="sortByName">Sort by Name</button>
    <button id="sortByExpiry">Sort by Expiry Date</button>
  `;
  list.appendChild(sortDiv);

  document.getElementById('sortByName').onclick = () => loadKitchen('name');
  document.getElementById('sortByExpiry').onclick = () => loadKitchen('expiry');

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

    const buttonCell = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = 'Consume';
    button.onclick = async () => {
      const qty = prompt(`How much of "${item.name}" do you want to consume?`, 1);
      if (qty && parseInt(qty) > 0) {
        await fetch(`./consume-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, quantity: parseInt(qty) })
        });
        loadKitchen(sortBy); // Refresh after update
      }
    };
    buttonCell.appendChild(button);

    row.appendChild(nameCell);
    row.appendChild(qtyCell);
    row.appendChild(expiryCell);
    row.appendChild(buttonCell);
    table.appendChild(row);
  });

  list.appendChild(table);
}

function loadConsumed(sortBy = 'name') {
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

      // Add sort buttons
      const sortDiv = document.createElement('div');
      sortDiv.style.marginBottom = '10px';
      sortDiv.innerHTML = `
        <button id="sortConsumedByName">Sort by Name</button>
        <button id="sortConsumedByExpiry">Sort by Expiry Date</button>
      `;
      consumedList.appendChild(sortDiv);

      document.getElementById('sortConsumedByName').onclick = () => loadConsumed('name');
      document.getElementById('sortConsumedByExpiry').onclick = () => loadConsumed('expiry');

      // Sort items
      consumedItems.sort((a, b) => {
        if (sortBy === 'expiry') {
          return new Date(a.expiry) - new Date(b.expiry);
        } else {
          return a.name.localeCompare(b.name);
        }
      });

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

        const buttonCell = document.createElement('td');
        const button = document.createElement('button');
        button.textContent = 'Return';

        button.onclick = async () => {
          const qty = prompt(`How much of "${item.name}" do you want to return to kitchen?`, 1);
          const qtyInt = parseInt(qty);
          if (qtyInt > 0 && qtyInt <= item.consumed) {
            await fetch('/return-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: item.name, quantity: qtyInt })
            });
            loadConsumed(sortBy); // refresh
          }
        };

        buttonCell.appendChild(button);

        row.appendChild(nameCell);
        row.appendChild(qtyCell);
        row.appendChild(expiryCell);
        row.appendChild(buttonCell);

        table.appendChild(row);
      });

      consumedList.appendChild(table);
    })
    .catch(err => {
      console.error('Error loading consumed items:', err);
      consumedList.textContent = 'Failed to load consumed items.';
    });
}


async function checkExpiring(sortBy = 'expiry') {
  const days = document.getElementById('daysToExpire').value;
  const res = await fetch(`./expiring/${days}`);
  const data = await res.json();

  const list = document.getElementById('expiringList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<li>No items expiring soon.</li>';
    return;
  }

  // Add sort buttons
  const sortDiv = document.createElement('div');
  sortDiv.style.marginBottom = '10px';
  sortDiv.innerHTML = `
    <button id="sortExpiringByName">Sort by Name</button>
    <button id="sortExpiringByExpiry">Sort by Expiry Date</button>
  `;
  list.appendChild(sortDiv);

  document.getElementById('sortExpiringByName').onclick = () => checkExpiring('name');
  document.getElementById('sortExpiringByExpiry').onclick = () => checkExpiring('expiry');

  // Sort items
  data.sort((a, b) => {
    if (sortBy === 'expiry') {
      return new Date(a.expiry) - new Date(b.expiry);
    } else {
      return a.name.localeCompare(b.name);
    }
  });

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

    const buttonCell = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = 'Consume';
    button.onclick = async () => {
      const qty = prompt(`How much of "${item.name}" do you want to consume?`, 1);
      if (qty && parseInt(qty) > 0) {
        await fetch(`./consume-item`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: item.name, quantity: parseInt(qty) })
        });
        checkExpiring(sortBy); // refresh the list
      }
    };
    buttonCell.appendChild(button);

    row.appendChild(nameCell);
    row.appendChild(qtyCell);
    row.appendChild(expiryCell);
    row.appendChild(buttonCell);

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


