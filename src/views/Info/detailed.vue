<template>
  <el-form ref="form" :model="data.form" label-width="120px">
    <el-form-item label="信息分类：">
      <el-select v-model="data.form.categoryId">
        <el-option
          v-for="item in data.category"
          :key="item.id"
          :value="item.id"
          :label="item.category_name"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="新闻标题：">
      <el-input v-model="data.form.title"></el-input>
    </el-form-item>

    <el-form-item label="缩略图：">
      <UploadImg :imgUrl.sync="data.form.imgUrl" :config="uploadImgConfig" />
    </el-form-item>

    <el-form-item label="发布日期：">
      <el-date-picker v-model="data.form.createDate" type="date" placeholder="选择日期" disabled></el-date-picker>
    </el-form-item>

    <el-form-item label="详细内容：">
      <quillEditor v-model="data.form.content" ref="myQuillEditor" :options="data.editorOption" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submit" :loading="data.submitLoading">保存</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import UploadImg from "@/components/UploadImg";
import { GetList, EditInfo } from "@/api/news";
import { timestampToTime } from "@/utils/common";
import {
  reactive,
  ref,
  isRef,
  toRefs,
  onMounted,
  computed,
  watch
} from "@vue/composition-api";

// 富文本编辑器
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

export default {
  name: "Detailed",
  components: { quillEditor, UploadImg },
  setup(props, { root }) {
    // 图片上传配置
    const uploadImgConfig = reactive({
      action: "http://up-z2.qiniup.com",
      accesskey: "Avh-EZZAa4TxqPQZsEW42fXBUbTMFi-RKSZTRKJj",
      secretkey: "l9AXtnhCVkZexXNRcmHXzmecXiCUiLynwGboMeUw",
      buckety: "webjshtml"
    });

    const data = reactive({
      id: "",
      submitLoading: false,
      editorOption: {},
      category: [],
      form: {
        categoryId: "",
        title: "",
        content: "",
        createDate: "",
        imgUrl: ""
      }
    });
    data.id =
      root.$route.params.id || root.$store.getters["infoDetailed/infoId"];

    //获取信息分类
    const getInfoCategory = () => {
      root.$store
        .dispatch("common/getInfoCategory")
        .then(response => {
          data.category = response;
        })
        .catch(error => {});
    };

    //获取当前Id的信息
    const getInfo = () => {
      let requestData = {
        pageNumber: 1,
        pageSize: 1,
        id: data.id
      };
      GetList(requestData).then(response => {
        let responseData = response.data.data.data[0];

        data.form.category = responseData.categoryId;
        data.form.title = responseData.title;
        data.form.content = responseData.content;
        data.form.categoryId = responseData.categoryId;
        data.form.createDate = timestampToTime(responseData.createDate);
        data.form.imgUrl = responseData.imgUrl;
      });
    };

    const submit = () => {
      let requestData = {
        id: data.id,
        categoryId: data.form.categoryId,
        title: data.form.title,
        content: data.form.content,
        imgUrl: data.form.imgUrl
      };

      data.submitLoading = true;
      EditInfo(requestData)
        .then(response => {
          data.submitLoading = false;
          root.$message.success(response.data.message);
        })
        .catch(error => {
          data.submitLoading = false;
        });
    };

    //life recycle
    onMounted(() => {
      getInfoCategory();
      getInfo();
    });

    return {
      uploadImgConfig,
      data,
      getInfo,
      submit
    };
  }
};
</script>

<style lang="scss" scoped>

</style>