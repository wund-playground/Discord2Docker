<div align="left">
  <br />
  <p>
    <img src="https://img.shields.io/packagist/l/doctrine/orm.svg" alt="MIT Liscense" />
  </p>
</div>

# DISCORD DOCKER
A Discord bot that can start / stop specific configured containers running in the same docker environment.

For example, if you have an ARK dedicated server running on a docker container and 
you want your friends on your private Discord server to be able to start/stop the ark server, then
you can build and start this bot container on the same server as the ARK container and
you will be able to start / stop that specific ARK container from within discord.

Why? So that you can save the resources when you're not using them.
Or if you have multiple containers (ARK, 7 days to die, Valheim, etc) but don't want to keep all servers up
whem noone's playing.

This is a hobby project, so don't expect much as there isn't a defined direction yet.




# Setup

## Requirements
```
nodejs 16
```

If you don't already have a Discord bot configured, you can follow this documentation, else, go to next step:
https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot

Create a .env file in the project root directory with these env variables: (Without < >)
```
TOKEN=<Bot login token>
DOCKER_SOCKET_PATH=/var/run/docker.sock // this is the default value
```

Open server.json with your favorite editor and modify your servers list
```
[{
    "name": "ark",
    "requiredMemoryForServer": 12000,
    "doMemoryCheck": false,
    "containerName": "hello-world"
}]
```
|    |   |
| ------------- | ------------- |
| name  | the name of the command that will be used in discord (ex. if name is 'ark', command in discord will be '!start ark')  |
| requiredMemoryForServer | if you know how much memory in MB that your container aproximatly uses (ex for 12GB put something along the lines of 12000 or more precisely 12288 )  |
| doMemoryCheck | if you want to check if you have that amount of memory available on your os running docker  |
| containerName | the actual name of the container that is going to be started by the '!start ark' command  |
|    |   |


## ADDING EXTRA SERVERS

Add more entries in the server.json, for example:
```
[{
    "name": "ark",
    "requiredMemoryForServer": 12000,
    "doMemoryCheck": false,
    "containerName": "hello-world"
},
{
    "name": "ark2",
    "requiredMemoryForServer": 12000,
    "doMemoryCheck": false,
    "containerName": "ark-server"
}]
```
You can now run `!start ark2` after you install/rebuild/restart your bot.

<br/>

# Installation
### Running as a docker container on the same machine as the game servers containers
- Clone this repository and run:

```
docker compose up -d --build
```

### Running standalone but on the same machine where docker is running:

```
npm install
node bot.js
```

## COMMANDS

| Command  | Description |
| ------------- | ------------- |
| !start test  | Displays test message  |
| !start ark  | Starts ARK container  |
| !stop ark  | Stops ARK container  |


## Integrating with existing bot

If you already have a discord bot using discord.js, then just make sure you have dockerode and dotenv also installed (or other package dependencies mentioned in package.json)

Files needed:
- actions.js
- .env (you can merge with your existing .env file)
- servers.json (to read servers configs)

You can find an integration example in bot.js