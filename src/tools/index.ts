export function getCookie(key) {
  return localStorage.getItem(key)
}

export function setCookie(key, val) {
  return localStorage.setItem(key, val)
}

export function deleteCookie(key) {
  return localStorage.removeItem(key)
}

export const hasKeys = (obj: {}) => Object.keys(obj).length > 0

export const isOsx = process.platform === 'darwin'
export const isWindows = process.platform === 'win32'
export const isLinux = process.platform === 'linux'
