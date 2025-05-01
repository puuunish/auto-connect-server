const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const query = require('samp-query');
const { loadMSGDATA, saveMSGDATA } =
require('../../source/functions/y_Jsons.js');
const client = require('../../index.js');

client.once('ready', async () => {
  const messageData = loadMSGDATA();
  if (!messageData) {
    console.log('[ERROR]: Nenhuma mensagem salva encontrada.');
    return;
  }

  try {
    const channel = await client.channels.fetch(messageData.channelId);
    const existingMessage = await channel.messages.fetch(messageData.messageId);

    const CFG = loadCFGCONNECT();
    if (!CFG || !CFG.connection || !CFG.connection.ip) {
      console.error('[ERROR]: Erro: CFGuração de conexão inválida.');
      return;
    }

    const SERVER_IP = CFG.connection.ip;

    async function fetchServerInfo(SERVER_IP) {
      if (!SERVER_IP || !SERVER_IP.includes(':')) {
        throw new Error('[ERROR]: IP do servidor inválido ou ausente. Certifique-se de que o formato seja host:port.');
      }

      const [host, port] = SERVER_IP.split(':');
      if (!host || !port) {
        throw new Error('[ERROR]: Falha ao dividir o IP do servidor em host e porta.');
      }

      return new Promise((resolve, reject) => {
        query({ host, port: parseInt(port) }, (error, response) => {
          if (error) {
            console.error('[ERROR]: Erro ao conectar ao servidor:', error.message);
            return reject(error);
          }
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
          .setFooter({ iconURL: channel.guild.iconURL({ dynamic: true }), text: `Atualizado a: ${timeNow}` });

        await existingMessage.edit({ embeds: [embed] });
      } catch (error) {
        console.error('[ERROR]: Erro ao atualizar informações do servidor:', error.message);
      }
    }

    await updateServerInfo();
    setInterval(updateServerInfo, 30000);

  } catch (error) {
    console.error('[ERROR]: Erro ao carregar mensagem após reinício:', error.message);
  }
});