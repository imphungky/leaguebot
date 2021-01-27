require('dotenv').config();
const {Client, MessageEmbed} = require('discord.js');
const {prefix, regions} = require('./config.json');
const axios = require('./axiosConfig.js');
const {
    getPatch,
    getuserInfo,
    getchampmastery,
    champIDtoName
} = require('./championFetch.js');
const client = new Client();
const BOT_TOKEN = process.env.BOT_TOKEN;
const RIOT_TOKEN = process.env.RIOT_TOKEN;
//after the client is ready, log that it's prepared to take and run commands
client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message =>  {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
        //split message as a space as delimiter
        let args = message.content.slice(prefix.length).trim().split(/ +/);
        let command = args.shift().toLowerCase();
        switch(command) {
            case "getinfo":
                let summoner_name = args[0];
                getuserInfo(summoner_name)
                .then((user_data) => {
                    message.channel.send(`icon: ${user_data.profileIconId}`);
                })
                .catch((err) => {
                    if(err.response.status === 404) {
                        return message.channel.send('User not Found');
                    }
                    message.channel.send('Could not complete request');
                });
                break;
            case "patch":
                if(args.length) {
                    return message.channel.send("Usage: !patch");
                }
                getPatch().then((data) => {
                    if(!data) {
                        return message.channel.send("Could not retrieve latest patch");
                    }
                    return message.channel.send(
                    `The current patch is: ${data.patch}\n` +
                    `https://na.leagueoflegends.com/en-us/news/game-updates/patch-${data.url_patch}-notes/`);
                });
                break;
            case "mastery":
                if(!args.length) {
                    return message.channel.send("Usage: !championmastery <summonername> <champion>")
                }
                let user_icon = "";
                getuserInfo(args[0])
                .then((user_data) => {
                    user_icon = user_data.profileIconId;
                    return getchampmastery(user_data.id, args[1]);
                })
                .then(async (masteries) => {
                    let namepromises = masteries.map((mastery) => {
                        return champIDtoName(mastery.championId);
                    });
                    let names = await Promise.all(namepromises);
                    return masteries.map((mastery, index) => {return {...mastery, ...names[index]}});
                })
                .then((masteries) => {
                    for(let i = 0; i < masteries.length; i++) {
                        const exampleEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`${args[0]} Top Champion Masteries`)
                        .setURL('https://discord.js.org/')
                        .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/11.2.1/img/profileicon/${user_icon}.png`)
                        .setImage(`http://ddragon.leagueoflegends.com/cdn/11.2.1/img/champion/${masteries[i].image}`)
                        .addFields(
                            { name: masteries[i].name, value: masteries[i].title },
                            // { name: '\u200B', value: '\u200B' },
                            { name: 'Champion Mastery', value: masteries[i].championPoints, inline: true },
                            { name: 'Champion Level', value: masteries[i].championLevel, inline: true },
                        )
                        .setFooter(`Mastery Level ${masteries[i].championLevel}` , `https://raw.githubusercontent.com/RiotAPI/Riot-Games-API-Developer-Assets/master/champion-mastery-icons/mastery-${masteries[i].championLevel}.png`);
                        message.channel.send(exampleEmbed);
                    }
                })
                .catch((err) => console.log(err));
                
        }
});

//login to Discord as the bot using the provided token
client.login(BOT_TOKEN);


        // if(command === 'getinfo') {
        //     let summoner_name = args[0];
        //     getuserInfo(summoner_name)
        //     .then((user_data) => {
        //         message.channel.send(`icon: ${user_data.profileIconId}`);
        //     })
        //     .catch((err) => {
        //         message.channel.send('Could not complete request');
        //     });            
        // }
        // else if(command === 'patch') {
        //     if(args.length) {
        //         return message.channel.send("Usage: <!patch>");
        //     }
        //     getPatch().then((data) => {
        //         if(!data) {
        //             return message.channel.send("Could not retrieve latest patch");
        //         }
        //         return message.channel.send(`The current patch is: ${data.patch} \n https://na.leagueoflegends.com/en-us/news/game-updates/patch-${data.url_patch}-notes/`);
        //     });
        // }