const aqiModel = require('../models/aqi_inModel');
const historicModel = require('../models/historicModel.js');

const gettingCities = async function(req,res){
    try{
        console.log("Hitting the API");
        const city = req.body.city;
        console.log("City passed in post request is",city);
        let citiesData = [];
        if(city == "Delhi"){
            citiesData = await aqiModel.find({StateName:city});
        }
        else{
            citiesData = await aqiModel.find({CityName:city});
        }
        console.log("Length of document citiesData is",citiesData.length)
        // console.log("City data is",citiesData);
        return res.status(200).send({status:true,message:"API running successfully",Data:citiesData});
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message});
    }
}

module.exports = {gettingCities};
