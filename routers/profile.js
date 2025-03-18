const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserDb = require('../database/models/UserDb'); // Importing the User database model for user data handling
const authenticateToken = require('../middlewares/authMiddleware')

router.get('/', authenticateToken, (req, res) => {
       res.json({ message: "Login Successful", user: req.user });
});
router.get('/data', authenticateToken, (req, res) => {
       res.json({ message: "Data Fetch", user: req.user });
});

module.exports = router;