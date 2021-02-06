import _ from 'lodash';
import backendArgs from '../../settings.backend.json';
import extendArgs from '../../settings.json';
import defaultArgs from '../../shared/src/settings.default.json';


// Limited amount of settings are also exposed via environment variables.
const envVarArgs = {
  twitter: {
    searchTerms: typeof process.env.TWITTER_SEARCHTERMS === 'string' ? process.env.TWITTER_SEARCHTERMS.split(',') : undefined,
  }
};

const settings = _.merge(defaultArgs, extendArgs, backendArgs, envVarArgs);

export default settings;
