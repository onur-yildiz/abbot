// convert seconds to hh:mm:ss
const hhmmss = (durationInSeconds: number): string => {
  const hours = Math.trunc(durationInSeconds / 3600);
  const minutes = Math.trunc((durationInSeconds % 3600) / 60);
  const seconds = Math.trunc(durationInSeconds % 60);

  const fHours: string = hours > 0 ? hours + ":" : "";
  const fMinutes: string =
    (hours > 0 ? `${minutes}`.padStart(2, "0") : minutes) + ":";
  const fSeconds: string = `${seconds}`.padStart(2, "0");

  return fHours + fMinutes + fSeconds;
};

// convert hh:mm:ss to seconds
const hhmmssToSeconds = (durationString: string): number => {
  const sections: string[] = durationString.split(":").reverse();
  const parsedSections: number[] = sections.map((section) => parseInt(section));

  let eta = 0;
  if (parsedSections[0]) eta += parsedSections[0];
  if (parsedSections[1]) eta += parsedSections[1] * 60;
  if (parsedSections[2]) eta += parsedSections[2] * 3600;
  return eta;
};

export default { hhmmss, hhmmssToSeconds };
