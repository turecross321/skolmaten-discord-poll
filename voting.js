const config = require('./config');
const axios = require('axios');
const DuckDuckGoImages = require('duckduckgo-images-api');
const sqlite = require('aa-sqlite');
const fs = require('fs');
const translation = require('./translation');
const sanitization = require('./sanitization');

const databaseDir = config.databaseDir;
const photosFolder = config.photosFolder;
const limit = config.foodOptionsInVoting;

var databaseIsOpen = false;

module.exports = {
    getMeals: async function() {return await GetMeals();},
    getMealImage: async function(mealObject) {return await GetMealImage(mealObject);}
}

async function OpenDatabase() {
    await sqlite.open(databaseDir);
}

async function CloseDatabase() {;
    await sqlite.close();
}

async function GetMeals() {
    if (databaseIsOpen === false) await OpenDatabase();

    var sql = `SELECT ID, schoolId, mealName, enMealName, imageURL, wins FROM school_meals WHERE wins = ( SELECT MIN(wins) FROM school_meals) LIMIT ${limit}`;
    let meals = await sqlite.all(sql).catch(err=>{console.error(err);});

    for (let i = 0; i < meals.length; i++) {
        meals[i] = await GetTranslatedMeal(meals[i]);
    }
    
    return meals;
}

async function GetMealImageURL(mealObject) {
    console.log(`Getting image URL to ${mealObject.mealName}`)

    let results = await DuckDuckGoImages.image_search({ query: mealObject.mealName, moderate: true, iterations: 1 })

    mealObject.imageURL = results[0].thumbnail;

    sql = `UPDATE school_meals SET imageURL = '${mealObject.imageURL}' WHERE schoolId = '${mealObject.schoolId}'`

    await sqlite.run(sql).catch(err=>{console.error(err);});;

    console.log(`Set imageURL of ${mealObject.mealName} to ${mealObject.imageURL}`);
    return mealObject;
}

async function GetMealImage(mealObject) {
    let path = `${photosFolder}/${mealObject['ID']}.jpeg`;

    imageAlreadyDownloaded = fs.existsSync(path);

    if (imageAlreadyDownloaded) {
        return path;
    }
    else {
        console.log(`No image of ${mealObject['meal']} found`);
        return await DownloadImage(mealObject, path);
    }
}

async function DownloadImage(mealObject, path) {
    console.log(`Downloading image of ${mealObject['meal']}...`);

    if (mealObject['imageURL'] == '') {
        console.log("No meal image link found")
        mealObject = await GetMealImageURL(mealObject);
    }

    let requestConfig = {"responseType": "stream"};

    response = await axios.get(mealObject['imageURL'], requestConfig);

    return await new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(path))
            .on('error', reject)
            .once('close', () => resolve(path)); 
    });
}

async function GetTranslatedMeal(mealObject) {
    console.log(mealObject);

    let enMealName = mealObject.enMealName;

    if (enMealName == '') {
        enMealName = sanitization.Sanitize(await translation.Translate(mealObject.mealName));

        mealObject.enMealName = enMealName;

        sql = `UPDATE school_meals SET enMealName = '${mealObject.enMealName}' WHERE schoolId = '${mealObject.schoolId}'`

        await sqlite.run(sql).catch(err=>{console.error(err);});
    
        console.log(`Set enMealName of ${mealObject.mealName} to ${mealObject.enMealName}`);
    }

    return mealObject;
}