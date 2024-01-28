require('dotenv').config({ path: '.env' })
const servers = require('./server.json');
const Discord = require('discord.js');
const Docker  = require('dockerode');
const os      = require('os');

const botIntents = [];
botIntents.push(Discord.GatewayIntentBits.GuildMessages);
botIntents.push(Discord.GatewayIntentBits.Guilds);
botIntents.push(Discord.GatewayIntentBits.MessageContent);
// botIntents.push(Discord.GatewayIntentBits.DirectMessages);         // Use this if you want to receive DMs
// botIntents.push(Discord.GatewayIntentBits.DirectMessageTyping);    // Use this if you want to receive DMs
const client = new Discord.Client({
	intents: botIntents,
	// partials: [
    //     Discord.Partials.Channel,                                  // Use this if you want to receive DMs
    // ]
});
const docker = new Docker({socketPath: process.env.DOCKER_SOCKET_PATH});

const token =  process.env.TOKEN;

function checkAvailableMemory(requiredMemoryInMB) {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const requiredMemory = requiredMemoryInMB * 1024 * 1024;

    console.log(`Total Memory: ${totalMemory / (1024 * 1024)} MB`);
    console.log(`Free Memory: ${freeMemory / (1024 * 1024)} MB`);

    if (freeMemory >= requiredMemory) {
        console.log('Sufficient memory available to start the container.');
        return true;
    } else {
        console.log('Insufficient memory to start the container.');
        return false;
    }
}

async function startContainer(containerFromCommand, actualContainerName, message) {
	try {
		const container = docker.getContainer(actualContainerName);
		const data = await container.inspect();

		if (data.State.Running) {
			console.log(`Container ${containerFromCommand} is already running.`)
			message.channel.send(`Container ${containerFromCommand} is already running.`);
		} else {
			console.log(`Container ${containerFromCommand} is not running. Starting ...`)
			await container.start();
			message.channel.send(`Container ${containerFromCommand} started!`);
		}
	} catch (error) {
		console.log(`Error: ${error.message}`);
		message.channel.send(`Unable to execute command. Possible configuration issue. Check logs for more details.`);
	}
}

async function stopContainer(containerFromCommand, actualContainerName, message) {
	try {
		const container = docker.getContainer(actualContainerName);
		const data = await container.inspect();
		
		if (!data.State.Running) {
			message.channel.send(`Container ${containerFromCommand} is already stopped.`);
		} else {
			await container.stop();
			message.channel.send(`Container ${containerFromCommand} stopped!`);
		}
	} catch (error) {
		message.channel.send(`Unable to execute command. Possible configuration issue. Check logs for more details.`);
		console.log(`Error: ${error.message}`);
	}
}


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
	const containerName = args.length > 0 ? args[0] : null;
	
	// get server info from server.json
	const server = containerName ? servers.find(server => server.name === containerName) : null;
	const serverHasMemoryToStart = server && server.doMemoryCheck ? checkAvailableMemory(server.requiredMemoryForServer) : true;

	switch (command) {
		case "start":
			console.log("Received start command: " + containerName);
			if(server && serverHasMemoryToStart) {
				await startContainer(containerName, server.containerName, message);
			} else if (containerName === "test") {
				console.log(`Really? You want me to start ${containerName} container?`);
				message.channel.send(`Really? You want me to start ${containerName} container?`);
			} else {
				console.log("Server not configured ...");
				message.channel.send("Server not configured ...");
			}
			break; // Add break statement here
		case "stop":
			console.log("Received stop command" + containerName);
			if(server) {
				await stopContainer(containerName, server.containerName, message);
			} else {
				console.log("Server not configured ...");
				message.channel.send("Server not configured ...");
			}
			break; // Add break statement here
	}

});

client.login(token);