let envId = 0;

export class AppEnvironment {
  constructor(options) {
    this._id = envId++;
    this._debug = !!options.debug;
  }

  /**
   * Returns an unique identifier that can be used with IPC to identify messages from this environment.
   *
   * @returns {number} Returns an unique identifier.
   */
  get id() {
    return this._id;
  }

  /**
   * @returns {boolean}
   */
  get debug() {
    return this._debug;
  }
}

/**
 * Create a (global) application environment instance and bootstraps the application.
 *
 * @param {arg.Result} args The parsed application arguments.
 * @returns {AppEnvironment} The current (global) environment.
 */
const setupEnvironment = () => {
  const debug = process.env.NODE_ENV !== "production";
  const appEnvironment = new AppEnvironment({
    debug
  });

  return appEnvironment;
};

export default setupEnvironment;
