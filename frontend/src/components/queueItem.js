import _ from 'lodash';
import './queueItem.scss';

export default {
  name: 'QueueItem',
  data () {
    return {
      userInfo: null
    };
  },
  created () {
  },
  methods: {
    moderate (decision) {
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
      return result;
    },
    media () {
      return null;
    }
  }
};
