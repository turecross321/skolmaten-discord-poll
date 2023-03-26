const config = require('./config');
const sanitization = require('./sanitization');
const fs = require('fs');

const photosFolder = config.photosFolder;

const databaseDir = config.databaseDir;
const apiUrl = config.schoolApiUrl;

const requestConfig = config.schoolRequestConfig;

const date = config.foodDate;

const sqlite = require('aa-sqlite');
const axios = require('axios');

async function OpenDatabase() {
    await sqlite.open(databaseDir);
}

async function GetAllSchoolsAndGetAllMealsAndPutThemInDB() {
    sql = "SELECT * FROM schools";

    rows = await sqlite.all(sql);

    if (rows.length < 1) {
        console.log("no schools found!")
        return;
    }

    rows.forEach(async school => {
        let meal = await GetFoodFromSchool(school.schoolId);

        if (meal != undefined)
            await AddFoodToDB(school.schoolId, meal);
    });
}

async function RemoveAllSchoolMealsFromDB() {
    sql = "DELETE FROM school_meals";
    await sqlite.run(sql);
    console.log("removed all school meals from DB");
}

function RemakePhotosFolder() {
    fs.rmSync(photosFolder, {recursive: true, force:true})

    console.log("removed photos folder");

    fs.mkdirSync(photosFolder);

    console.log("created photos folder");
}

async function GetFoodFromSchool(schoolId) {
    let year = date.year;
    let week = date.week;
    let day = date.day;

    let result = await axios.get(`${apiUrl}/menu/?school=${schoolId}&year=${year}&week=${week}`, requestConfig)

    if (!result.data.weeks[0]['days'][day].hasOwnProperty('items')) {
        console.log(schoolId + " doesnt have a menu this week. ignoring...");
        return undefined;
    }
    let meal = sanitization.Sanitize(result.data.weeks[0]['days'][day]['items'][0]); 
    // first week after week offset, gets the chosen day, gets the first meal in the meal array which is the non vegetarian option

    return meal;
}

async function AddFoodToDB(schoolId, meal) {
    entry = `'${schoolId}', '${meal}', '', '', '0'`;
    sql = `INSERT INTO school_meals(schoolId, mealName, enMealName, imageURL, wins) VALUES (${entry})`;

    await sqlite.run(sql);
    console.log(`added ${meal} by ${schoolId} to DB`);
}

async function Program() {
    await OpenDatabase();
    await RemoveAllSchoolMealsFromDB();
    RemakePhotosFolder();
    await GetAllSchoolsAndGetAllMealsAndPutThemInDB();
}

Program();