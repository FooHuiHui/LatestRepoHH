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
    'INSERT INTO "Items" (name, quantity, expiry, consumed) VALUES ($1, $2, $3, 0)',
    [name, quantity, expiry]
  );
  res.sendStatus(200);
});

app.post('/consume-item', async (req, res) => {
  const { name, quantity } = req.body;
  await db.query(
    'UPDATE "Items" SET quantity = quantity - $1, consumed = consumed + $1 WHERE name = $2',
    [quantity, name]
  );
  res.sendStatus(200);
});

app.get('/expiring/:days', async (req, res) => {
  const { days } = req.params;
  const result = await db.query(
    "SELECT * FROM "Items" WHERE expiry <= NOW() + ($1 || ' days')::interval",
    [days]
  );
  res.json(result.rows);
});


app.listen(3000, () => console.log('Server running on port 3000'));
