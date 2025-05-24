const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/add-item', async (req, res) => {
  let { name, quantity, expiry } = req.body;
  await db.query(
    'INSERT INTO "Items" (name, quantity, expiry, consumed, thrown, original_quantity) VALUES ($1, $2, $3, 0, 0, $2)',
    [name, quantity, expiry]
  );
  res.sendStatus(200);
});

app.get('/items', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Items"');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /items:', err);
    res.status(500).send('Database error');
  }
});


app.post('/consume-item', async (req, res) => {
  const { id, quantity } = req.body;

  // Get current values
  const result = await db.query(
    'SELECT quantity, consumed, thrown, original_quantity FROM "Items" WHERE id = $1',
    [id]
  );
  const item = result.rows[0];
  if (!item) return res.status(404).send('Item not found');

  // 1. Check if quantity entered > quantity in kitchen + consumed + thrown
  if (Number(quantity) > Number(item.quantity) + Number(item.consumed) + Number(item.thrown)) {
    return res.status(400).send('Exceeds original quantity added');
  } 
  // 2. Check if quantity entered > quantity in kitchen
  else if (Number(quantity) > Number(item.quantity)) {
    return res.status(400).send('Exceeds remaining quantity in kitchen');
  }
  
  // If checks pass, update item
  await db.query(
    'UPDATE "Items" SET quantity = quantity - $1, consumed = consumed + $1 WHERE id = $2',
    [quantity, id]
  );
  res.sendStatus(200);
});

// Throw item endpoint
app.post('/throw-item', async (req, res) => {
  const { id, quantity } = req.body;

  // Get current values
  const result = await db.query(
    'SELECT quantity, consumed, thrown, original_quantity FROM "Items" WHERE id = $1',
    [id]
  );
  const item = result.rows[0];
  if (!item) return res.status(404).send('Item not found');

  // 1. Check if quantity entered > quantity in kitchen + consumed + thrown
  if (Number(quantity) > Number(item.quantity) + Number(item.consumed) + Number(item.thrown)) {
    return res.status(400).send('Exceeds original quantity added');
  }
  // 2. Check if quantity entered > quantity in kitchen
  else if (Number(quantity) > Number(item.quantity)) {
    return res.status(400).send('Exceeds remaining quantity in kitchen');
  }

  // If checks pass, update item
  await db.query(
    'UPDATE "Items" SET quantity = quantity - $1, thrown = thrown + $1 WHERE id = $2',
    [quantity, id]
  );
  res.sendStatus(200);
});


// Delete item endpoint
app.post('/delete-item', async (req, res) => {
  const { id } = req.body;
  await db.query(
    'DELETE FROM "Items" WHERE id = $1',
    [id]
  );
  res.sendStatus(200);
});

// Get items expiring in the next X days
app.get('/expiring/:days', async (req, res) => {
  const { days } = req.params;
  const result = await db.query(
    `SELECT * FROM "Items" WHERE expiry <= NOW() + $1 * INTERVAL '1 day'`,
    [days]
  );
  res.json(result.rows);
});

app.post('/return-item', async (req, res) => {
  const { id, quantity } = req.body;
  if (!id || !quantity) return res.status(400).send('Missing data');

  await db.query(
    'UPDATE "Items" SET quantity = quantity + $1, consumed = consumed - $1 WHERE id = $2 AND consumed >= $1',
    [quantity, id]
  );

  res.status(200).send('Returned');
});

app.listen(3000, () => console.log('Server running on port 3000'));
