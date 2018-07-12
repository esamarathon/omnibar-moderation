import _ from 'lodash';
import { getUser } from '../twitch';

export default {
  name: 'QueueItem',
  data () {
    return {
      userInfo: null
    };
  },
  created () {
    getUser({id: this.itemInfo.user.id}).then(userInfo => {
      this.userInfo = userInfo;
    });
  },
  methods: {
  },
  props: {
    itemInfo: Object
  },
  computed: {
    sortedDecisions () {
      const result = _.sortBy(_.map(this.itemInfo.decisions, (decision, user) => {
        return _.merge({}, decision, {user});
      }), 'action');
      console.log('Sorted decisions: ', result);
      return result;
    }
  }
};
