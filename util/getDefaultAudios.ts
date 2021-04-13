import fs from "fs";

export const getDefaultAudios = () => {
  return fs
    .readdirSync("./assets/audio")
    .filter((audio) => audio.endsWith(".mp3"))
    .map((audio) => audio.slice(0, -4));
};
