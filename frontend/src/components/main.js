import Vue from 'vue';

import { getUser } from '../twitch';
import State from '../../../shared/src/state';
import settings from '../settings';

function getCookie (name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default {
  name: 'Main',
  data () {
    return {
      auth: null,
      user: null,
      state: new State()
    };
  },
  async created () {
    this.jwt = getCookie('om-jwt');
    if (this.jwt) {
      const [ , payload ] = this.jwt.split('.');
      try {
        const decodedPayload = JSON.parse(atob(payload));
        console.log('JWT payload: ', decodedPayload);
        decodedPayload.user.logo = null;
        this.user = decodedPayload.user;
        this.auth = decodedPayload.auth;
        // get user info (profile pic etc)
        await this.getUserInfo(this.user);

        this.connectWS();
      } catch (err) {
        console.error(err);
      }
    }
    if (!this.user) {
      this.$router.push({ name: 'Login' });
      
    }
  },
  methods: {
    async getUserInfo () {
      try {
        const userResult = await getUser(this.user);
        this.user.displayName = userResult.display_name;
        this.user.logo = userResult.profile_image_url;
        console.log(this.user);
        return userResult;
      } catch (err) {
        console.error(err);
      }
    },
    connectWS () {
      if (!this.jwt) {
        console.log('Not logged in, no websocket created.');
        return;
      }
      if (this.ws) {
        this.ws.close();
      }
      const url = new URL('ws', settings.api.baseurl);
      url.protocol = url.protocol === 'https' ? 'wss' : 'ws';
      this.ws = new WebSocket(url);
      this.ws.addEventListener('open', () => {
        console.log('Connected to WS');
        this.ws.send(JSON.stringify({
          'command': 'auth',
          'token': this.jwt
        }));
      });
      this.ws.addEventListener('error', err => {
        console.error(err);
        this.connectWS();
      });
      this.ws.addEventListener('close', err => {
        console.log('Disconnected from WS', err);
        // this.connectWS();
      });
      this.ws.addEventListener('message', event => {
        console.log('WS message:', event);
        const data = JSON.parse(event.data);
        if (data.command === 'state') {
          Vue.set(this.state, 'state', data.data);
          console.log('State initiated');
        } else if (data.command === 'mutation') {
          this.state.apply(data.mutation);
        }
      });
    }
  }
};