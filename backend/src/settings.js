import _ from 'lodash';

import defaultArgs from '../../shared/src/settings.default.json';
import extendArgs from '../../settings.json';
import backendArgs from '../../settings.backend.json';

const settings = _.merge(defaultArgs, extendArgs, backendArgs);

console.log('Settings: ', settings);
console.log('Default settings:', defaultArgs);
console.log('Extend settings:', extendArgs);
console.log('Backend settings:', backendArgs);
export default settings;
