import {
  DMChannel,
  Guild,
  Message,
  NewsChannel,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
  Client,
} from 'discord.js'

import Discord from 'discord.js'
import ytdl from 'ytdl-core'
import ytsr from 'ytsr'

import {
  BOT_NOT_IN_CHANNEL,
  JOIN_CHANNEL_GENERIC,
  JOIN_CHANNEL_PLAY,
  PERMISSIONS_PLAY,
  QUEUE_EMPTY,
  QUEUE_EMPTY_CLEAR,
  QUEUE_EMPTY_SKIP,
  TEST_COMMAND_NOT_VALID,
} from './constants/messages'
import './extensions/string.extensions'

require('dotenv').config()
const prefix = process.env.PREFIX
const token = process.env.TOKEN

const client: Client = new Discord.Client()
client.login(token)

client.once('ready', () => {
  console.log('Ready!')
})

client.once('reconnecting', () => {
  console.log('Reconnecting...')
})

client.once('disconnect', () => {
  console.log('Disconnected.')
})

client.on('message', async (message: Message) => {
  if (message.author.bot) return
  if (!message.content.startsWith(prefix)) return

  const regex = new RegExp(`^[${prefix}](.*?)(?=\\s|$)`)
  const serverQueue: QueueContract = queue.get(message.guild.id)
  if (regex.test(message.content)) {
    const command: string = regex.exec(message.content)[1]

    switch (command) {
      case 'play':
      case 'p':
        execute(message, serverQueue)
        break
      case 'skip':
      case 's':
        skip(message, serverQueue)
        break
      case 'clear':
      case 'c':
        clear(message, serverQueue)
        break
      case 'leave':
      case 'l':
        leave(message, serverQueue)
        break
      case 'queue':
      case 'q':
        showQueue(message, serverQueue)
        break
      case 'horn':
      case 'h':
        soundHorn(message, serverQueue)
        break

      default:
        message.channel.send(TEST_COMMAND_NOT_VALID.toBold())
        break
    }
  }
})

export interface Song {
  title: string
  url: string
}

export interface QueueContract {
  textChannel: TextChannel | DMChannel | NewsChannel
  voiceChannel: VoiceChannel
  connection: VoiceConnection
  songs: Array<Song>
  volume: number
  playing: boolean
}

export const queue: Map<string, QueueContract> = new Map()

export const checkAvailability = (message: Message): string | null => {
  if (!message.guild.voice) return BOT_NOT_IN_CHANNEL
  if (
    !message.member.voice.channel ||
    message.member.voice.channel.id != message.guild.voice.channel.id
  )
    return JOIN_CHANNEL_GENERIC
  return null
}

export const execute = async (message: Message, serverQueue: QueueContract) => {
  const args = message.content.split(' ')

  const voiceChannel = message.member.voice.channel
  if (!voiceChannel) return message.channel.send(JOIN_CHANNEL_PLAY.toBold())
  const permissions = voiceChannel.permissionsFor(message.client.user)
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(PERMISSIONS_PLAY.toBold())
  }

  try {
    let song: Song
    if (args.length < 2) {
      const songInfo: ytdl.videoInfo = await ytdl.getInfo(args[1])
      song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
      }
    } else {
      const searchQuery = args.slice(1).join(' ')
      const filters = await ytsr.getFilters(searchQuery)
      const filter = filters.get('Type').get('Video')
      const songInfo: ytsr.Result = await ytsr(filter.url, {
        limit: 1,
      })
      song = {
        title: (<ytsr.Video>songInfo.items[0]).title,
        url: (<ytsr.Video>songInfo.items[0]).url,
      }
    }

    if (serverQueue) {
      if (serverQueue.textChannel != message.channel)
        serverQueue.textChannel = message.channel
      serverQueue.songs.push(song)
      console.log(serverQueue.songs)
      return message.channel.send(
        `${song.title}`.toBold().toCodeBg() +
          `has been added to the queue!`.toBold()
      )
    }

    const queueContract: QueueContract = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    }

    queue.set(message.guild.id, queueContract)
    queueContract.songs.push(song)

    let connection = await voiceChannel.join()
    queueContract.connection = connection
    play(message.guild, queueContract.songs[0])
  } catch (err) {
    console.log(err)
    queue.delete(message.guild.id)
    return message.channel.send(err.toBold())
  }
}

export const play = (guild: Guild, song: Song) => {
  const serverQueue: QueueContract = queue.get(guild.id)
  if (!song) {
    serverQueue.voiceChannel.leave()
    queue.delete(guild.id)
    return
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift()
      play(guild, serverQueue.songs[0])
    })
    .on('error', (error) => console.error(error))
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
  serverQueue.textChannel.send(
    `Playing:`.toBold() + `${song.title}`.toBold().toCodeBg()
  )
}

export const skip = (message, serverQueue) => {
  const error = checkAvailability(message)
  if (error) return message.channel.send(error.toBold())
  if (!serverQueue) return message.channel.send(QUEUE_EMPTY_SKIP.toBold())
  serverQueue.connection.dispatcher.end()
}

export const clear = (
  message: Message,
  serverQueue: QueueContract
): Promise<Message> => {
  const error = checkAvailability(message)
  if (error) return message.channel.send(error.toBold())
  if (serverQueue.songs.length == 0)
    return message.channel.send(QUEUE_EMPTY_CLEAR.toBold())

  serverQueue.songs = []
  return message.channel.send(QUEUE_EMPTY.toBold())
}

export const leave = (message: Message, serverQueue: QueueContract) => {
  const error = checkAvailability(message)
  if (error) return message.channel.send(error.toBold())

  serverQueue.songs = []
  serverQueue.connection.dispatcher.end()
}

export const showQueue = (
  message: Message,
  serverQueue: QueueContract
): Promise<Message> => {
  const error = checkAvailability(message)
  if (error) return message.channel.send(error.toBold())
  if (serverQueue.songs.length == 0)
    return message.channel.send(QUEUE_EMPTY.toBold())

  let queue = ''
  serverQueue.songs.forEach((song) => (queue += `${song.title}\n`))
  message.channel.send(queue.toCodeBg())
}

export const soundHorn = (message: Message, serverQueue: QueueContract) => {
  const error = checkAvailability(message)
  if (error) return message.channel.send(error.toBold())
  //...
}
