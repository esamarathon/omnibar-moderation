module.exports = originalPath => {
  if (originalPath.indexOf('dist') === -1) return originalPath.replace('../../shared/src', '../../shared/dist');
  return originalPath;
};
