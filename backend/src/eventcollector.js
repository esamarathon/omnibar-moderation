import _ from 'lodash';
import { EventEmitter } from 'events';

import settings from './settings';
import { generateID } from '../../shared/src/helpers';
import IRCBot from './ircbot';
import logger from './logger';

export default class EventCollector extends EventEmitter {
  constructor() {
    super();

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
      }
    });

    this.bot.on('JOIN', message => {
      logger.debug(`Joined channel ${message.channel}`);
    });

    this.bot.on('USERNOTICE', message => {
      logger.debug('Sub received!', message);
      if (settings.moderation[message.tags['msg-id']]) this.handleUsernotice(message);
    });
  }

  handleCheer(event) {
    if (settings.moderation.bits && parseInt(event.tags.bits, 10) >= settings.moderation.bits) {
      this.emit('event', {
        id: generateID(),
        type: 'cheer',
        message: event,
        user: {
          name: event.prefix.nick,
          displayName: event.tags['display-name'],
          id: event.tags['user-id']
        },
        channel: {
          id: `${event.room_id}`,
          name: event.channel.replace('#', '')
        },
        decisions: []
      });
    }
  }

  handleTest(event) {
    this.emit('event', {
      id: generateID(),
      type: 'test',
      message: event,
      user: {
        name: event.prefix.nick,
        displayName: event.tags['display-name'],
        id: event.tags['user-id']
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: []
    });
  }

  handleUsernotice(event) {
    this.emit('event', {
      id: generateID(),
      type: event.tags['msg-id'],
      message: event,
      user: {
        name: event.tags.login,
        displayName: event.tags['display-name'],
        id: event.tags['user-id']
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: []
    });
  }
}
