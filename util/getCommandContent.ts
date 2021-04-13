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
