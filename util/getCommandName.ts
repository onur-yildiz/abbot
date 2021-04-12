export const getCommandName = (
  commandMessage: string,
  prefix: string
): string => {
  if (commandMessage.startsWith(prefix)) {
    return commandMessage.slice(prefix.length).split(" ")[0];
  }
  return "";
};
