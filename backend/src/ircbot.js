import _ from 'lodash';
import TwitchBot from 'twitch-bot';
import { EventEmitter } from 'events';

import settings from './settings';
import logger from './logger';
import { generateID } from '../../shared/src/helpers';

export default class IRCBot extends EventEmitter {
  constructor() {
    super();
    this.client = new TwitchBot({
      username: 'justinfan123',
      oauth: 'kappa123',
      channels: _.map(settings.twitch.channels, channel => `#${channel.name}`)
    });

    this.client.on('connected', () => {
      logger.info('Bot connected');
    });
    this.client.on('disconnected', () => {
      logger.info('Bot disconnected');
    });
    this.client.on('join', channel => {
      logger.info('Joined channel', channel);
    });

    this.client.on('message', chatter => {
      if (chatter.bits) {
        logger.debug('Cheer received!', chatter);
        this.handleCheer(chatter);
      } else if (_.find(settings.admins, { id: `${chatter.user_id}` })) {
        if (chatter.message.startsWith('!omnibar ')) {
          logger.debug('Test message received', chatter);
          this.handleTest(chatter);
        }
      }
    });

    this.client.on('subscription', event => {
      logger.debug('Subscription received!', event);
      this.handleSub(event);
    });
  }

  /*
  {
    "username": "xxjamnas",
    "badges": {
      "bits": 1000
    },
    "bits": 100,
    "color": null,
    "display_name": "xxjamnas",
    "emotes": null,
    "id": "66c8612d-04c1-4ed6-be49-8cc37d1b1cf1",
    "mod": false,
    "room_id": 60056333,
    "subscriber": false,
    "tmi_sent_ts": 1531186571996,
    "turbo": false,
    "user_id": 213782044,
    "user_type": null,
    "channel": "#tfue",
    "message": "cheer100"
  }
  */
  handleCheer(event) {
    this.emit('event', {
      id: generateID(),
      type: 'cheer',
      message: event,
      user: {
        name: event.username,
        displayName: event.display_name,
        id: `${event.user_id}`
      },
      channel: {
        id: `${event.room_id}`,
        name: event.channel.replace('#', '')
      },
      decisions: []
    });
  }

  /*
  {
    "username": "cbenni",
    "badges": {
      "premium": "1"
    },
    "color": null,
    "display_name": "CBenni",
    "emotes": null,
    "id": "66c8612d-04c1-4ed6-be49-8cc37d1b1cf1",
    "mod": true,
    "room_id": 60056333,
    "subscriber": false,
    "tmi_sent_ts": 1531186571996,
    "turbo": true,
    "user_id": 21018440,
    "user_type": null,
    "channel": "#cbenni",
    "message": "!omnibar Testing 123"
  }
  */
  handleTest(event) {
    this.emit('event', {
      id: generateID(),
      type: 'test',
      message: event,
      user: {
        name: event.username,
        displayName: event.display_name,
        id: `${event.user_id}`
      },
      channel: {
        id: `${event.room_id}`,
        name: event.channel.replace('#', '')
      },
      decisions: []
    });
  }

  /*
  {
    "channel": "#tfue",
    "message": null,
    "badges": {
      "turbo": 1
    },
    "color": "#00C9CC",
    "display_name": "robat8",
    "emotes": null,
    "id": "4e5df78d-14c4-45d2-ac0d-31bb47e38173",
    "login": "robat8",
    "mod": 0,
    "msg_id": "sub",
    "msg_param_months": 0,
    "msg_param_sub_plan_name": "Channel Subscription (Tfue)",
    "msg_param_sub_plan": 1000,
    "room_id": 60056333,
    "subscriber": 0,
    "system_msg": "robat8 just subscribed with a Tier 1 sub!",
    "tmi_sent_ts": 1531186290041,
    "turbo": 1,
    "user_id": 37034306,
    "user_type": null
  }
  */
  handleSub(event) {
    this.emit('event', {
      id: generateID(),
      type: 'sub',
      message: event,
      user: {
        name: event.login,
        displayName: event.display_name,
        id: `${event.user_id}`
      },
      channel: {
        id: `${event.room_id}`,
        name: event.channel.replace('#', '')
      },
      decisions: []
    });
  }
}
