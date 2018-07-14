import _ from 'lodash';
import { removeAt, getAt, setAt } from './helpers';

export default class State {
  constructor() {
    this.state = {
      moderationQueue: [],
      autoIncrement: 0
    };
  }

  apply(mutation) {
    if (mutation.type === 'set') {
      setAt(this.state, mutation.target, mutation.data);
    } else if (mutation.type === 'push') {
      const target = getAt(this.state, mutation.target, []);
      target.push(mutation.data);
      setAt(this.state, mutation.target, target);
    } else if (mutation.type === 'insert') {
      const target = getAt(this.state, mutation.target, []);
      const item = getAt(target, mutation.selector);
      if (item) {
        _.merge(item, mutation.data);
      } else {
        target.push(_.merge({}, mutation.defaults, mutation.data));
      }
    } else if (mutation.type === 'delete') {
      removeAt(this.state, mutation.target);
    } else {
      throw new Error(`Invalid mutation type ${JSON.stringify(mutation)}`);
    }
  }


  moderate(user, action, id) {
    const queueItem = _.find(this.state.moderationQueue, { id });
    if (queueItem) {
      const existingDecision = _.find(queueItem.decisions, decision => decision.user.id === user.id);
      if (existingDecision) {
        existingDecision.action = action;
      } else {
        queueItem.actions.push({
          user,
          action
        });
      }
    } else {
      throw new Error(`Queue item with ID ${id} not found.`);
    }
  }
}
