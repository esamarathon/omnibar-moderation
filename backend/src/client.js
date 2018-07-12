import logger from './logger';
import { decodeToken } from './auth';
import { twitchGet, checkModStatus } from './twitchAPI';

export default class Client {
  constructor(server, connection) {
    this.server = server;
    this.connection = connection;
    this.user = null;
    this.auth = null;
  }

  async handleMessage(message) {
    if (message.command === 'auth') {
      return this.authenticate(message);
    }
    console.log('Checking mod status');
    const modStatus = await this.isMod();
    console.log('Mod status: ', modStatus);
    if (modStatus) {
      if (message.command === 'approve' || message.command === 'deny') {
        return this.moderate(message.id, message.command);
      }
      logger.error(`Unknown command ${message.command}`, message);

      return null;
    }

    return null;
  }

  async isMod() {
    return this.user && checkModStatus(this.user);
  }

  async moderate(action, id) {
    this.server.moderate(id, this.user, action);
  }

  async authenticate(message) {
    if (message.token) {
      const payload = decodeToken(message.token);
      if (payload.auth) {
        // validate the login
        try {
          const authenticationResponse = await twitchGet('https://id.twitch.tv/oauth2/validate', null, payload.auth.token);
          logger.debug('Validation result:', authenticationResponse.body);
          if (authenticationResponse.body.user_id) {
            this.user = {
              name: authenticationResponse.body.login,
              id: authenticationResponse.body.user_id
            };
            this.auth = payload.auth;
            // check mod status
            logger.debug('Starting mod check');
            const modStatus = await this.isMod();
            if (modStatus) {
              // send the client the current state
              this.connection.send(JSON.stringify({ command: 'state', data: this.server.state.state }));
            } else {
              logger.warn('Non-mod connection attempt!', this.user);
            }
          } else {
            logger.error('Invalid authentication!');
          }
          this.user = payload.user;
        } catch (err) {
          logger.error(err);
        }
      }
    }
  }
}
