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
      /*
        turn
        itemInfo.message.extended_entities.media: [{
          "id_str": "1020329342482763776",
          "media_url_https": "https://pbs.twimg.com/media/DijwIYyX0AA3WJ9.jpg",
          "expanded_url": "https://twitter.com/Monojira/status/1020329355162148864/photo/1",
          "type": "photo",
          "sizes": {
            "thumb": {
              "w": 150,
              "h": 150,
              "resize": "crop"
            },
            "large": {...},
            "small": {...},
            "medium": {...}
          }
        }]
        into
        [{
          img: 'https://cdn.rawgit.com/vrajroham/vrajroham.github.io/85d64ac5/imgs/img1.jpg',
          thumbnail: 'https://cdn.rawgit.com/vrajroham/vrajroham.github.io/85d64ac5/imgs/img1.jpg:thumb'
        }]
      */
      const media = _.get(this.itemInfo, 'message.extended_entities.media');
      if (this.itemInfo.provider !== 'twitter' || !media || media.length === 0) return null;
      console.log('Processing media', media);
      return _.map(media, mediaItem => ({
        img: mediaItem.media_url_https,
        thumbnail: `${mediaItem.media_url_https}:thumb`
      }));
    }
  }
};
