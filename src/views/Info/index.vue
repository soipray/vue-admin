<template>
  <div>
    <el-row :gutter="14">
      <el-col :span="4">
        <div class="label-wrap category">
          <label for>分类：</label>
          <div class="warp-content">
            <el-select v-model="category_value" placeholder="请选择" style="width: 100%;">
              <el-option
                v-for="item in options.category"
                :key="item.id"
                :label="item.category_name"
                :value="item.id"
              />
            </el-select>
          </div>
        </div>
      </el-col>

      <el-col :span="7">
        <div class="label-wrap date">
          <label for>日期：&nbsp;&nbsp;</label>
          <div class="warp-content">
            <el-date-picker
              style="width: 100%;"
              v-model="date_value"
              type="datetimerange"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd HH:mm:ss"
              align="right"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['12:00:00', '08:00:00']"
            ></el-date-picker>
          </div>
        </div>
      </el-col>

      <el-col :span="5">
        <div class="label-wrap key-work">
          <label for>关键字：&nbsp;&nbsp;</label>
          <div class="warp-content">
            <el-select v-model="search_key" style="width: 100%;">
              <el-option
                v-for="item in search_options"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </el-select>
          </div>
        </div>
      </el-col>

      <el-col :span="3">
        <el-input v-model="search_keyWork" placeholder="请输入内容" style="width: 100%;"></el-input>
      </el-col>

      <el-col :span="2">
        <el-button type="danger" style="width: 100%;" @click="search">搜索</el-button>
      </el-col>
      <el-col :span="1">-</el-col>
      <el-col :span="2">
        <el-button
          type="danger"
          class="pull-right"
          style="width: 100%;"
          @click="dialog_info = true"
        >新增</el-button>
      </el-col>
    </el-row>

    <!--表格-->
    <div class="black-space-30"></div>
    <el-table
      v-loading="loadingData"
      :data="table_data.item"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45"></el-table-column>
      <el-table-column prop="title" label="标题" fit="true"></el-table-column>
      <el-table-column prop="categoryId" label="类型" width="130" :formatter="toCategory"></el-table-column>
      <el-table-column prop="createDate" label="日期" width="150" :formatter="toDate"></el-table-column>
      <el-table-column prop="user" label="管理员" width="107"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="deleteItem(scope.row.id)">删除</el-button>
          <el-button type="success" size="mini" @click="editInfo(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="black-space-30"></div>

    <!--底部分页-->
    <el-row>
      <el-col :span="6">
        <el-button size="medium" @click="deleteAll">批量删除</el-button>
      </el-col>
      <el-col :span="18">
        <el-pagination
          class="pull-right"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[10, 20, 50, 100]"
          layout="total ,sizes , prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </el-col>
    </el-row>

    <!--新增弹窗-->
    <DialogInfo :flag.sync="dialog_info" :category="options.category" @getList="getList" />
    <!--编辑弹窗-->
    <DialogInfoEdit
      :flag.sync="dialog_info_edit"
      :id="infoId"
      :category="options.category"
      @getList="getList"
    />
  </div>
</template>

<script>
import { GetCategory, GetList, DeleteInfo } from "@/api/news";
import DialogInfo from "./dialog/info";
import DialogInfoEdit from "./dialog/edit";
import { global } from "@/utils/global3";
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

export default {
  name: "Info",
  components: { DialogInfo, DialogInfoEdit },
  setup(props, { root }) {
    const { str: my_str, confirm } = global();
    //watch(() => console.log(my_str.value));

    //数据
    const category_value = ref("");
    const date_value = ref("");
    const search_key = ref("id");
    const search_keyWork = ref("");
    //信息弹窗标记
    const dialog_info = ref(false);
    const dialog_info_edit = ref(false);
    const total = ref(0);
    const loadingData = ref(false);
    const deleteInfoId = ref("");
    const infoId = ref("");

    const options = reactive({
      category: []
    });

    //搜索关键字
    const search_options = reactive([
      {
        value: "id",
        label: "ID"
      },
      {
        value: "title",
        label: "关键字"
      }
    ]);
    //页码
    const page = reactive({
      pageNumber: 1,
      pageSize: 10
    });

    //表格数据
    const table_data = reactive({
      item: []
    });

    //methods
    const handleSizeChange = val => {
      console.log(`每页 ${val} 条`);
    };
    const handleCurrentChange = val => {
      console.log(`当前页: ${val}`);
      page.pageNumber = val;
      getList();
    };

    const deleteItem = id => {
      deleteInfoId.value = [id];
      confirm({
        content: "确认删除当前信息，删除后将无法恢复！！",
        tip: "警告",
        fn: confirmDelete
      });
    };

    const deleteAll = () => {
      if (!deleteInfoId.value || deleteInfoId.value.length == 0) {
        root.$message.error("请选择要删除的数据！！");
        return false;
      }
      confirm({
        content: "确认删除选中的数据，删除后将无法恢复！！",
        type: "success",
        fn: confirmDelete
      });
    };

    const confirmDelete = () => {
      DeleteInfo({ id: deleteInfoId.value }).then(response => {
        deleteInfoId.value = "";
        getList();
      });
    };

    const search = () => {
      getList();
    };

    const formatData = () => {
      let requestData = {
        pageNumber: page.pageNumber,
        pageSize: page.pageSize
      };
      //分类Id
      if (category_value.value) {
        requestData.categoryId = category_value.value;
      }
      //日期
      if (date_value.value.length > 0) {
        requestData.startTiem = date_value.value[0];
        requestData.endTime = date_value.value[1];
      }
      //关键字
      requestData[search_key.value] = search_keyWork.value;
      return requestData;
    };

    const getList = () => {
      let requestData = formatData();

      //加载状态
      loadingData.value = true;
      GetList(requestData)
        .then(response => {
          let data = response.data.data;
          table_data.item = data.data;

          //更新页码
          total.value = data.total;
          //加载状态
          loadingData.value = false;
        })
        .catch(error => {
          loadingData.value = false;
          console.log(error);
        });
    };

    const getInfoCategory = () => {
      root.$store
        .dispatch("common/getInfoCategory")
        .then(response => {
          options.category = response;
        })
        .catch(error => {});
    };

    const toDate = (row, column, cellValue, index) => {
      return timestampToTime(row.createDate);
    };

    const toCategory = (row, column, cellValue, index) => {
      let categoryId = row.categoryId;
      let categoryData = options.category.filter(
        item => item.id == categoryId
      )[0];
      return categoryData.category_name;
    };

    const handleSelectionChange = val => {
      deleteInfoId.value = val.map(item => item.id);
    };

    const editInfo = id => {
      dialog_info_edit.value = true;
      infoId.value = id;
    };
    //lifecycle
    onMounted(() => {
      getInfoCategory();
      getList();
    });

    return {
      //ref
      category_value,
      date_value,
      dialog_info,
      dialog_info_edit,
      search_key,
      search_keyWork,
      total,
      loadingData,
      infoId,

      //reactive
      options,
      search_options,
      table_data,

      //methods
      handleSizeChange,
      handleCurrentChange,
      deleteItem,
      deleteAll,
      toDate,
      toCategory,
      handleSelectionChange,
      search,
      editInfo,
      getList
    };
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/config.scss";
.label-wrap {
  &.category {
    @include labelDom(left, 60, 40);
  }
  &.date {
    @include labelDom(right, 93, 40);
  }
  &.key-work {
    @include labelDom(right, 99, 40);
  }
}
</style>