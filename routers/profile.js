const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware')
const languageProficiencyDb = require("../database/models/languageProficiency");
const academicInfoDb = require("../database/models/userAcademicInfoDb");
const userPeferenceDb = require('../database/models/userPreference');
const UserDb = require('../database/models/UserDb');

router.get('/', authenticateToken, (req, res) => {
       res.json({ message: "Login Successful", user: req.user });

});
router.get('/data', authenticateToken, async (req, res) => {
       const id = req.user.id;
       try {
              const personalInfo = await UserDb.findById(id)
              const langPro = await languageProficiencyDb.findOne({ user: id });
              const majorSubject = await academicInfoDb.findOne({ user: id });
              const userPreference = await userPeferenceDb.findOne({ user: id });
              res.json({
                     message: "Data Fetch",
                     user: { personalInfo, majorSubject, langPro, userPreference },
              });
       } catch (error) {
              console.error("❌ Error fetching user data:", error);
              res.status(500).json({
                     success: false,
                     message: "Internal Server Error",
                     error: error.message,
              });
       }
});

module.exports = router;