const Docker  = require('dockerode');
const { Module } = require('module');
const os      = require('os');
const servers = require('./servers.json');

const docker = new Docker({socketPath: process.env.DOCKER_SOCKET_PATH});

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

async function doContainerAction(args, containerCommand, message) {
    const containerName = args.length > 0 ? args[0] : null;
        
    // Get server info from servers.json
    const server = containerName ? servers.find(server => server.name === containerName) : null;
    const serverHasMemoryToStart = server && server.doMemoryCheck ? checkAvailableMemory(server.requiredMemoryForServer) : true;
    
    console.log("Received " + containerCommand + " command: " + containerName);
    if(containerCommand === 'start') {
        if(server && serverHasMemoryToStart) {
            await startContainer(containerName, server.containerName, message);
        } else {
            console.log("Server not configured ...");
            message.channel.send("Server not configured ...");
        }
    } else if(containerCommand === 'stop') {
        if(server) {
            await stopContainer(containerName, server.containerName, message);
        } else {
            console.log("Server not configured ...");
            message.channel.send("Server not configured ...");
        }
    } else {
        console.log("Unknown command: " + containerCommand);
        message.channel.send("Unknown command: " + containerCommand);
    }
}

module.exports = {
    doContainerAction
}