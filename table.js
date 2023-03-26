const fs = require('fs');

fs.writeFile('./database.db', "", err => {
    if (err) {
      console.error(err);
    }
    const sqlite = require('sqlite3').verbose();
    const db = new sqlite.Database('./database.db', sqlite.OPEN_READWRITE,(err)=> {
        if (err) return console.error(err);
    });

    var sql;

    sql = `CREATE TABLE schools(ID INTEGER PRIMARY KEY, schoolName, districtName, schoolId, districtId, provinceId, votes, totalWins)`
    db.run(sql);

    sql = `CREATE TABLE school_meals(ID INTEGER PRIMARY KEY, schoolId, mealName, enMealName, imageURL, wins)`
    db.run(sql);
  });