import _ from 'lodash';

export function noop() {}

export function throttleAsync(func, duration) {
  let lastInitiated = 0;
  let promise = null;
  let finishedPromise = null;

  return (fast, ...args) => {
    const now = Date.now();
    if (now - lastInitiated > duration) {
      console.log('Initiating throttled call');
      const newPromise = func(...args);
      promise = newPromise;
      lastInitiated = now;
      if (newPromise.then) {
        newPromise.then(() => {
          finishedPromise = newPromise;
        });
      }
    }
    if (fast && finishedPromise) return finishedPromise;
    return promise;
  };
}

/** queries a path against an object
 * the path can either be a dot-seperated string of property names or a list of strings or objects
 * strings denote object dereferences, objects search by example for items in a collection
 * callback is called with (object, value, lastStep) when the last item is found, where getAt(object, path) === object[lastStep]
 * Example usage with helpers (see below):
 * - getAt({foo:["bar","baz"]}, "foo.1") == "baz"
 * - getAt({foo:[{name: "bar", value: 5},{name: "baz", value: 7}]}, ["foo",{name: "bar"}]) == {name: "bar", value: 5}
* */
export function queryObject(object, path, callback) {
  let _object = object;
  let _path = path;
  if (_.isString(path)) _path = path.split('.');
  _.each(_path.slice(0, -1), step => {
    if (!_object) throw new Error('Item not found');
    if (_.isString(step) || _.isInteger(step)) {
      _object = _object[step];
    } else if (_.isObject(step)) {
      _object = _.find(_object, step);
    } else {
      throw new Error('Illegal path');
    }
  });

  // handle the last step seperately
  if (!_object) return undefined;
  let lastStep = _path[_path.length - 1];
  if (_.isObject(lastStep)) {
    lastStep = _.findKey(_object, lastStep);
  } else if (!_.isString(lastStep) && !_.isInteger(lastStep)) {
    throw new Error('Illegal path');
  }
  if (callback) callback(_object, _object[lastStep], lastStep);


  return _object;
}

export function getAt(object, path, def) {
  let result = def;
  queryObject(object, path, (obj, val) => {
    result = val;
  });
  return result;
}

export function setAt(object, path, value) {
  queryObject(object, path, (obj, val, step) => {
    obj[step] = value;
  });
  return object;
}

export function removeAt(object, path) {
  queryObject(object, path, (obj, val, step) => {
    if (_.isArray(obj)) {
      const index = parseInt(step, 10);
      if (Number.isNaN(index)) throw new Error(`Invalid array index: ${step}`);
      obj.splice(index, 1);
    } else {
      delete obj[step];
    }
  });
  return object;
}

export function generateID() {
  return `${Date.now()}${_.random(10000000, 99999999)}`;
}
