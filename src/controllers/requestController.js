const aqiModel = require('../models/aqi_inModel');
const historicModel = require('../models/historicModel.js');

const gettingCities = async function (req, res) {
    try {
        console.log("Hitting the API");
        const city = req.body.city;
        console.log("City passed in post request is", city);
        let citiesData = [];
        if (city == "Delhi") {
            citiesData = await aqiModel.find({ StateName: city });
        }
        else {
            citiesData = await aqiModel.find({ CityName: city });
        }
        console.log("Length of document citiesData is", citiesData.length)
        // console.log("City data is",citiesData);
        return res.status(200).send({ status: true, message: "API running successfully", Data: citiesData });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getNearestLocations = async function (req, res) {
    try {
        const latitude = parseFloat(req.body.latitude);
        const longitude = parseFloat(req.body.longitude);
        console.log("Latitude is", latitude, "and Longitude is", longitude);
        // const nearestLocations = await aqiModel.find({
        //     $near:{
        //         $geometry:{
        //             type:"Point",
        //             coordinates:[longitude,latitude]
        //         }
        //     }
        // }).limit(5);
        // console.log(nearestLocations);
        const result = await aqiModel.find();
        // console.log(result);
        result.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(latitude - a.latitude, 2) + Math.pow(longitude - a.longitude, 2));
            const distB = Math.sqrt(Math.pow(latitude - b.latitude, 2) + Math.pow(longitude - b.longitude, 2));
            return distA - distB;
        });
        const documents = result.slice(0, 5);
        console.log(documents);
        return res.status(200).send({ status: true, message: "API running successfully", Data: documents });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { gettingCities, getNearestLocations };
