import fs from 'fs';
import _ from 'lodash';
import State from '../../shared/src/state';


import logger from './logger';
import settings from './settings';
import Client from './client';
import IRCBot from './ircbot';
import { app, server } from './api';

const persistentPath = settings.persistentState;
function persistState(data) {
  fs.writeFile(persistentPath, JSON.stringify(data), 'utf-8', err => {
    if (err) logger.error(err);
  });
}
const persistStateThrottled = _.throttle(persistState, 1000);

export default class Server {
  constructor() {
    this.clients = [];
    this.ircbot = new IRCBot();
    this.runServer();
    this.ircbot.on('event', event => {
      event.duration = 3600000; // 86400000;
      event.expires = Date.now() + event.duration;
      this.apply({
        type: 'push',
        target: 'moderationQueue',
        data: event
      });
    });

    this.state = new State();

    if (persistentPath) {
      try {
        const data = fs.readFileSync(persistentPath, 'utf-8');
        this.state.state = JSON.parse(data);
      } catch (err) {
        logger.warn('Couldnt load persistent state from ', persistentPath);
      }
    }
  }

  runServer() {
    app.ws('/ws', connection => {
      const client = new Client(this, connection);
      logger.debug('Client connecting', connection);
      this.clients.push(client);
      connection.on('message', message => {
        logger.debug('Client message received:', message);
        try {
          const data = JSON.parse(message);
          if (data) {
            if (data.command) {
              client.handleMessage(data).catch(err => {
                logger.error('Unhandled error in handleMessage:', err);
              });
            } else {
              logger.error('Invalid command:', data);
            }
          } else {
            logger.error('Invalid WS message:', message);
          }
        } catch (err) {
          logger.error(err);
        }
      });
      connection.on('close', () => {
        _.pull(this.clients, client);
      });
    });
  }

  moderate(id, user, action) {
    this.apply({
      type: 'set',
      target: ['moderationQueue', { id }, 'decisions', user],
      data: action
    });
  }

  // Applies a modification
  apply(mutation) {
    this.state.apply(mutation);
    // logger.debug('New state', this.state.state);
    persistStateThrottled(this.state.state);
    this.broadcast(mutation);
  }

  broadcast(mutation) {
    const data = JSON.stringify({ command: 'mutation', mutation });
    _.each(this.clients, client => {
      client.isMod().then(isMod => { if (isMod) client.connection.send(data); });
    });
  }
}
