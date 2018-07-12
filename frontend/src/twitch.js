import _ from 'lodash';
import settings from './settings';

export function twitchGet (endpoint, params, token, headers) {
  headers = _.merge({'Client-ID': settings.twitch.clientID}, headers);
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

export async function getUser (user) {
  const userQuery = {};
  if (typeof user === 'string') userQuery.name = user;
  else if (user.id) userQuery.id = user.id;
  else if (user.name || user.login) userQuery.login = user.name || user.login;
  else throw new Error('Need user name or user ID');
  const userResult = await twitchGet('https://api.twitch.tv/helix/users', userQuery);
  if (userResult.data) {
    return userResult.data[0];
  }
  throw new Error('Couldnt load twitch user ' + JSON.stringify(user) + ': ' + userResult.message);
}
