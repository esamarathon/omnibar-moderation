import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressWs from 'express-ws';
import got from 'got';
import http from 'http';
import url from 'url';
import { generateToken } from './auth';
import logger from './logger';
import settings from './settings';
import { twitchGet } from './twitchAPI';

const app = express();
const server = http.Server(app);

expressWs(app, server);

app.use(bodyParser.json());
app.use(cookieParser());


app.get('/login', async (req, res, next) => {
  try {
    logger.debug('Logging in...');
    const tokenResponse = await got.post('https://id.twitch.tv/oauth2/token', {
      form: true,
      body: {
        client_id: settings.twitch.clientID,
        client_secret: settings.twitch.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${settings.api.baseurl}login`,
        code: req.query.code,
        state: req.query.state
      },
      json: true
    });
    const token = tokenResponse.body.access_token;
    const userResponse = await twitchGet('https://api.twitch.tv/helix/users', null, token);
    const userData = userResponse.body.data[0];
    const jwt = generateToken(token, { id: userData.id, login: userData.login, displayName: userData.display_name });

    res.cookie('om-jwt', jwt);
    res.redirect(settings.frontend.baseurl);
  } catch (err) { logger.error(err); next(err); }
});

// logout api
app.get('/logout', (req, res) => {
  if (req.token && req.cookies && req.cookies.token && req.token === req.cookies.token) {
    const frontendUrl = url.parse(settings.frontend.baseurl);
    const allowedOrigin = `${frontendUrl.protocol}//${frontendUrl.host}`;
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', true);
    res.clearCookie('om-jwt');
  } else {
    res.status(400).jsonp({ error: 'Missing, mismatching or invalid token' });
  }
});

server.listen(settings.api.port);
export { server, app };
