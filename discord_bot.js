const config = require('./config');
const TOKEN = config.discordToken;

const voting = require('./voting');

const { Client, GatewayIntentBits } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { Console } = require('console');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ],
});

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.id == "249264555258150912"){
    GetMeals(message);
  }
});

async function GetMeals(message) {
  let meals = await voting.getMeals();

  let attachments = [];
  let messageToSend = "";

  for (let meal of meals) {
    let imagePath = await voting.getMealImage(meal);

    attachments.push({"attachment": imagePath});
    messageToSend += meal.enMealName + "\n";
  };

  await message.channel.send({content: messageToSend, files: attachments});
}

client.login(TOKEN);