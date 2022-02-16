import got from 'got';
import _ from 'lodash';
import { throttleAsync } from '../../shared/src/helpers';
import logger from './logger';
import settings from './settings';


var cachedAppToken = null;
export async function twitchAppToken() {
  if (cachedAppToken && cachedAppToken['expires'].getTime() < Date.now())
    return cachedAppToken['access_token'];

  const tokenResponse = await got.post('https://id.twitch.tv/oauth2/token', {
    form: true,
    body: {
      client_id: settings.twitch.clientID,
      client_secret: settings.twitch.clientSecret,
      grant_type: 'client_credentials'
    },
    json: true
  });
  cachedAppToken = tokenResponse.body;

  let expdate = new Date();
  expdate.setSeconds(expdate.getSeconds() + parseInt(cachedAppToken['expires_in'], 10) - 10);
  cachedAppToken['expires'] = expdate;

  return cachedAppToken['access_token'];
}

export async function twitchGet(url, headers, token, query) {
  if (!headers) headers = {};
  if (!headers['client-id']) headers['client-id'] = settings.twitch.clientID;
  if (!token) token = await twitchAppToken();
  headers.Authorization = `Bearer ${token}`;
  logger.debug(`Getting ${url}`);
  return got.get(url, { headers, query, json: true });
}

export async function twitchPost(url, headers, token, body) {
  if (!headers) headers = {};
  if (!headers['client-id']) headers['client-id'] = settings.twitch.clientID;
  if (!token) token = await twitchAppToken();
  headers.Authorization = `Bearer ${token}`;
  logger.debug(`Posting to ${url}`);
  return got.post(url, { headers, body, json: true });
}

const userIDByName = {};
export async function twitchGetIDByName(userName) {
  if (userIDByName[userName]) return userIDByName[userName];
  const userResponse = await twitchGet('https://api.twitch.tv/helix/users', {}, null, { login: userName });
  userIDByName[userName] = userResponse.body.data[0].id;
  return userIDByName[userName];
}

export async function twitchGQL(query, variables) {
  return twitchPost('https://gql.twitch.tv/gql', { 'client-id': 'kimne78kx3ncx6brgo4mv6wki5h1ko' }, null, { query, variables, extensions: {} });
}

async function getModList() {
  logger.debug('Querying for mod list');
  const query = `query mod_check($userId: ID, $count: Int){
    user(id: $userId) {
     mods(first: $count) {
      edges{
       cursor
       node{
        displayName
        id
        login
       }
      }
      pageInfo{
       hasNextPage
      }
     }
    }
   }`;
  const variables = { userId: settings.twitch.channels[0].id, count: 100 };
  const result = await twitchGQL(query, variables);
  return _.map(result.body.data.user.mods.edges, edge => edge.node);
}

const getModListThrottled = throttleAsync(getModList, 60000);

export async function checkModStatus(user) {
  const adminStatus = _.find(settings.admins, { id: user.id }) || _.find(settings.twitch.channels, { id: user.id });
  if (adminStatus) {
    return _.merge({ admin: true }, adminStatus);
  }
  logger.debug('Getting mod status for ', user);
  const modList = await getModListThrottled(true);
  return _.find(modList, { id: user.id });
}
