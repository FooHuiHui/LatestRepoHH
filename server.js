require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const SECRET_KEY = "your_secret_key";

// User Signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const result = await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name", [name, email, hashedPassword]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.rows[0].id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Middleware for authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// Add Food Item
app.post('/food_items', authenticateToken, async (req, res) => {
    const { food_name, quantity, expiry_date, reminder_days } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO food_items (user_id, food_name, quantity, expiry_date, reminder_days) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.userId, food_name, quantity, expiry_date, reminder_days]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Automated Expiry Reminders
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

cron.schedule("0 0 * * *", async () => {
    const today = new Date();
    const upcomingDate = new Date(today);
    upcomingDate.setDate(today.getDate() + 1);

    try {
        const result = await pool.query(`
            SELECT users.email, food_name, expiry_date FROM food_items
            INNER JOIN users ON food_items.user_id = users.id
            WHERE expiry_date <= $1
        `, [upcomingDate.toISOString().split('T')[0]]);

        result.rows.forEach(item => {
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: item.email,
                subject: "Food Expiry Reminder",
                text: `Reminder: Your food item "${item.food_name}" is expiring on ${item.expiry_date}.`
            });
        });

        console.log("Reminders sent!");
    } catch (err) {
        console.error("Error sending reminders:", err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



//// Needed for dotenv
//require("dotenv").config();

//// Needed for Express
//var express = require('express')
//var app = express()

//// add this snippet after "var express = require('express')"
//var axios = require('axios');

//// Needed for EJS
//app.set('view engine', 'ejs');

//// Needed for public directory
//app.use(express.static(__dirname + '/public'));

//// Needed for parsing form data
//app.use(express.json());       
//app.use(express.urlencoded({extended: true}));

//// Needed for Prisma to connect to database
//const { PrismaClient } = require('@prisma/client')
//const prisma = new PrismaClient();

//// Main landing page
//app.get('/', async function(req, res) {

    //// Try-Catch for any errors
    //try {
        //// Get all blog posts
        //const blogs = await prisma.post.findMany({
                //orderBy: [
                  //{
                  //  id: 'desc'
                  //}
                //]
        //});

        //// Render the homepage with all the blog posts
        //await res.render('pages/home', { blogs: blogs });
      //} catch (error) {
        //res.render('pages/home');
        //console.log(error);
      //} 
//});

//// About page
//app.get('/about', function(req, res) {
  //  res.render('pages/about');
//});

//// New post page
//app.get('/new', function(req, res) {
  //  res.render('pages/new');
//});

//// Create a new post
//app.post('/new', async function(req, res) {
    
    //// Try-Catch for any errors
    //try {
        //// Get the title and content from submitted form
        //const { title, content } = req.body;

        //// Reload page if empty title or content
        //if (!title || !content) {
          //  console.log("Unable to create new post, no title or content");
          //  res.render('pages/new');
        //} else {
            //// Create post and store in database
            //const blog = await prisma.post.create({
              //  data: { title, content },
            //});

            //// Redirect back to the homepage
            //res.redirect('/');
        //}
      //} catch (error) {
        //console.log(error);
        //res.render('pages/new');
      //}

//});

//// Delete a post by id
//app.post("/delete/:id", async (req, res) => {
  //  const { id } = req.params;
    
    //try {
      //  await prisma.post.delete({
        //    where: { id: parseInt(id) },
        //});
      
        //// Redirect back to the homepage
      //  res.redirect('/');
    //} catch (error) {
      //  console.log(error);
      //  res.redirect('/');
    //}
  //});

//// Tells the app which port to run on
//app.listen(8080);

//app.get('/demo', function(req, res) {
  //res.render('pages/demo');
//});

//// add this snippet before 
//app.get('/weather', async (req, res) => {
  //  try {
    //  const response = await axios.get('https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast');
    //  res.render('pages/weather', { weather: response.data });
    //} catch (error) {
    //  console.error(error);
    //  res.send('Error fetching weather data');
    //}
  //});
  
