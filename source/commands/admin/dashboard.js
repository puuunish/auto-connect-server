const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { loadCFGCONNECT, saveCFGCONNECT } = require('../../../source/functions/y_Jsons.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Painel geral do aplicativo'),

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
      } else {
        const CFG = loadCFGCONNECT();
        const embed = new EmbedBuilder()
          .setTitle('# 📊 Painel Geral')
          .setDescription(`Olá seja bem-vindo(a) ao painel **geral** do bot. Aqui você pode configurar o sistema de conexão do bot usando os botões abaixo!`)
          .setColor('Yellow')
          .addFields(
          {
            name: 'IP de **conexão:**:',
            value: CFG.connection?.ip ? `\`${CFG.connection.ip}\`` : '**Não configurado**', 
            inline: true
          },
          {
            name: 'Sistema de **conexão**:', 
            value: CFG.connection?.active ? '**Ativado**' : '**Desativado**', 
            inline: true
          }
          );

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('ip_connect')
              .setLabel('IP de Conexão')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🚥'),
            new ButtonBuilder()
              .setCustomId('true_connect')
              .setLabel('Ativar')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🟢'),
            new ButtonBuilder()
              .setCustomId('false_connect')
              .setLabel('Desativar')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('🔴')
          );

        return interaction.reply({ embeds: [embed], components: [row] });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`Erro ao executar este **comando**!`)
            .setColor('Red')
        ],
        ephemeral: true
      });
    }
  },

  async handleButton(interaction) {
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

      if (interaction.customId === 'ip_connect') {
        if (interaction.replied || interaction.deferred) return;

        const embed = new EmbedBuilder()
          .setDescription(`Digite o IP de conexão no formato:\n\`\`\`127.0.0.1:7777\`\`\``)
          .setColor('Green');

        await interaction.reply({ embeds: [embed], ephemeral: true });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', msg => {
          const ipRegex =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\:(\d+)$/;

          if (!ipRegex.test(msg.content)) {
            return interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`O IP de **conexão** não está correto!`)
                  .setColor('Red')
              ],
              ephemeral: true
            });
          }

          const CFG = loadCFGCONNECT();
          CFG.connection = CFG.connection || {};
          CFG.connection.ip = msg.content;
          saveCFGCONNECT(CFG);
          interaction.message.edit({ embeds: [generateEmbed()] });

          return interaction.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription(`O IP de **conexão** foi definido para **${msg.content}**`)
                .setColor('Green')
            ],
            ephemeral: true
          });
          
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            return interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setDescription(`Você demorou muito e a operação foi cancelada!`)
                  .setColor('Orange')
              ],
              ephemeral: true
            });
          }
        });
      } else if (interaction.customId === 'true_connect') {
        if (interaction.replied || interaction.deferred) return;
        const CFG = loadCFGCONNECT();
        CFG.connection = CFG.connection || {};
        CFG.connection.active = true;
        saveCFGCONNECT(CFG);
        interaction.message.edit({ embeds: [generateEmbed()] });
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setDescription(`Sistema ativado com sucesso!`)
            .setColor('Green')
            ], ephemeral: true
        })
      } else if (interaction.customId === 'false_connect') {
        if (interaction.replied || interaction.deferred) return;
        const CFG = loadCFGCONNECT();
        CFG.connection = CFG.connection || {};
        CFG.connection.active = false;
        saveCFGCONNECT(CFG);
        interaction.message.edit({ embeds: [generateEmbed()] });
        
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
            .setDescription(`Sistema desativado com sucesso!`)
            .setColor('Green')
            ], ephemeral: true
        })
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`Erro ao executar este **comando**!`)
            .setColor('Red')
        ],
        ephemeral: true
      });
    }
  }
};

const generateEmbed = () => {
  const CFG = loadCFGCONNECT();
  return new EmbedBuilder()
  .setTitle('# 📊 Painel Geral')
  .setDescription(`Olá seja bem-vindo(a) ao painel **geral** do bot. Aqui você pode configurar o sistema de conexão do bot usando os botões abaixo!`)
  .setColor('Yellow')
  .addFields(
    {
      name: 'IP de **conexão:**:',
      value: CFG.connection?.ip ? `\`${CFG.connection.ip}\`` : '**Não configurado**', 
      inline: true
    },
    {
      name: 'Sistema de **conexão**:', 
      value: CFG.connection?.active ? '**Ativado**' : '**Desativado**', 
      inline: true
    });
}