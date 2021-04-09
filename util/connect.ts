import { QueueContract } from "discord.js";

export const connect = async (queueContract: QueueContract) => {
  const connection = await queueContract.voiceChannel.join();
  queueContract.connection = connection;
  return queueContract;
};
