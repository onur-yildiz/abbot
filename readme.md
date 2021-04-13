# Abbot

**A discord music/soundhorn bot with special snyder cut wonder woman themed greeting.** 🙂

## Commands

| Category | Commands                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Music    | [disconnect](#disconnect), [join](#join), [pause](#pause), [play](#play), [resume](#resume)                                                   |
| Queue    | [clear](#clear), [queue](#queue), [skip](#skip)                                                                                               |
| Sound    | [deletehorn](#deletehorn), [horn](#horn), [sethorn](#sethorn), [togglegreeting](#togglegreeting)                                              |
| Utility  | [args](#args), [clearbotmsg](#clearbotmsg), [clearmessage](#clearmessage), [help](#help), [ping](#ping), [prefix](#prefix), [reload](#reload) |

### Music

---

#### disconnect

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `l`, `quit`, `dc`, `leave`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Disconnects the bot from the voice channel.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### join

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `j`, `cmere`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Make the bot join the voice channel.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### pause

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pause`, `stop`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Pauses the current playing track.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### play

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `p`, `paly`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Play a song with the given url or query from youtube.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`play `URL/query`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

#### resume

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pause`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Resumes the paused track.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

### Queue

---

#### clear

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `cl`, `c`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clears the queue.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### queue

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `q`, `quit`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Show the song queue.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### skip

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `s`, `next`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Skip the current song.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

### Sound

---

#### deletehorn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `dh`, `delhorn`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Delete a saved alias.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`deletehorn `hornAlias`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### horn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `h`, `say`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Play a sound.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`horn `audioName`

&nbsp;&nbsp;&nbsp;&nbsp; **Arguments**: `ww`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### sethorn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `sh`, `savehorn`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Set an alias for an audio url. ( "https://www.example.com/example.mp3" )

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`sethorn `hornAlias` `url`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### togglegreeting

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `greeting`, `tg`, `togglegreet`, `greet`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clears the queue.

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

### Utility

---

#### args

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `arg`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Returns the list of saved arguments accepted by the entered command.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`args `commandName`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### clearmessage

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `clm`, `clrmsg`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clear the past `?` messages.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: clearmessage `messageAmount`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 8 second(s)

#### clearbotmsg

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `clbm`, `clrbotmsg`, `clbotmsg`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clear the bot messages. (**\*message cache is limited to **200\*\*\*)

&nbsp;&nbsp;&nbsp;&nbsp; \*\*Cooldown\*\*: 8 second(s)

#### help

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `commands`, `hlp`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: List all of my commands or info about a specific command.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`help `?commandName?`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

#### ping

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pnig`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Ping!

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### prefix

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `px`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Set a new prefix for the server.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`prefix /`newPrefix`/ OR "reset"

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### reload

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `rl`

&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Reloads and updates the command if it was changed by my developers.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`reload `command`

&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)
