<template>
  <div id="category">
    <el-button type="danger" @click="addFirst({type:'category_first_add'})">添加一级分类</el-button>
    <hr class="hr-e9e9e9" />
    <div>
      <el-row :gutter="30">
        <el-col :span="8">
          <div class="category-wrap">
            <div class="category" v-for="firstItem in category.item" :key="firstItem.id">
              <h4>
                <svg-icon icon-class="minus"></svg-icon>
                {{firstItem.category_name }}
                <div class="button-group">
                  <el-button
                    size="mini"
                    type="danger"
                    round
                    @click="editCategory({data:firstItem,type:'category_first_edit'})"
                  >编辑</el-button>
                  <el-button size="mini" type="success" round @click="handleAddChildren({data:firstItem,type:'category_children_add'})">添加</el-button>
                  <el-button size="mini" round @click="deleteCategoryConfirm(firstItem.id)">删除</el-button>
                </div>
              </h4>
              <ul v-if="firstItem.children">
                <li v-for="childrenItem in firstItem.children" :key="childrenItem.id">
                  {{childrenItem.category_name}}
                  <div class="button-group">
                    <el-button size="mini" type="danger" round>编辑</el-button>
                    <el-button size="mini" round>删除</el-button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </el-col>
        <el-col :span="16">
          <h4 class="menu-title">一级分类编辑</h4>
          <el-form label-position="right" label-width="142px" class="from-wrap" ref="ruleForm">
            <el-form-item label="一级分类名称" v-if="category_first_input">
              <el-input v-model="form.categoryName" :disabled="category_first_disable"></el-input>
            </el-form-item>
            <el-form-item label="二级分类名称" v-if="category_children_input">
              <el-input v-model="form.secCategoryName" :disabled="category_children_disable"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="danger"
                @click="submit"
                :loading="submit_button_loading"
                :disabled="submit_button_disable"
              >确定</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { global } from "@/utils/global3";
