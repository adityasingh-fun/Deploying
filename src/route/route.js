const express = require('express');
const requestController = require('../controllers/requestController.js');

const router = express.Router();

router.post('/getCity',requestController.gettingCities);

module.exports = router;
