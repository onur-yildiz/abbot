export const getCommandName = (commandMessage: string): string => {
  const prefix = process.env.PREFIX;
  const regex = new RegExp(`^[${prefix}](.*?)(?=\\s|$)`);
  if (regex.test(commandMessage)) {
    const res = regex.exec(commandMessage);
    return res ? res[1].toLowerCase() : "";
  }
  return "";
};
