const JOIN_CHANNEL_GENERIC =
  ":x: You have to be in the voice channel to do that.";
const JOIN_CHANNEL_PLAY = ":x: You have to be in a voice channel to do that.";

const QUEUE_EMPTY = "The queue is empty :no_entry_sign: :zzz:";
const QUEUE_EMPTY_SKIP =
  "There is no more items in the queue :no_entry_sign: :zzz:";
const QUEUE_EMPTY_CLEAR = "The queue is already empty :no_entry_sign: :zzz:";
const QUEUE_CLEARED = "Cleared :wastebasket:";

const HORN_PLAYING_MUSIC =
  "I am playing music.\nYou have to clear the queue and skip the current track to play audio!"; // TODO make stop/resume compatible

const SETHORN_NOT_ALLOWED = "This alias is not allowed!";

const PERMISSIONS_PLAY =
  "I need the permissions to join and speak in the voice channel";

const ERROR_COMMAND_NOT_VALID = "this is not a valid command!";
const ERROR_SAVE_THEME = "an error occured during saving the theme!";
const ERROR_EXECUTION_ERROR =
  "there was an error trying to execute that command!";
const ERROR_COULD_NOT_DL_FILE = "there was an error downloading the file!";
const ERROR_CONNECTING =
  "an error occured during connecting to the voice channel!";
const ERROR_DB_CONN = "an error occured during database connection!";
const ERROR_CLEAR_MESSAGES = "something went wrong deleting the messages.";
const ERROR_PARSE_YAML =
  "an error occured during parsing yaml file. Are you sure it is a correctly formatted yaml file?";
const ERROR_INVALID_FORMAT = "invalid format.";

const BOT_NOT_IN_CHANNEL = ":x: I am not active in a channel";
const BOT_NOT_IN_SAME_CHANNEL = ":x: I am in another voice channel";

const DISCONNECTED = "Disconnected. :airplane:";
const PAUSED = "Paused :pause_button:";
const ALREADY_PAUSED = "Already paused :zzz:";
const NOTHING_IS_PLAYING = "Nothing is playing :zzz:";
const RESUMING = "Resuming :play_pause:";
const ALREADY_PLAYING = "Already playing. :zzz:";
const NOTHING_TO_PLAY = "There is nothing to play :zzz:";
const SKIPPED = "Skipped :track_next:";
const PONG = "Pong :ping_pong:";
const NO_SAVED_ARGS = "There are no saved arguments for this command.";

const REPLY_CANT_EXECUTE_DM = "I can't execute that command inside DMs!";
const REPLY_NOT_ALLOWED = "you are not allowed to do this!";
const REPLY_NO_ARGS = "you did not provide any arguments!";
const REPLY_ATTACH_YAML = "please attach a yaml file when using this command!";

export {
  JOIN_CHANNEL_GENERIC,
  JOIN_CHANNEL_PLAY,
  QUEUE_EMPTY,
  QUEUE_EMPTY_SKIP,
  QUEUE_EMPTY_CLEAR,
  QUEUE_CLEARED,
  HORN_PLAYING_MUSIC,
  SETHORN_NOT_ALLOWED,
  PERMISSIONS_PLAY,
  ERROR_COMMAND_NOT_VALID,
  ERROR_SAVE_THEME,
  ERROR_EXECUTION_ERROR,
  ERROR_COULD_NOT_DL_FILE,
  ERROR_DB_CONN,
  ERROR_CONNECTING,
  ERROR_CLEAR_MESSAGES,
  ERROR_PARSE_YAML,
  ERROR_INVALID_FORMAT,
  BOT_NOT_IN_CHANNEL,
  BOT_NOT_IN_SAME_CHANNEL,
  DISCONNECTED,
  PAUSED,
  ALREADY_PAUSED,
  NOTHING_IS_PLAYING,
  RESUMING,
  ALREADY_PLAYING,
  NOTHING_TO_PLAY,
  SKIPPED,
  PONG,
  NO_SAVED_ARGS,
  REPLY_CANT_EXECUTE_DM,
  REPLY_NOT_ALLOWED,
  REPLY_NO_ARGS,
  REPLY_ATTACH_YAML,
};
