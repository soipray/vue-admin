import { MessageBox } from 'element-ui';
export default {
    install(Vue, options) {
        Vue.prototype.confirm = (params) => {
            MessageBox.confirm(params.content, params.tip || "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: params.type || "warning"
            })
                .then(() => {
                    params.fn && params.fn(params.id)
                })
                .catch(() => {

                });
        }
    }
}