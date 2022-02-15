import _ from 'lodash';
import settings from './settings';

function normalizeUser (user) {
  const userQuery = {};
  if (typeof user === 'string') userQuery.login = user;
  else if (user.id) userQuery.id = user.id;
  else if (user.name || user.login) userQuery.login = user.name || user.login;
  else throw new Error('Need user name or user ID');
  return userQuery;
}

async function _getUser (userQuery) {
  let url = settings.api.baseurl + 'get_user';
  if (userQuery.login) {
    url = url + '/login/' + userQuery.login;
  } else if (userQuery.id) {
    url = url + '/id/' + userQuery.id;
  }
  return fetch(url, {
    method: 'GET'
  }).then(result => {
    return result.text();
  }).then(text => {
    return JSON.parse(text);
  });
}

const memoizedGetUser = _.memoize(_getUser, user => JSON.stringify(user));
export const getUser = user => memoizedGetUser(normalizeUser(user));
