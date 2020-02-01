export function getCookie(key) {
  return localStorage.getItem(key)
}

export function setCookie(key, val) {
  return localStorage.setItem(key, val)
}

export function deleteCookie(key) {
  return localStorage.removeItem(key)
}

export const hasKeys = obj => Object.keys(obj).length > 0
