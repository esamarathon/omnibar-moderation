import _ from 'lodash';
import { getUser } from '../twitch';
import './queueItem.scss';

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
    moderate (decision, ...args) {
      console.log('decision param:', decision);
      console.log('Other args:', args);
      this.$emit('moderate', {
        item: this.itemInfo,
        decision
      });
    }
  },
  props: {
    itemInfo: Object,
    status: Object
  },
  computed: {
    sortedDecisions () {
      const result = _.sortBy(this.itemInfo.decisions, 'action');
      console.log('Sorted decisions: ', result);
      return result;
    }
  }
};
