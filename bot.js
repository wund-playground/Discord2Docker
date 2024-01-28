require('dotenv').config({ path: '.env' })

const containerActions = require('./actions.js');
const Discord = require('discord.js');

const botIntents = [];
botIntents.push(Discord.GatewayIntentBits.GuildMessages);
botIntents.push(Discord.GatewayIntentBits.Guilds);
botIntents.push(Discord.GatewayIntentBits.MessageContent);
const client = new Discord.Client({
	intents: botIntents,
});


const token =  process.env.TOKEN;
const commandPrefix = process.env.COMMAND_PREFIX;
const containerStartCommand = process.env.CONTAINER_START_COMMAND;
const containerStopCommand = process.env.CONTAINER_STOP_COMMAND;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(commandPrefix) || message.author.bot) return;
	
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

	switch (command) {
		case containerStartCommand:
			await containerActions.doContainerAction(args, 'start', message);
			break;
		case containerStopCommand:
			await containerActions.doContainerAction(args, 'stop', message);
			break;
	}
});

client.login(token);