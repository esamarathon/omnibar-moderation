import _ from 'lodash';

import defaultArgs from '../../shared/src/settings.default.json';
import extendArgs from '../../settings.json';

const settings = _.merge(defaultArgs, extendArgs);
export default settings;
