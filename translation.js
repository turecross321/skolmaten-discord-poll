const { generateRequestUrl, normaliseResponse } = require('google-translate-api-browser');
const axios = require('axios');

module.exports = {
    Translate: async function(textToTranslate) {return await TranslateSwedishToEnglish(textToTranslate);},
}

async function TranslateSwedishToEnglish(textToTranslate) {
    let translationUrl = generateRequestUrl(textToTranslate, { to: "en" });

    let result = await axios.get(translationUrl);
    return result.data[0][0][0];
}