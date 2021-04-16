export const getCommandContent = (
  commandMessage: string,
  prefix: string
): string => {
  return commandMessage
    .slice(prefix.length)
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();
};

export const getCommandName = (
  commandMessage: string,
  prefix: string
): string => {
  if (commandMessage.startsWith(prefix)) {
    return commandMessage.slice(prefix.length).split(" ")[0].toLowerCase();
  }
  return "";
};
