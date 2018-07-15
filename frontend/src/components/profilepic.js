import _ from 'lodash';
import { getUser } from '../twitch';

const cacheByID = new Map();
const cacheByName = new Map();

async function getProfilePic (user) {
  if (!user) return null;
  if (user.id && cacheByID.get(user.id)) return cacheByID.get(user.id);
  else if (user.name && cacheByName.get(user.name)) return cacheByName.get(user.name);
  else {
    const profilePic = getUser(user).then(userInfo => userInfo.logo);
    if (user.id) cacheByID.set(user.id, profilePic);
    if (user.name) cacheByName.set(user.name, profilePic);
    return profilePic;
  }
}

export default {
  name: 'ProfilePic',
  data () {
    return {
      profilePic: null
    };
  },
  async created () {
    this.profilePic = await getProfilePic(this.user);
  },
  async updated () {
    this.profilePic = await getProfilePic(this.user);
  },
  props: {
    user: Object
  }
};
