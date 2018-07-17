import fs from 'fs';
import _ from 'lodash';
import got from 'got';


import logger from './logger';
import settings from './settings';
import Client from './client';
import { app } from './api';
import State from '../../shared/src/state';
import EventCollector from './eventcollector';
import { getAt } from '../../shared/src/helpers';

const persistentPath = settings.persistentState;
function persistState(data) {
  fs.writeFile(persistentPath, JSON.stringify(data), 'utf-8', err => {
    if (err) logger.error(err);
  });
}
const persistStateThrottled = _.throttle(persistState, 1000);

const voteWeights = {
  approve: 1,
  deny: -1,
  veto: -1000,
  force: 1000
};

export default class Server {
  constructor() {
    this.clients = [];
    this.eventCollector = new EventCollector();
    this.runServer();
    this.eventCollector.on('event', event => {
      event.duration = settings.moderation.expirationTime;
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

    setInterval(() => {
      this.cleanse();
    }, 1000);
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
    logger.info(`Moderating item ${id} with user `, user, action);
    if (_.isEmpty(getAt(this.state.state, ['moderationQueue', { id }, 'decisions']))) {
      this.apply({
        type: 'set',
        target: ['moderationQueue', { id }, 'duration'],
        data: settings.moderation.gracePeriod
      });
      this.apply({
        type: 'set',
        target: ['moderationQueue', { id }, 'expires'],
        data: Date.now() + settings.moderation.gracePeriod
      });
    }
    this.apply({
      type: 'insert',
      target: ['moderationQueue', { id }, 'decisions'],
      selector: [{ user: { id: user.id } }],
      defaults: { user },
      data: { action }
    });
  }

  // removes expired events, triggers accepted events.
  cleanse() {
    _.each(this.state.state.moderationQueue, async queueItem => {
      const expirationTime = queueItem.sent ? queueItem.sent + settings.repeater.retry : queueItem.expires;
      if (Date.now() > expirationTime) {
        let remove = true;
        const votes = _.reduce(queueItem.decisions, (res, decision) => {
          res += voteWeights[decision.action];
          return res;
        }, 0);
        logger.info('Votes:', votes);
        if (votes > 0) {
          logger.info('Accepting event', queueItem);
          if (settings.repeater.endpoint) {
            try {
              this.apply({
                type: 'set',
                target: ['moderationQueue', { id: queueItem.id }, 'sent'],
                data: Date.now()
              });
              await got.post(settings.repeater.endpoint, { body: _.pick(queueItem, ['id', 'type', 'message', 'user', 'channel']), json: true });
              logger.debug('Event successfully pushed');
            } catch (err) {
              remove = false;
              logger.error('Event could not be pushed', err);
              const errorCode = err.code;
              if (errorCode !== queueItem.error) {
                this.apply({
                  type: 'set',
                  target: ['moderationQueue', { id: queueItem.id }, 'error'],
                  data: err.code
                });
              }
            }
          }
        } else {
          logger.info('Denying event', queueItem);
        }
        if (remove) {
          setTimeout(
            () => {
              this.apply({
                type: 'delete',
                target: ['moderationQueue', { id: queueItem.id }]
              });
            }, 1
          );
        }
      }
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
