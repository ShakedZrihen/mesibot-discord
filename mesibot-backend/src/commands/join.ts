import { joinVoiceChannel } from "@discordjs/voice";
import { client } from "../clients/discord";
import { interactionPayload, ResponseType } from "../types";

export const join = async ({ req, res }: interactionPayload) => {
  const interaction = req.body;
  const guild = client.guilds.cache.get(interaction.guild_id);
  const member = await guild?.members.fetch(interaction.member.user.id);
  let connection: any = null;

  if (!member?.voice.channel) {
    return res.json({ type: 4, data: { content: "❌ You must be in a voice channel to use this command." } });
  }

  // Join the voice channel
  connection = joinVoiceChannel({
    channelId: member.voice.channel.id,
    guildId: interaction.guild_id,
    adapterCreator: guild?.voiceAdapterCreator as any,
    debug: true,
  });

  return res.json({ type: ResponseType.Immediate, data: { content: `🎤 Joined ${member.voice.channel.name}` } });
};
