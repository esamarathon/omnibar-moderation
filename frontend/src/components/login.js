import settings from '../settings';

console.log(settings);

export default {
  name: 'Login',
  data () {
    return {
    };
  },
  methods: {
    login: () => {
      window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${settings.twitch.clientID}` +
        `&redirect_uri=${encodeURIComponent(settings.api.baseurl + '/login')}` +
        `&response_type=code&scope=`;
    }
  }
};
