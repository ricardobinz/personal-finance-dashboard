export function getJSON(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch (e) {
    console.warn('Failed to parse localStorage for', key, e)
    return defaultValue
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to set localStorage for', key, e)
  }
}
