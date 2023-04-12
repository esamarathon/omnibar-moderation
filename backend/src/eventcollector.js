import { EventEmitter } from 'events';
import _ from 'lodash';
import { generateID } from '../../shared/src/helpers';
import IRCBot from './ircbot';
import logger from './logger';
import settings from './settings';
import { twitchGet } from './twitchAPI';

async function getTwitchProfilePic(userID) {
  try {
    return (await twitchGet('https://api.twitch.tv/helix/users', {}, null, { id: userID })).body.data[0].profile_image_url;
  } catch (err) {
    console.error(err);
    logger.error(err);
    return null;
  }
}

export default class EventCollector extends EventEmitter {
  constructor() {
    super();

    // twitch bot
    this.bot = new IRCBot(settings.twitch.channels);

    this.bot.on('PRIVMSG', message => {
      if (message.tags.bits) {
        logger.debug('Cheer received!', message);
        this.handleCheer(message);
      } else if (_.find(settings.admins, { id: message.tags['user-id'] })) {
        if (message.trailing.startsWith('!omnibar ')) {
          logger.debug('Test message received', message);
          this.handleTest(message);
        }
      } else if (['120560983', '56714091'].includes(message.tags['user-id'])) {
        this.handleCrowdcontrol(message);
      }
    });

    this.bot.on('JOIN', message => {
      logger.debug(`Joined channel ${message.channel}`);
    });

    this.bot.on('USERNOTICE', message => {
      logger.debug('Sub received!', message);
      if (settings.twitch[message.tags['msg-id']]) this.handleUsernotice(message);
    });
  }

  async handleCheer(event) {
    if (settings.twitch.bits && parseInt(event.tags.bits, 10) >= settings.twitch.bits) {
      this.emit('event', {
        id: generateID(),
        provider: 'twitch',
        type: 'cheer',
        message: event,
        user: {
          name: event.prefix.nick,
          displayName: event.tags['display-name'],
          id: event.tags['user-id'],
          profilePic: await getTwitchProfilePic(event.tags['user-id'])
        },
        channel: {
          id: `${event.room_id}`,
          name: event.channel.replace('#', '')
        },
        decisions: [],
        error: null,
        sent: false
      });
    }
  }

  async handleTest(event) {
    this.emit('event', {
      id: generateID(),
      provider: 'twitch',
      type: 'test',
      message: event,
      user: {
        name: event.prefix.nick,
        displayName: event.tags['display-name'],
        id: event.tags['user-id'],
        profilePic: await getTwitchProfilePic(event.tags['user-id'])
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: [],
      error: null,
      sent: false
    });
  }

  async handleCrowdcontrol(event) {
    console.log('Handling crowd control');
    this.emit('event', {
      id: generateID(),
      provider: 'crowdcontrol',
      type: 'crowdcontrol',
      message: event,
      user: {
        name: event.prefix.nick,
        displayName: event.tags['display-name'],
        id: event.tags['user-id'],
        profilePic: await getTwitchProfilePic(event.tags['user-id'])
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: [],
      error: null,
      sent: false
    });
  }

  async handleUsernotice(event) {
    this.emit('event', {
      id: generateID(),
      provider: 'twitch',
      type: event.tags['msg-id'],
      message: event,
      user: {
        name: event.tags.login,
        displayName: event.tags['display-name'],
        id: event.tags['user-id'],
        profilePic: await getTwitchProfilePic(event.tags['user-id'])
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: [],
      error: null,
      sent: false
    });
  }
}
