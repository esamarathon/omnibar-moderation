import _ from 'lodash';
import { EventEmitter } from 'events';
import Twitter from 'twitter';
import got from 'got';
import util from 'util';
import fs from 'fs';

import settings from './settings';
import { generateID } from '../../shared/src/helpers';
import IRCBot from './ircbot';
import logger from './logger';
import { twitchGet } from './twitchAPI';

async function getBearerToken() {
  return JSON.parse((await got.post('https://api.twitter.com/oauth2/token', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${settings.twitter.consumerKey}:${settings.twitter.consumerSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    query: { grant_type: 'client_credentials' }
  })).body).access_token;
}

async function getTwitchProfilePic(userID) {
  try {
    return (await twitchGet(`https://api.twitch.tv/kraken/users/${userID}`)).body.logo;
  } catch (err) {
    console.error(err);
    logger.error(err);
    return null;
  }
}

export default class EventCollector extends EventEmitter {
  constructor() {
    super();

    // twitch bot
    this.bot = new IRCBot(settings.twitch.channels);

    this.bot.on('PRIVMSG', message => {
      if (message.tags.bits) {
        logger.debug('Cheer received!', message);
        this.handleCheer(message);
      } else if (_.find(settings.admins, { id: message.tags['user-id'] })) {
        if (message.trailing.startsWith('!omnibar ')) {
          logger.debug('Test message received', message);
          this.handleTest(message);
        }
      }
    });

    this.bot.on('JOIN', message => {
      logger.debug(`Joined channel ${message.channel}`);
    });

    this.bot.on('USERNOTICE', message => {
      logger.debug('Sub received!', message);
      if (settings.twitch[message.tags['msg-id']]) this.handleUsernotice(message);
    });

    this.twitter = null;
    // prevents posts from being emit more than once.
    this.twitterState = {
      emittedTweets: {}
    };
    this.createTwitterApp();
  }

  async createTwitterApp() {
    if (!settings.twitter.consumerSecret || !settings.twitter.consumerKey) {
      logger.warn('No twitter configuration supplied, twitter features will be unavailable.');
      return;
    }
    try {
      // get bearer token
      const persistentPosts = util.promisify(fs.readFile)(`${settings.dataFolder}twitter.json`).then(data => {
        this.twitterState = JSON.parse(data);
      }).catch(err => {
        logger.warn('Couldnt load persistent twitter state:', err);
      });

      const bearerToken = settings.twitter.bearerToken || await getBearerToken();

      logger.debug('Twitter access info: ', {
        consumer_key: settings.twitter.consumerKey,
        consumer_secret: settings.twitter.consumerSecret,
        bearer_token: bearerToken
      });

      this.twitter = new Twitter({
        consumer_key: settings.twitter.consumerKey,
        consumer_secret: settings.twitter.consumerSecret,
        bearer_token: bearerToken
      });

      // this should be done by now, but wait for it regardless.
      await persistentPosts;

      this.pollTwitter();
      setInterval(() => {
        this.pollTwitter();
      }, settings.twitter.pollRate);
    } catch (err) {
      console.error(err);
      logger.error(err);
    }
  }

  async handleCheer(event) {
    if (settings.twitch.bits && parseInt(event.tags.bits, 10) >= settings.twitch.bits) {
      this.emit('event', {
        id: generateID(),
        provider: 'twitch',
        type: 'cheer',
        message: event,
        user: {
          name: event.prefix.nick,
          displayName: event.tags['display-name'],
          id: event.tags['user-id'],
          profilePic: await getTwitchProfilePic(event.tags['user-id'])
        },
        channel: {
          id: `${event.room_id}`,
          name: event.channel.replace('#', '')
        },
        decisions: [],
        error: null,
        sent: false
      });
    }
  }

  async handleTest(event) {
    this.emit('event', {
      id: generateID(),
      provider: 'twitch',
      type: 'test',
      message: event,
      user: {
        name: event.prefix.nick,
        displayName: event.tags['display-name'],
        id: event.tags['user-id'],
        profilePic: await getTwitchProfilePic(event.tags['user-id'])
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: [],
      error: null,
      sent: false
    });
  }

  async handleUsernotice(event) {
    this.emit('event', {
      id: generateID(),
      provider: 'twitch',
      type: event.tags['msg-id'],
      message: event,
      user: {
        name: event.tags.login,
        displayName: event.tags['display-name'],
        id: event.tags['user-id'],
        profilePic: await getTwitchProfilePic(event.tags['user-id'])
      },
      channel: {
        id: `${event.tags['room-id']}`,
        name: event.channel.replace('#', '')
      },
      decisions: [],
      error: null,
      sent: false
    });
  }

  async pollTwitter() {
    try {
      const searchResult = await this.twitter.get('search/tweets', {
        q: settings.twitter.hashtag, count: 100, result_type: 'recent', tweet_mode: 'extended'
      });

      let tweets = _.filter(searchResult.statuses, tweet => !settings.twitter.blocked.includes(tweet.user.name.toLowerCase()) && !tweet.retweeted_status);
      tweets = _.sortBy(tweets, [tweet => (-tweet.favorite_count - tweet.retweet_count)]).slice(0, settings.twitter.tweets);
      logger.debug('Sorted tweets:', tweets.map(tweet => _.pick(tweet, ['text', 'user.name', 'favorite_count', 'retweet_count'])));
      tweets = _.filter(tweets, status => !this.twitterState.emittedTweets[status.id_str]);
      logger.debug('Filtered tweets:', tweets.map(tweet => _.pick(tweet, ['text', 'user.name', 'favorite_count', 'retweet_count'])));

      _.each(tweets, async tweet => {
        this.twitterState.emittedTweets[tweet.id_str] = true;
        this.emit('event', {
          id: generateID(),
          provider: 'twitter',
          type: 'tweet',
          message: tweet,
          user: {
            name: tweet.user.screen_name,
            displayName: tweet.user.name,
            id: tweet.user.id_str,
            profilePic: tweet.user.profile_image_url_https
          },
          decisions: [],
          error: null,
          sent: false
        });
      });

      fs.writeFile(`${settings.dataFolder}twitter.json`, JSON.stringify(this.twitterState), 'utf-8', err => {
        if (err) {
          throw err;
        }
      });
    } catch (err) {
      console.error(err);
      logger.error(err);
    }
  }
}
