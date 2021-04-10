declare module "discord.js" {
  type QueueContract = {
    textChannel: TextChannel | DMChannel | NewsChannel;
    voiceChannel: VoiceChannel;
    connection: VoiceConnection;
    songs: Array<Song>;
    volume: number;
    playing: boolean;
    enableGreeting: boolean;
  };

  type GuildContract = Map<string, QueueContract>;

  type Command = {
    name: string;
    description: string;
    guildOnly: boolean;
    aliases: Array<string>;
    usage: string;
    permissions?: PermissionResolvable;
    cooldown?: number;
    args?: boolean;
    execute: Function;
  };

  type Cooldowns = Collection<string, Collection<string, number>>;
}

declare type Song = {
  title: string;
  url: string;
  thumbnailUrl: string;
  desc: string;
  author: string;
};
