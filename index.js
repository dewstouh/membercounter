const Discord = require('discord.js');
const config = require('./config/config.json');
const Enmap = require('enmap');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ]
});


client.on("ready", () => {
    console.log(`Connected as ${client.user.tag}`);
});

client.setups = new Enmap({
    name: "setups",
    dataDir: "./databases"
});

client.on("messageCreate", async message => {
    if(message.author.bot || !message.guild || !message.channel) return;
    client.setups.ensure(message.guild.id,{
        total: "",
        humans: "",
        bots: ""
    });
    const args = message.content.slice(config.prefix.length).trim().split(" ");
    const command = args.shift()?.toLowerCase();

    console.log(client.setups.get(message.guild.id))

    if(command == "ping"){
        return message.reply(`The Bot's Ping is \`${client.ws.ping}ms\``)
    }

    if(command == "setup-membercount" || command == "setup-serverstats" || command == "setup-membercounter"){
        if(!args.length || !["total", "humans", "bots"].includes(args[0])) return message.reply(`Please select what method do you want to use!\nMethods: \`total\`, \`humans\`, \`bots\``);
        if(args[0] == "total"){
            let channel = message.guild.channels.cache.get(args[1]);
            if(!channel) return message.reply(`The Channel you specified doesn't exist in this Server!`);
            client.setups.set(message.guild.id, channel.id, "total");
            return message.reply(`✅ Succesfully set the **Total** Member Count to <#${channel.id}>`)
        }

        if(args[0] == "humans"){
            let channel = message.guild.channels.cache.get(args[1]);
            if(!channel) return message.reply(`The Channel you specified doesn't exist in this Server!`);
            client.setups.set(message.guild.id, channel.id, "humans");
            return message.reply(`✅ Succesfully set the **Humans** Member Count to <#${channel.id}>`)
        }

        if(args[0] == "bots"){
            let channel = message.guild.channels.cache.get(args[1]);
            if(!channel) return message.reply(`The Channel you specified doesn't exist in this Server!`);
            client.setups.set(message.guild.id, channel.id, "bots");
            return message.reply(`✅ Succesfully set the **Bots** Member Count to <#${channel.id}>`)
        }

    }

})

client.login(config.token)

setInterval(async () => {
    const guilds = client.setups.keyArray();
    for (const guild of guilds){
        let data = client.setups.get(guild)
        if(!data) return;
        const cachedguild = client.guilds.cache.get(guild);
        if(!cachedguild) return;
        try {
            let totalchannel = cachedguild.channels.cache.get(data.total)
            let humanschannel = cachedguild.channels.cache.get(data.humans)
            let botschannel = cachedguild.channels.cache.get(data.bots)

            await cachedguild.members.fetch()

            try {
                totalchannel.setName(`Total: ${cachedguild.members.cache.size}`)
            } catch {}
            try {
                humanschannel.setName(`Members: ${cachedguild.members.cache.filter(member => !member.user.bot).size}`)
            } catch {}
            try {
                botschannel.setName(`Bots: ${cachedguild.members.cache.filter(member => member.user.bot).size}`)
            } catch {}
        } catch(e) {
            console.log(e)
        }

    }
}, 60 * 10000);

/*
CODED BY DEWSTOUH#1088
7 JANUARY OF 2022
MAKE SURE TO GIVE CREDITS WHEN USING THE CODE!
*/