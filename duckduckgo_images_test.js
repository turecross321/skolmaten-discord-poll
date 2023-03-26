const DuckDuckGoImages = require('duckduckgo-images-api');

DuckDuckGoImages.image_search({ query: "fiskgratäng med smak av gräslök", moderate: true, iterations: 1 }).then(results=>console.log(results))

    //Fiskgratäng med smak av gräslök, potatis och kokt grönsak