const config = require('./config');
const axios = require('axios');
const sqlite = require('aa-sqlite');

const databaseDir = config.databaseDir;
const apiUrl = config.schoolApiUrl;

const requestConfig = config.schoolRequestConfig;
const date = config.foodDate;

async function OpenDatabase() {
    await sqlite.open(databaseDir);
}

async function RemoveAllSchoolsFromDB() {
    sql = "DELETE FROM schools";
    await sqlite.run(sql);
}

async function GetAllSchoolsAndAddThemToDB() {
    let provinces = await GetProvinces();

    await provinces.forEach(async province => {
        let districts = await GetDistricts(province);
        
        districts.forEach(async district => {
            let schools = await GetSchools(district);

            // only add first school because the meal depends on district 
            if (await CheckIfSchoolUsesSystem(schools[0]) == true) {
                await AddSchoolToDB(province, district, schools[0]);
            }
        });
    }); 
}

async function GetProvinces() {
    let result = await axios.get(`${apiUrl}/provinces`, requestConfig)

    let provinces = result.data.provinces;

    return provinces;
}

async function GetDistricts(province) {
    let result = await axios.get(`${apiUrl}/districts/?province=${province.id}`, requestConfig)

    let districts = result.data.districts;

    return districts;
}

async function GetSchools(district) {
    let result = await axios.get(`${apiUrl}/schools/?district=${district.id}`, requestConfig);

    let schools = result.data.schools;

    return schools;
}

async function CheckIfSchoolUsesSystem(school) {
    if (school == undefined) return;
    if (school.name.includes("Information")) return;

    let year = date.year;
    let week = date.week;

    let result = await axios.get(`${apiUrl}/menu/?school=${school.id}&year=${year}&week=${week}`, requestConfig);

    if (result.data.weeks[0]['days'][0] == undefined) return false;
    else if (result.data.weeks[0]['days'][0]['items'] == undefined) return false;
    else if (result.data.weeks[0]['days'][0]['items'][0] == undefined) return false;

    else if (result.data.weeks[0]['days'][0]['items'][0].includes("Hej! Kul att du laddat hem appen!")) return false;
    else if (result.data.weeks[0]['days'][0]['items'][0].includes("Friskola?")) return false;
    else return true;
}

async function AddSchoolToDB(province, district, school) {
    let entry = `'${school.name}', '${district.name}', '${school.id.toString()}', '${district.id.toString()}', '${province.id.toString()}', '0', '0'`
    let sql = `INSERT INTO schools(schoolName, districtName, schoolId, districtId, provinceId, votes, totalWins) VALUES (${entry})`;
    await sqlite.run(sql);
    console.log(`added ${school.name} to DB`);
}

async function Program() {
    await OpenDatabase();
    await RemoveAllSchoolsFromDB();
    await GetAllSchoolsAndAddThemToDB();
}

Program();