import youtubedl from "youtube-dl-exec";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { interactionPayload, ResponseType } from "../types";
import { client } from "../clients/discord";

export const play = async ({ req, res }: interactionPayload) => {
  const interaction = req.body;
  let connection: VoiceConnection | null = null;
  const url = interaction.data.options[0]?.value;

  if (!url) {
    return res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Please provide a valid YouTube URL." }
    });
  }

  const guild = client.guilds.cache.get(interaction.guild_id);
  const member = await guild?.members.fetch(interaction.member.user.id);

  if (!member?.voice.channel) {
    return res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ You must be in a voice channel to use this command." }
    });
  }

  try {
    connection = joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: interaction.guild_id,
      adapterCreator: guild?.voiceAdapterCreator as any
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    res.json({
      type: ResponseType.Immediate,
      data: { content: `🎉 Started the party 🎉` }
    });

    // ✅ Use yt-dlp to get the direct audio URL
    const audioInfo = (await youtubedl(url, {
      dumpSingleJson: true, // Ensure JSON output
      format: "bestaudio[ext=webm]", // ✅ Force best audio format
      noPlaylist: true, // ✅ Ensure it's a single video
      noCheckCertificates: true, // ✅ Prevent SSL errors
      addHeader: ["referer:youtube.com", "user-agent:googlebot"] // ✅ Spoof headers for YouTube
    })) as any;

    if (!audioInfo || !audioInfo.url) {
      throw new Error("No valid audio URL found.");
    }

    // ✅ Create an audio resource using the extracted URL
    const audioResource = createAudioResource(audioInfo.url);
    player.play(audioResource);
  } catch (error) {
    console.error("❌ Error playing audio:", error);
    return res.json({
      type: ResponseType.Immediate,
      data: { content: "❌ Error playing music." }
    });
  }
};
