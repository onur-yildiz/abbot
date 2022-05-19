import fs from "fs";

const getDefaultAudios = (): string[] => {
  return fs
    .readdirSync("./assets/audio")
    .filter((audio) => audio.endsWith(".mp3"))
    .map((audio) => audio.slice(0, -4));
};

export default getDefaultAudios;
