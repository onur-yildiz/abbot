declare module "discord.js" {
  type GuildData = {
    textChannel: TextChannel | DMChannel | NewsChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Array<Song>;
    volume: number;
    isQueueActive: boolean;
    greetingEnabled: boolean;
    prefix: string;
    lastTrackStart: number;
    annoyanceList: Map<string, string>;
    isArbitrarySoundsEnabled: boolean;
    arbitrarySoundsTimer?: NodeJS.Timeout;
    quitTimer?: NodeJS.Timeout;
  };

  type Guilds = Map<string, GuildData>;

  type Command = {
    name: string;
    description: string;
    isGuildOnly: boolean;
    aliases: Array<string>;
    usage: string;
    args: Args;
    permissions?: PermissionResolvable;
    cooldown?: number;
    argList?: Array<string>;
    execute: Function;
  };

  type Cooldowns = Collection<string, Collection<string, number>>;
}

declare type GuildSettings = {
  guildId: string;
  greetingEnabled: boolean;
  audioAliases: Map<string, string>;
  prefix: string;
};

declare type Song = {
  title: string;
  url: string;
  thumbnailUrl: string;
  desc: string;
  channel: string;
  duration: string;
};

declare const enum Args {
  none,
  flexible,
  required,
}
