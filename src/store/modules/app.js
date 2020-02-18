import { Login } from "@/api/login"
import { setToken, removeToKen, setUsername, getUsername, removeUsername } from "@/utils/app"

const state = {
    isCollapse: JSON.parse(sessionStorage.getItem('isCollapse')) || false,
    to_ken: '',
    username: getUsername() || '',
}

const getters = {
    isCollapse: state => state.isCollapse,
}

const mutations = {
    SET_COLLAPSE(state) {
        state.isCollapse = !state.isCollapse
        sessionStorage.setItem('isCollapse', JSON.stringify(state.isCollapse))
    },
    SET_TOKEN(state, value) {
        state.to_ken = value
    },
    SET_USERNAME(state, value) {
        state.username = value
    },
    REMOVE_TOKEN(state) {
        state.to_ken = ''
    },
    REMOVE_USERNAME(state) {
        state.username = ''
    }
}

const actions = {
    login(content, requestData) {
        return new Promise((resolve, reject) => {
            Login(requestData).then((response) => {
                let data = response.data.data;
                content.commit('SET_TOKEN', data.token);
                content.commit('SET_USERNAME', data.username);
                setToken(data.token)
                setUsername(data.username)
                resolve(response)

            }).catch((error) => {
                reject(error)
            });
        });
    },

    exit(content, requestData) {
        return new Promise((resolve, reject) => {
            removeToKen()
            removeUsername()

            content.commit('SET_TOKEN', '');
            content.commit('SET_USERNAME', '');

            resolve()
        });

    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
