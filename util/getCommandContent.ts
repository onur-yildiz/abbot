export const getCommandContent = (commandMessage: string): string => {
  const prefix = process.env.PREFIX;
  const regex = new RegExp(`^[${prefix}](?:.*?)\\s(.*)(?=\\s|$)`);
  if (regex.test(commandMessage)) {
    const res = regex.exec(commandMessage);
    return res ? res[1].trim() : "";
  }
  return "";
};
