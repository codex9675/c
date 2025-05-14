// lib/utils.js
export function generateProfileLink(username) {
  return username.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 8)
}