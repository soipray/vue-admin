<template>
  <div id="nav-warp">
    <h1 class="logo">
      <img src="@/assets/logo.png" alt />
    </h1>

    <el-menu
      default-active="1-4-1"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      background-color="transparent"
      text-color="#fff"
      active-text-color="#fff"
      router
    >
      <template v-for="(item, index) in routers">
        <el-submenu v-if="!item.hidden" :key="item.id" :index="index + ''">
          <!--以及菜单-->
          <template slot="title">
            <svg-icon :iconClass="item.meta.icon" :className="item.meta.icon" />
            <span slot="title">{{ item.meta.name }}</span>
          </template>

          <el-menu-item
            v-for="subItem in item.children"
            :key="subItem.id"
            :index="subItem.path"
          >{{ subItem.meta.name }}</el-menu-item>
        </el-submenu>
      </template>
    </el-menu>
  </div>
</template>

<script>
import {
  reactive,
  ref,
  isRef,
  toRefs,
  onMounted,
  computed
} from "@vue/composition-api";
export default {
  name: "navMenu",
  setup(props, { root }) {
    //data
    //const isCollapse = ref(false);
    const routers = reactive(root.$router.options.routes);
    const isCollapse = computed(() => root.$store.state.app.isCollapse);
    //methods
    const handleOpen = (key, keyPath) => {
      //console.log(key, keyPath);
    };
    const handleClose = (key, keyPath) => {
      //console.log(key, keyPath);
    };
    return {
      isCollapse,
      handleOpen,
      handleClose,
      routers
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/config.scss";
#nav-warp {
  position: fixed;
  top: 0;
  left: 0;
  width: $navMenu;
  height: 100vh;
  background-color: #344a5f;
  @include webkit(transition, all 0.3s ease 0s);
  svg {
    font-size: 20px;
    margin-right: 10px;
  }
}

.logo {
  text-align: center;
  img {
    margin: 28px auto 25px;
    width: 92px;
    @include webkit(transition, all 0.3s ease 0s);
  }
}

.open {
  #nav-warp {
    width: $navMenu;
  }
}

.close {
  #nav-warp {width: $navMenuMin;}
  .logo img {width: 60%;}
}
</style>