import { common } from "@/api/common";
import {
  AddFristCategory,
  GetCategory,
  DeleteCategory,
  EditCategory,
  AddChildrenCategory
} from "@/api/news";
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
  name: "category",
  setup(props, { root, refs }) {
    const { getInfoCategory,getInfoCategoryAll,categoryItem } = common();
    const { confirm } = global();
    //ref
    const category_first_input = ref(true);
    const category_children_input = ref(true);
    const submit_button_loading = ref(false);
    const category_first_disable = ref(true);
    const category_children_disable = ref(true);
    const submit_button_disable = ref(true);
    const deleteId = ref("");
    const submit_button_type = ref("");
    //reactive
    const form = reactive({
      categoryName: "",
      secCategoryName: ""
    });

    const category = reactive({
      item: [
        {
          id: "1",
          category_name: "国际信息1",
          children: [
            {
              id: "3",
              category_name: "国际信息3"
            }
          ]
        },
        {
          id: "2",
          category_name: "国际信息2",
          children: [
            {
              id: "4",
              category_name: "国际信息4"
            }
          ]
        }
      ],
      current: []
    });

    //methods
    const submit = () => {
      if (submit_button_type.value === "category_first_add") {
        addFristCategory();
      }

      if (submit_button_type.value === "category_first_edit") {
        editFirstCategory();
      }

      if (submit_button_type.value === "category_children_add") {
        addChildrenCategory();
      }
    };

    const addFristCategory = () => {
      if (!form.categoryName) {
        root.$message({
          message: "分类名称不能为空",
          type: "error"
        });
        return false;
      }

      submit_button_loading.value = true;
      AddFristCategory({ categoryName: form.categoryName })
        .then(response => {
          let data = response.data;
          if (data.resCode === 0) {
            root.$message({
              message: data.message,
              type: "success"
            });

            category.item.push(data.data);
          }

          submit_button_loading.value = false;
          form.categoryName = "";
          form.secCategoryName = "";
        })
        .catch(error => {
          submit_button_loading.value = false;
          form.categoryName = "";
          form.secCategoryName = "";
          console.log(error);
        });
    };

    const addFirst = params => {
      submit_button_type.value = params.type;
      submit_button_disable.value = false;
      category_first_input.value = true;
      category_children_input.value = false;

      category_first_disable.value = false;
      category_children_disable.value = true;
    };
    //添加二级
    const handleAddChildren = (params) => {
      submit_button_type.value = params.type;
      //存储数据
      category.current = params.data
      //禁用一级输入框
      category_first_disable.value = true;
      //启用子级输入框
      category_children_disable.value = false;
      //显示子级输入框
      category_children_input.value = true;
      //启用确定按钮
      submit_button_disable.value = false;
      //显示一级分类文本
      form.categoryName = params.data.category_name;
    }
    const addChildrenCategory = () => {
      if(!form.secCategoryName){
        root.$message.error("子级分类不能为空")
        return false;
      }
      let requestData = {
        categoryName: form.secCategoryName,
        parentId: category.current.id
      }
      
      AddChildrenCategory(requestData).then((response) => {
        let rspData = response.data
        root.$message.success(rspData.message)
        getInfoCategoryAll();
        form.secCategoryName = ''
      })
    }

    const deleteCategory = categoryId => {
      DeleteCategory({ categoryId: deleteId.value })
        .then(response => {
          let index = category.item.findIndex(
            item => item.id == deleteId.value
          );
          category.item.splice(index, 1);
        })
        .catch(error => {
          console.log(error);
        });
    };

    //删除
    const deleteCategoryConfirm = categoryId => {
      deleteId.value = categoryId;
      confirm({
        content: "确认删除当前信息，删除后将无法恢复！！",
        tip: "警告",
        fn: deleteCategory,
        catchFn: () => {
          deleteId.value = "";
        }
      });
    };

    //编辑
    const editCategory = params => {
      submit_button_type.value = params.type;
      form.categoryName = params.data.category_name;

      //category_first_input.value = true;
      category_children_input.value = false;

      //category_children_disable.value = true;
      category_first_disable.value = false;
      submit_button_disable.value = false;

      //存储当前对象
      category.current = params.data;
    };
    const editFirstCategory = () => {
      if (category.current.length == 0) {
        root.$message.error("未选择分类！！");
        return false;
      }

      let requestData = {
        id: category.current.id,
        categoryName: form.categoryName
      };
      EditCategory(requestData)
        .then(response => {
          let responseData = response.data;
          root.$message.success(responseData.message);
          category.current.category_name = responseData.data.data.categoryName;
          //let data = category.item.filter(item => item.id == category.current.id)
          //data[0].category_name = responseData.data.data.categoryName

          //清空
          form.categoryName = "";
          category.current = [];
        })
        .catch(error => {
          console.log(error);
        });
    };

    //lifecycle
    onMounted(() => {
      getInfoCategoryAll();
    });

    //watch
    watch(() => categoryItem.item,(value) => {
      category.item = value;
    })

    return {
      //ref
      category_first_input,
      category_children_input,
      submit_button_loading,
      category_first_disable,
      category_children_disable,
      submit_button_disable,
      //reactive
      form,
      category,

      //methods
      submit,
      addFirst,
      handleAddChildren,
      deleteCategoryConfirm,
      editCategory,
      addChildrenCategory
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/config.scss";
.category-wrap {
  div:first-child {
    &:before {
      top: 20px;
    }
  }
  div:last-child {
    &:before {
      bottom: 21px;
    }
  }
}
.menu-title {
  line-height: 44px;
  padding-left: 22px;
  background-color: #f3f3f3;
}
.category {
  position: relative;
  line-height: 44px;
  cursor: pointer;
  &:before {
    content: "";
    position: absolute;
    left: 22px;
    top: 0;
    bottom: 0;
    width: 32px;
    border-left: 1px dotted #000;
  }
  h4 {
    position: relative;
    padding-left: 40px;
  }
  svg {
    position: absolute;
    left: 14px;
    top: 15px;
    background-color: #fff;
    font-size: 17px;
  }
  li {
    position: relative;
    padding-left: 36px;
    margin-left: 24px;
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 22px;
      width: 32px;
      border-bottom: 1px dotted #000;
    }
  }
  li,
  h4 {
    @include webkit(transition, all 0.5s ease 0s);
    &:hover {
      background-color: #f3f3f3;
      .button-group {
        display: block;
      }
    }
  }
}
.button-group {
  display: none;
  position: absolute;
  z-index: 2;
  right: 11px;
  top: -1px;
  button {
    font-size: 12px;
  }
}
.from-wrap {
  width: 410px;
  padding-top: 26px;
}
.hr-e9e9e9 {
  width: calc(100% + 60px);
  margin-left: -30px;
  border: none;
  margin-top: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e9e9e9;
}
</style>