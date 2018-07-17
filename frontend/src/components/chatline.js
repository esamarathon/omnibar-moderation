import _ from 'lodash';

import emoteToken from './tokens/Emote';
import urlToken from './tokens/Url';
import stringToken from './tokens/String';
import systemToken from './tokens/System';

function getEmotes (msg, emoteTags) {
  if (!emoteTags || emoteTags === true) return [];
  const emotes = [];
  _.each(emoteTags.split('/'), emoteInfo => {
    const [emoteID, emotePositions] = emoteInfo.split(':');
    _.each(emotePositions.split(','), emotePosition => {
      let [start, end] = emotePosition.split('-');
      start = parseInt(start, 10);
      end = parseInt(end, 10);
      emotes.push({
        start,
        end,
        id: emoteID,
        name: msg.slice(start, end + 1).join(''),
        url: 'https://static-cdn.jtvnw.net/emoticons/v1/' + emoteID + '/1.0'
      });
    });
  });
  return emotes;
}

const urlRegex = /(?:https?:\/\/(?:www\.|(?!www))([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|www\.([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})|https?:\/\/(?:www\.|(?!www))([a-zA-Z0-9]\.[^\s]{2,})|www\.([a-zA-Z0-9]\.[^\s]{2,}))/gi;

function classifyWord (word) {
  const urlMatch = urlRegex.exec(word);
  if (urlMatch) {
    return {
      type: 'url',
      data: {
        url: urlMatch[0]
      }
    };
  }
  return {
    type: 'string',
    data: word
  };
}

function setToken (msg, start, end, token) {
  msg[start] = token;
  for (let index = start + 1; index <= end; ++index) {
    msg[index] = null;
  }
}

function parseChatLine (message) {
  let msg = [];
  if (message.trailing) {
    msg = Array.from(message.trailing);
    // replace emotes
    _.each(getEmotes(msg, message.tags.emotes), emote => {
      setToken(msg, emote.start, emote.end, {
        type: 'emote',
        data: emote
      });
    });
    // split into words
    let currentWordStart = 0;
    let currentWord = '';
    for (let i = 0; i < msg.length; ++i) {
      if (msg[i] === ' ' || typeof msg[i] !== 'string') {
        if (currentWord) {
          setToken(msg, currentWordStart, i, classifyWord(currentWord));
          currentWord = '';
        }
        if (msg[i] === ' ') msg[i] = null;
        currentWordStart = i + 1;
      } else {
        currentWord += msg[i];
      }
    }
    setToken(msg, currentWordStart, msg.length, classifyWord(currentWord));

    let lastToken = null;
    for (let i = 0; i < msg.length; ++i) {
      if (msg[i]) {
        if (
          msg[i].type === 'string' &&
          lastToken &&
          lastToken.type === 'string'
        ) {
          lastToken.data += ' ' + msg[i].data;
          msg[i] = null;
        } else {
          lastToken = msg[i];
        }
      }
    }
  }

  if (message.tags['system-msg']) {
    msg.unshift({
      type: 'system',
      data: message.tags['system-msg'].replace(/\\s/g, ' ')
    });
  }
  msg = _.filter(msg);
  console.log(msg);

  return msg;
}
export default {
  name: 'ChatLine',
  props: ['line'],
  components: {
    emote: emoteToken,
    url: urlToken,
    string: stringToken,
    system: systemToken
  },
  computed: {
    tokens () {
      return parseChatLine(this.line);
    }
  }
};
