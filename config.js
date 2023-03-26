const config = {
    schoolApiUrl: "https://skolmaten.se/api/3",  
    databaseDir: "./database.db",
    foodDate: {year: 2023, week: 11, day: 1},
    foodOptionsInVoting: 2,

    schoolRequestConfig: {
        headers: {
            "Client" : "aa",
            "ClientVersion" : "a"
        }
    },
    discordToken: "lol",
    photosFolder: "./photos"
}

module.exports = config;