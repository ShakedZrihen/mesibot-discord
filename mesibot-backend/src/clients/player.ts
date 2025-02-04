import { createAudioPlayer, VoiceConnection } from "@discordjs/voice";

export const player = createAudioPlayer();

export const Connection = (() => {
  let connection: VoiceConnection | null = null;

  return {
    setConnection: (newConnection: VoiceConnection) => {
      connection = newConnection;
    },
    getConnection: () => connection
  };
})();
