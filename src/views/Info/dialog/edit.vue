<template>
  <el-dialog
    title="修改"
    :visible.sync="data.dialog_info_flag"
    @close="close"
    @opened="openDialog"
    width="580px"
  >
    <el-form :model="data.form" ref="addInfoForm">
      <el-form-item label="类别：" :label-width="data.formLabelWidth" prop="category">
        <el-select v-model="data.form.category" placeholder="请选择活动区域">
          <el-option
            v-for="item in data.categoryOption"
            :key="item.id"
            :label="item.category_name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="标题：" :label-width="data.formLabelWidth" prop="title">
        <el-input v-model="data.form.title" placeholder="请输入标题"></el-input>
      </el-form-item>

      <el-form-item label="概况：" :label-width="data.formLabelWidth" prop="content">
        <el-input type="textarea" v-model="data.form.content" placeholder="请输入内容"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="danger" :loading="data.submitLoading" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {  GetList ,EditInfo } from "@/api/news";
import {
  reactive,
  ref,
  isRef,
  toRefs,
  onMounted,
  computed,
  watch
} from "@vue/composition-api";

export default {
  name: "DialogInfo",
  //单项数据流 父级->子级 不可以反向修改
  props: {
    flag: {
      type: Boolean,
      default: false
    },
    category: {
      type: Array,
      default: () => []
    },
    id: {
      type: String,
      default: ""
    }
  },

  setup(props, { root, emit, refs }) {
    const data = reactive({
      dialog_info_flag: false, //弹窗标记
      formLabelWidth: "70px",
      submitLoading: false,
      form: {
        category: "",
        title: "",
        content: ""
      },
      //分类下拉
      categoryOption: []
    });

    //methods
    const close = () => {
      data.dialog_info_flag = false;
      resetForm();
      emit("update:flag", false);
      //回调的时候需要逻辑处理的时候 就不能用修饰器
      //this.$emit("close",false)
    };

    const openDialog = () => {
      data.categoryOption = props.category;
      getInfo();
    };

    const getInfo = () => {
      let requestData = {
        pageNumber: 1,
        pageSize: 1,
        id: props.id
      };
      GetList(requestData).then(response => {
        let responseData = response.data.data.data[0];

        data.form = {
          category: responseData.categoryId,
          title: responseData.title,
          content: responseData.content
        };
      });
    };

    const resetForm = () => {
      refs.addInfoForm.resetFields()
    };
    const submit = () => {
      let requestData = {
        id: props.id,
        categoryId: data.form.category,
        title: data.form.title,
        content: data.form.content
      };
      if (!data.form.category) {
        root.$message.error("分类不能为空！！");
        return false;
      }

      data.submitLoading = true;
      EditInfo(requestData)
        .then(response => {
          data.submitLoading = false;
          root.$message.success(response.data.message);

          //resetForm();

          emit('getList')
        })
        .catch(error => {
          data.submitLoading = false;
        });
    };

    //watch
    watch(() => {
      data.dialog_info_flag = props.flag;
    });

    return {
      data,
      close,
      openDialog,
      submit
    };
  }
};
</script>

<style lang="scss" scoped>
</style>