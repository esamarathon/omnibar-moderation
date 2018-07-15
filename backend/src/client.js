import logger from './logger';
import { decodeToken } from './auth';
import { checkModStatus } from './twitchAPI';

export default class Client {
  constructor(server, connection) {
    this.server = server;
    this.connection = connection;
    this.user = null;
  }

  async handleMessage(message) {
    if (message.command === 'auth') {
      return this.authenticate(message);
    }
    const modStatus = await this.isMod();
    if (modStatus) {
      if (message.command === 'moderate') {
        return this.moderate(message.id, message.decision);
      }
      logger.error(`Unknown command ${message.command}`, message);

      return null;
    }

    return null;
  }

  async isMod() {
    return this.user && checkModStatus(this.user);
  }

  async moderate(id, action) {
    return this.server.moderate(id, this.user, action);
  }

  async authenticate(message) {
    if (message.token) {
      const payload = decodeToken(message.token);
      if (payload.user) {
        // validate the login
        try {
          logger.debug('Starting mod check');
          this.user = payload.user;
          const modStatus = await this.isMod();
          if (modStatus) {
            // send the client the current state
            this.connection.send(JSON.stringify({ command: 'status', status: modStatus }));
            this.connection.send(JSON.stringify({ command: 'state', data: this.server.state.state }));
          } else {
            this.connection.send(JSON.stringify({ command: 'status', error: 'Not a moderator.' }));
            logger.warn('Non-mod connection attempt!', payload.user);
          }
        } catch (err) {
          logger.error(err);
        }
      }
    }
  }
}
