import _ from 'lodash';
import settings from './settings';

export function twitchGet (endpoint, params, token, headers) {
  headers = _.merge({'Client-ID': settings.twitch.clientID}, headers);
  params = _.merge({}, params);
  const url = new URL(endpoint);
  _.each(params, (val, key) => {
    url.searchParams.append(key, val);
  });

  if (token) headers['Authorisation'] = 'Bearer ' + token;
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
  if (typeof user === 'string') userQuery.login = user;
  else if (user.id) userQuery.id = user.id;
  else if (user.name || user.login) userQuery.login = user.name || user.login;
  else throw new Error('Need user name or user ID');
  return userQuery;
}

async function _getUser (userQuery) {
  if (userQuery.login) {
    const userResult = await twitchGet('https://api.twitch.tv/helix/users?login=' + userQuery, {}, null, {});
    if (userResult.data) {
      return userResult.data[0];
    }
    throw new Error('Couldnt load twitch user ' + JSON.stringify(userQuery) + ': ' + userResult.message);
  } else if (userQuery.id) {
    const userResult = await twitchGet('https://api.twitch.tv/helix/users?id=' + userQuery.id, {}, null, {});
    if (userResult.data) {
      return userResult.data[0];
    }
    throw new Error('Couldnt load twitch user ' + JSON.stringify(userQuery) + ': ' + userResult.message);
  }
}

const memoizedGetUser = _.memoize(_getUser, user => JSON.stringify(user));
export const getUser = user => memoizedGetUser(normalizeUser(user));
