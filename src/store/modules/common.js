import { GetCategory } from "@/api/news";
const state = {
    qiniuUrl: "http://www-web-jshtml-cn-idva7mx.web-jshtml.cn/"
}
const getters = {
    qiniuUrl: state => state.qiniuUrl
}
const actions = {
    getInfoCategory(content, requestData) {
        return new Promise((resolve, reject) => {
            GetCategory(requestData).then((response) => {
                resolve(response.data.data.data)
            }).catch((error) => {
                reject(error)
            });
        });
    },
}

export default {
    namespaced: true,
    actions
};
