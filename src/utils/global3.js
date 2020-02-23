import { MessageBox } from 'element-ui';
import {
    reactive,
    ref,
    isRef,
    toRefs,
    onMounted,
    computed,
    watch
} from "@vue/composition-api";

export function global() {
    //str可以在外部watch
    const str = ref('')
    const confirm = (params) => {
        MessageBox.confirm(params.content, params.tip || "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: params.type || "warning"
        })
            .then(() => {
                str.value = str.value + "1"
                params.fn && params.fn(params.id || '')
            })
            .catch(() => {
                params.catchFn && params.catchFn()
            });
    }
    return {
        str,
        confirm
    }
}
