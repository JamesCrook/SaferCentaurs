const Factories = (() => {

  let factories = {};

  function addFactory(factory) {
    factories[factory.name] = factory;
  }

  function create(factory, name) {
    return factories?.[factory](name);
  }

  /**
   * Returns the public API for the AppUi singleton.
   * @returns {object} The API object.
   */
  function api() {
    return {
      addFactory, // adds capability
      create,
    }
  }
  return api();
})()