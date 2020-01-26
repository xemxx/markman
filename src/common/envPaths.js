import path from 'path'

class EnvPaths {
  /**
   * @param {string} userDataPath The user data path.
   * @returns
   */
  constructor (userDataPath) {
    const currentDate = new Date()
    if (!userDataPath) {
      throw new Error('"userDataPath" is not set.')
    }

    this._electronUserDataPath = userDataPath // path.join(userDataPath, 'electronUserData')
    this._userDataPath = userDataPath
    this._logPath = path.join(this._userDataPath, 'logs', `${currentDate.getFullYear()}${currentDate.getMonth() + 1}`)
    this._preferencesPath = userDataPath // path.join(this._userDataPath, 'preferences')
    this._preferencesFilePath = path.join(this._preferencesPath, 'preference.json')

  }

  get electronUserDataPath () {
    // This path is identical to app.getPath('userData') but userDataPath must not necessarily be the same path.
    return this._electronUserDataPath
  }

  get userDataPath () {
    return this._userDataPath
  }

  get logPath () {
    return this._logPath
  }

  get preferencesPath () {
    return this._preferencesPath
  }

  get preferencesFilePath () {
    return this._preferencesFilePath
  }
}

export default EnvPaths
