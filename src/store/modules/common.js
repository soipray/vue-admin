import { GetCategory } from "@/api/news";

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
