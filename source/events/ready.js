const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        const statusBOT = [
            {
                name: 'Powered by Punish',
                type: ActivityType.Listening,
                status: 'online'
            },
            {
                name: 'Gerenciando seu servidor...',
                type: ActivityType.Playing,
                status: 'online'
            }
        ]

        setInterval( () => {
            let random = Math.floor(Math.random() * statusBOT.length);
            client.user.setActivity(statusBOT[random]);
        }, 300);        

        console.log(`[APLICATIVO]: Aplicativo online com sucesso.`);
    },
};