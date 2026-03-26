// eslint-disable-next-line compat/compat
const neverResolve = () => new Promise(() => {});
module.exports = neverResolve;
module.exports.default = neverResolve;
