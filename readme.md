# Abbot

**A discord music/soundhorn bot.**

## Commands

| Category | Commands                                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Music    | [disconnect](#disconnect), [join](#join), [pause](#pause), [play](#play), [resume](#resume)                                                   |
| Queue    | [clear](#clear), [queue](#queue), [skip](#skip)                                                                                               |
| Sound    | [deletehorn](#deletehorn), [horn](#horn), [sethorn](#sethorn), [togglethemes](#togglethemes)                                                  |
| Utility  | [args](#args), [clearbotmsg](#clearbotmsg), [clearmessage](#clearmessage), [help](#help), [ping](#ping), [prefix](#prefix), [reload](#reload) |

### Music

---

#### disconnect

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `l`, `quit`, `dc`, `leave`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Disconnects the bot from the voice channel.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### join

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `j`, `cmere`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Make the bot join the voice channel.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### pause

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pause`, `stop`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Pauses the current playing track.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### play

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `p`, `paly`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Play a song/playlist with the given URL or query from youtube (Playlists only work through links). Spotify links are accepted.

    Spotify tracks are searched through Youtube. It may not work perfectly.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`play `[URL/query]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

#### playnow

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pn`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Play a song/playlist with the given URL or query from youtube right away. Pushes existing queue items to the end. (Playlists only work through links). Spotify links are accepted.

    Spotify tracks are searched through Youtube. It may not work perfectly.

&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`play `[URL/query]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

#### resume

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pause`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Resumes the paused track.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### seek

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `goto`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Continues from given time.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`seek `[hh:mm:ss/seconds]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

### Queue

---

#### clear

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `cl`, `c`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clears the queue.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 10 second(s)

#### loop

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `lq`, `loopqueue`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Toggles looping for the queue.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 6 second(s)

#### move

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `mv`, `m`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Moves queue item to a given position.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`move `[old position]` `[new position]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### queue

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `q`, `quit`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Show the song queue.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### shuffle

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `mix`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Shuffles the queue.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 10 second(s)

#### skip

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `s`, `next`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Skip the current song.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

### Sound

---

#### annoy

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `annoy`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Annoy someone whenever they speak.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`annoy `[@user]` `[alias]`\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OR reset `[@user]` *(remove someone's annoy sound)*\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OR toggle *(activate/deactivate)*\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OR reset *(remove your annoy sound)*\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OR (un)block *(change annoy permit for yourself)*\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)\
&nbsp;&nbsp;&nbsp;&nbsp; **Arguments**: `toggle`, `block`, `unblock`, `reset`

#### arbitrary

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `arb`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Bot will play sounds from saved horns at arbitrary moments\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### deletehorn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `dh`, `delhorn`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Delete a saved alias.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`deletehorn `[horn alias]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### horn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `h`, `say`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Play a sound.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`horn `[horn alias]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)\
&nbsp;&nbsp;&nbsp;&nbsp; **Arguments**: `ww` (pre-saved audio)

#### sethorn

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `sh`, `savehorn`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Set an alias for an audio URL. ("https://www.example.com/example.mp3")\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`sethorn `[horn alias]` `[URL]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### theme

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `settheme`, `mytheme`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Set your custom greeting theme from the saved horns.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`theme `[horn alias/Arguments]`\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OR reset *(remove your theme)*\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)\
&nbsp;&nbsp;&nbsp;&nbsp; **Arguments**: `reset`

#### togglethemes

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `togglegreeting`, `tt`, `toggletheme`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Toggles the themes.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

### Utility

---

#### args

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `arg`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Returns the list of saved arguments accepted by the entered command.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`args `[commandName]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 3 second(s)

#### clearbotmsg

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `clbm`, `clrbotmsg`, `clbotmsg`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clear the bot messages. (***message cache is limited to 200***)\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 8 second(s)

#### clearmessage

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `clm`, `clrmsg`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Clear the past `?` messages.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: clearmessage `[messageAmount]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 8 second(s)

#### exporthorns

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `exph`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Export the saved horns.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 15 second(s)

#### help

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `commands`, `hlp`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: List all of my commands or info about a specific command.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `prefix`help `[?commandName?]`\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 1 second(s)

#### importhorns

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `imph`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Import horns from attached yaml file.\
&nbsp;&nbsp;&nbsp;&nbsp; Aliases with the same name will be overwritten.\
&nbsp;&nbsp;&nbsp;&nbsp; Duplicate URLs won't rename alias.\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

Example YAML format: `example.yaml` file,

    example: https://www.example.com/media/sounds/media.mp3
    abc: https://www.example.com/some_sound.ogg
    newsound: https://www.example.com/media.mp3
    myhorn: https://www.example.com/media/sounds/horn.ogg

#### ping

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `pnig`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Ping!\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)

#### prefix

&nbsp;&nbsp;&nbsp;&nbsp; **Aliases**: `px`\
&nbsp;&nbsp;&nbsp;&nbsp; **Description**: Set a new prefix for the server.\
&nbsp;&nbsp;&nbsp;&nbsp; **Usage**: `[prefix]`prefix `[newPrefix]`\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OR reset *(default prefix: ".")*\
&nbsp;&nbsp;&nbsp;&nbsp; **Cooldown**: 5 second(s)
