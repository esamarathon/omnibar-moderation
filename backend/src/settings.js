import _ from 'lodash';
import backendArgs from '../../settings.backend.json';
import defaultArgs from '../../shared/src/settings.default.json';


// Limited amount of settings are also exposed via environment variables.
const envVarArgs = {
};

const settings = _.merge(defaultArgs, backendArgs, envVarArgs);

export default settings;
