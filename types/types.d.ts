declare module "discord.js" {
  type GuildData = {
    textChannel: TextChannel | DMChannel | NewsChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Array<Song>;
    volume: number;
    queueActive: boolean;
    greetingEnabled: boolean;
    audioAliases: Map<string, string>;
    prefix: string;
  };

  type Guilds = Map<string, GuildData>;

  type Command = {
    name: string;
    description: string;
    guildOnly: boolean;
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
  author: string;
};

declare const enum Args {
  none,
  flexible,
  required,
}
