import _ from 'lodash';
import settings from './settings';

export function twitchGet (endpoint, params, token, headers, version) {
  headers = _.merge({'Client-ID': settings.twitch.clientID}, headers);
  if (version === 'v5') headers['Accept'] = 'application/vnd.twitchtv.v5+json';
  params = _.merge({}, params);
  const url = new URL(endpoint);
  _.each(params, (val, key) => {
    url.searchParams.append(key, val);
  });

  if (token) headers['Authorisation'] = (endpoint.includes('helix') ? 'Bearer ' : 'OAuth ') + token;
  return fetch(url, {
    method: 'GET',
    headers
  }).then(result => {
    return result.text();
  }).then(text => {
    return JSON.parse(text);
  });
}

function normalizeUser (user) {
  const userQuery = {};
  if (typeof user === 'string') userQuery.name = user;
  else if (user.id) userQuery.id = user.id;
  else if (user.name || user.login) userQuery.login = user.name || user.login;
  else throw new Error('Need user name or user ID');
  return userQuery;
}

async function _getUser (userQuery) {
  if (userQuery.login) {
    const userResult = await twitchGet('https://api.twitch.tv/kraken/users/', userQuery);
    if (userResult.users) {
      return userResult.users[0];
    }
    throw new Error('Couldnt load twitch user ' + JSON.stringify(userQuery) + ': ' + userResult.message);
  } else if (userQuery.id) {
    const userResult = await twitchGet('https://api.twitch.tv/kraken/users/' + userQuery.id, {}, null, {}, 'v5');
    if (userResult) {
      return userResult;
    }
    throw new Error('Couldnt load twitch user ' + JSON.stringify(userQuery) + ': ' + userResult.message);
  }
}

const memoizedGetUser = _.memoize(_getUser, user => JSON.stringify(user));
export const getUser = user => memoizedGetUser(normalizeUser(user));
