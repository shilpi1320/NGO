const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs'); 
const cors = require('cors'); 

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); 

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'admin_db', 
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

// Admin signup route
app.post('/signup', (req, res) => {
    const { adminName, password } = req.body;

    const checkAdminQuery = 'SELECT * FROM admins WHERE name = ?';
    db.query(checkAdminQuery, [adminName], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) throw err;
            const insertAdminQuery = 'INSERT INTO admins (name, password) VALUES (?, ?)';
            db.query(insertAdminQuery, [adminName, hashedPassword], (err) => {
                if (err) throw err;
                res.status(201).json({ message: 'Admin registered successfully' });
            });
        });
    });
});

// Admin login route
app.post('/login', (req, res) => {
    const { adminName, password } = req.body;

    const checkAdminQuery = 'SELECT * FROM admins WHERE name = ?';
    db.query(checkAdminQuery, [adminName], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(400).json({ message: 'Invalid login credentials' });
        }

        const admin = result[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(400).json({ message: 'Invalid login credentials' });
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
