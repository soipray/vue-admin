import cookie from "cookie_js"

const admintoKen = "admin_token"
const usernameKey = "username"

export function getToken() {
    return cookie.get(admintoKen)
}

export function setToken(value) {
    cookie.set(admintoKen, value)
}

export function removeToKen() {
    cookie.remove(admintoKen)
}

export function setUsername(value) {
    cookie.set(usernameKey, value)
}

export function getUsername() {
    return cookie.get(usernameKey)
}

export function removeUsername() {
    cookie.remove(usernameKey)
}
