class user {
    getToken() {
        return localStorage.getItem('token') ? localStorage.getItem('token') : ''
    }
    getUsername() {
        return localStorage.getItem('username') ? localStorage.getItem('username') : ''
    }
    saveToken(value) {
        localStorage.setItem('token', value)
    }
    saveUsername(value) {
        localStorage.setItem('username', value)
    }
}

export default user;