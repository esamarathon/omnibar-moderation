'use strict';

require('./api');

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = new _server2.default();
server.runServer();
//# sourceMappingURL=backend.js.map