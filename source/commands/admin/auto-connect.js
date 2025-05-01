const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const query = require('samp-query');
const { loadCFGCONNECT, saveCFGCONNECT, loadMSGDATA, saveMSGDATA } = require('../../../source/functions/y_Jsons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('auto-connect')
    .setDescription('Estabelecer conexão com servidor!'),

  async execute(interaction) {
    try {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(`Você não **possui** permissão para utilizar este comando!`)
              .setColor('Red')
          ],
          ephemeral: true
        });
      }

      const CFG = loadCFGCONNECT();

      if (!CFG.connection || !CFG.connection.active) {
        const embed = new EmbedBuilder()
          .setTitle('**Atenção:**')
          .setDescription(`O sistema de **auto conexão** não está ativado, ative-o primeiro!`)
          .setColor('Red');

        return interaction.reply({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
      }

      const SERVER_IP = CFG.connection.ip;

      if (!SERVER_IP) {
        const embed = new EmbedBuilder()
          .setTitle('**Atenção:**')
          .setDescription(`O **IP** de **conexão** não está configurado, configure-o primeiro!`)
          .setColor('Red');

        return interaction.reply({ embeds: [embed] }).then((msg) => setTimeout(() => msg.delete(), 5000));
      }

      const embed = new EmbedBuilder()
        .setDescription(`**Copiar e colar no seu SA:MP:**
\`\`\`
Carregando...
\`\`\`
**Status:** 
\`\`\`
Carregando...
\`\`\`
**Jogadores:**
\`\`\`
Carregando...
\`\`\``)
        .setFooter({ iconURL: interaction.guild.iconURL({ dynamic: true }), text: `Atualizado a:` });

      let existingMessage;
      const messageData = loadMSGDATA();

      if (messageData) {
        try {
          const channel = await interaction.client.channels.fetch(messageData.channelId);
          existingMessage = await channel.messages.fetch(messageData.messageId);
        } catch {}
      }

      if (!existingMessage) {
        existingMessage = await interaction.channel.send({
          embeds: [embed],
          fetchReply: true,
        });

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('Green')
              .setDescription(`Olá **usuário(a)** ${interaction.user} a embed foi enviada com sucesso!`)
          ],
          ephemeral: true
        });

        saveMSGDATA({
          channelId: existingMessage.channel.id,
          messageId: existingMessage.id,
        });
      }

      async function fetchServerInfo(SERVER_IP) {
        const [host, port] = SERVER_IP.split(':');
        return new Promise((resolve, reject) => {
          query({ host, port: parseInt(port) }, (error, response) => {
            if (error) return reject(error);
            resolve(response);
          });
        });
      }

      async function updateServerInfo() {
        try {
          const response = await fetchServerInfo(SERVER_IP);
          const players = response.players?.length || 0;
          const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

          const embed = new EmbedBuilder()
            .setDescription(`**Copiar e colar no seu SA:MP:**
\`\`\`
${SERVER_IP}
\`\`\`
**Status:** 
\`\`\`
ONLINE
\`\`\`
**Jogadores:**
\`\`\`
${players}
\`\`\``)
            .setFooter({ iconURL: interaction.guild.iconURL({ dynamic: true }), text: `Atualizado a: ${timeNow}` });

          await existingMessage.edit({ embeds: [embed] });
        } catch {
          console.log('[ERROR]: Error em conectar ao servidor...');
        }
      }

      await updateServerInfo();
      setInterval(updateServerInfo, 60000);

    } catch (error) {
      console.error('[ERROR]:', error);
    }
  }
};