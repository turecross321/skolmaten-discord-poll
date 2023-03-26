const fs = require('fs');
const Axios = require('axios')

async function downloadImage(url, filepath) {
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}

downloadImage('https://tse2.mm.bing.net/th?id=OIP.8V1IGP2KwZRp4TI4kEMGIAHaE1&pid=Api', './2.jpeg')