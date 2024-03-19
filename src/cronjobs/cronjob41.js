const aqiModel = require('../models/aqi_inModel');
const historicModel = require('../models/historicModel.js');
const mongoose = require('mongoose');
const axios = require("axios");
const cron = require('node-cron');
const moment = require('moment-timezone');

mongoose.connect('mongodb+srv://chaudharyaditya41:Z67gI1uJnrGCnHuY@cluster0.jgngtnq.mongodb.net/testingAPIsDb9?retryWrites=true&w=majority', {
    usenewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB41 is connected"))
    .catch(err => console.log(err))

cron.schedule('*/30 * * * *', async () => {
    try {
        const originalUrl = 'https://api.waqi.info/feed/@80/?token=7124b219cbdffcfa7e30e4e0745bc252b445fb2f';
        console.log("Coming into cronjob 41");
        let bulkOps = [];
        let historicDocuments = [];
        const documents = await aqiModel.find();
        // console.log(documents);
        console.log("Documents present in the AQI collection", documents.length);
        for (let i = 12000; i < 12300; i++) {
            let Status = null;
            const latitude = documents[i]["latitude"];
            const longitude = documents[i]["longitude"];
            const _id = documents[i]["_id"];
            const Uid = documents[i]["Uid"];
            const LocationName = documents[i]["LocationName"];
            const StationName = documents[i]["StationName"];
            const CityName = documents[i]["CityName"];
            const StateName = documents[i]["StateName"];
            const Country = documents[i]["Country"];
            // parse the url
            const parsedUrl = new URL(originalUrl);

            // setting the latitude and longitude in the url
            const newUrl = `feed/@${Uid}/`;

            // update the path in parsed url
            parsedUrl.pathname = newUrl;

            // convert the original url back to string
            const finalUrl = parsedUrl.toString();
            // console.log(finalUrl);

            const storeData = await axios.get(finalUrl);
            const dataFromAPI = storeData.data;
            // console.log(dataFromAPI);

            let PM10 = null;
            let PM25 = null;
            let Temperartue = null;
            let Humidity = null;
            let DominentPollutent = null;
            let AQI = null;
            let NO2 = null;
            let SO2 = null;
            let O3 = null;
            let time = null;

            if (dataFromAPI.status == 'error') {
                PM10 = "NA";
                PM25 = "NA";
                Temperartue = "NA";
                Humidity = "NA";
                DominentPollutent = "NA";
                AQI = "NA";
                NO2 = "NA";
                SO2 = "NA";
                O3 = "NA";
                time = "NA";
                Status = "Inactive";

                const completeObj = { Status, AQI, DominentPollutent, PM10, PM25, NO2, SO2, O3, Temperartue, Humidity, time };
                const historicObj = { Status, Uid, LocationName, AQI, DominentPollutent, PM10, PM25, NO2, SO2, O3, Temperartue, Humidity, StationName, CityName, StateName, Country, time, latitude, longitude };
                historicDocuments.push(historicObj);
                let upsertDoc = {
                    'updateOne': {
                        'filter': { _id: _id },
                        'update': completeObj,
                        'upsert': true
                    }
                };
                // console.log(upsertDoc);
                bulkOps.push(upsertDoc);
                // console.log(updateDocument);
            }
            else {
                Status = "Active";
                // pm10
                if (dataFromAPI.data.iaqi.hasOwnProperty('pm10')) {
                    // console.log("pm10 key hai");
                    PM10 = dataFromAPI.data.iaqi.pm10.v;
                }
                else {
                    PM10 = "NA";
                }

                // pm25
                if (dataFromAPI.data.iaqi.hasOwnProperty('pm25')) {
                    // console.log("pm25 key hai");
                    PM25 = dataFromAPI.data.iaqi.pm25.v;
                }
                else {
                    PM25 = "NA";
                }

                // no2
                if (dataFromAPI.data.iaqi.hasOwnProperty('no2')) {
                    // console.log("pm25 key hai");
                    NO2 = dataFromAPI.data.iaqi.no2.v;
                }
                else {
                    NO2 = "NA";
                }

                // so2
                if (dataFromAPI.data.iaqi.hasOwnProperty('so2')) {
                    // console.log("pm25 key hai");
                    SO2 = dataFromAPI.data.iaqi.so2.v;
                }
                else {
                    SO2 = "NA";
                }

                // o3
                if (dataFromAPI.data.iaqi.hasOwnProperty('o3')) {
                    // console.log("pm25 key hai");
                    O3 = dataFromAPI.data.iaqi.o3.v;
                }
                else {
                    O3 = "NA";
                }

                // Temperature
                if (dataFromAPI.data.iaqi.hasOwnProperty('t')) {
                    // console.log("temperature key hai");
                    let number = dataFromAPI.data.iaqi.t.v;
                    Temperartue = Math.round(number);
                }
                else {
                    Temperartue = "NA";
                }
                // Humidity
                if (dataFromAPI.data.iaqi.hasOwnProperty('h')) {
                    // console.log("humidity key hai");
                    let number = dataFromAPI.data.iaqi.h.v;
                    Humidity = Math.round(number);
                }
                else {
                    Humidity = "NA";
                }

                // let time = dataFromAPI.data.time.iso;
                const isoDateTime = dataFromAPI.data.time.iso;
                time = moment.tz(isoDateTime, 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

                // Dominent pollutent
                if (dataFromAPI.data.hasOwnProperty('dominentpol')) {
                    DominentPollutent = dataFromAPI.data.dominentpol;
                }
                else {
                    DominentPollutent = "NA";
                }
                if (DominentPollutent == '') {
                    if (PM10 !== "NA" && PM25 !== "NA") {
                        // DominentPollutent = "Not Available";
                        if (PM10 > PM25) {
                            DominentPollutent = PM10;
                        }
                        else {
                            DominentPollutent = PM25;
                        }
                    }
                    else if (PM10 == "NA" && PM25 != "NA") {
                        DominentPollutent = "pm25";
                    }
                    else if (PM10 != "NA" && PM25 == "NA") {
                        DominentPollutent = "pm10";
                    }
                    else {
                        DominentPollutent = "NA";
                    }
                }

                if (dataFromAPI.data.hasOwnProperty('aqi')) {
                    AQI = dataFromAPI.data.aqi;
                }
                else {
                    AQI = "NA";
                }

                if (AQI == '-') {
                    if (PM10 != "NA" && PM25 != "NA") {
                        AQI = Math.max(PM10, PM25);
                    }
                    else if (PM10 == "NA" && PM25 != "NA") {
                        AQI = PM25;
                    }
                    else if (PM10 != "NA" && PM25 == "NA") {
                        AQI = PM10;
                    }
                    else {
                        AQI = "NA"
                    }
                }

                const completeObj = { Status, AQI, DominentPollutent, PM10, PM25, NO2, SO2, O3, Temperartue, Humidity, time };
                const historicObj = { Status, Uid, LocationName, AQI, DominentPollutent, PM10, PM25, NO2, SO2, O3, Temperartue, Humidity, StationName, CityName, StateName, Country, time, latitude, longitude };
                historicDocuments.push(historicObj);
                let upsertDoc = {
                    'updateOne': {
                        'filter': { _id: _id },
                        'update': completeObj,
                        'upsert': true
                    }
                };
                // console.log(upsertDoc);
                bulkOps.push(upsertDoc);
                // console.log(updateDocument);
            }
        }
        const result = await historicModel.insertMany(historicDocuments);
        // console.log(result);
        await aqiModel.bulkWrite(bulkOps)
            .then(bulkWriteOpResult => {
                console.log('BULK update OK');
                console.log(JSON.stringify(bulkWriteOpResult, null, 2));
            })
            .catch(err => {
                console.log('BULK update error');
                console.log(JSON.stringify(err, null, 2));
            });
        console.log("Finished Updating cron 41")
    }
    catch (error) {
        console.log(error.message);
    }
});
