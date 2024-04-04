export const makeFnCallDebug = (name, moreOpts = {}) => ({
  onSuccess(...args) {
    console.log(`${name} Success`, ...args);
  },
  onError(error) {
    console.error(`${name} error`, error);
  },
  onMutate(variables) {
    console.log(`${name} mutation (wow)`, variables);
  },
  ...moreOpts
})


