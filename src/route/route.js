const express = require('express');
const requestController = require('../controllers/requestController.js');

const router = express.Router();

// router to get data based on city name
router.post('/getCity', requestController.gettingCities);

// API to get nearest five locations based on latitude and longitude passed
router.post('/getNearestLocations', requestController.getNearestLocations);
module.exports = router;
