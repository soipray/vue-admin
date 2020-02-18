<template>
  <div id="header-warp">
    <div class="pull-left header-icon" @click="navMenuState">
      <svg-icon iconClass="menu" class="menu" />
    </div>

    <div class="pull-right">
      <div class="user-info pull-left">
        <img src="@/assets/images/face.jpg" alt />
        {{username}}
      </div>
      <div class="header-icon pull-left" @click="exit">
        <svg-icon iconClass="exit" class="exit" />
      </div>
    </div>
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
  name: "Header",
  setup(props, { root }) {
    const username = computed(() => root.$store.state.app.username);
    const navMenuState = () => {
      root.$store.commit("app/SET_COLLAPSE");
      //root.$store.dispatch('setMenuStatus')
    };
    const exit = () => {
      root.$store
        .dispatch("app/exit")
        .then(result => {
          root.$router.push({
            name: "Login"
          });
        })
        .catch(err => {});
    };

    return {
      navMenuState,
      username,
      exit
    };
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/config.scss";
#header-warp {
  position: fixed;
  top: 0;
  right: 0;
  left: $navMenu;
  height: 75px;
  background-color: #fff;
  line-height: 75px;

  @include webkit(box-shadow, 0 3px 16px 0 rgba(0, 0, 0, 0.1));
  @include webkit(transition, all 0.3s ease 0s);
}
.open {
  #header-warp {
    left: $navMenu;
  }
}
.close {
  #header-warp {
    left: $navMenuMin;
  }
}

.header-icon {
  padding: 0 32px;
  svg {
    margin-bottom: -8px;
    font-size: 25px;
    cursor: pointer;
  }
}

.user-info {
  height: 100%;
  padding: 0 32px;
  border-right: 1px solid #ededed;
  + .header-icon {
    padding: 0 28px;
  }
  img {
    display: inline-block;
    margin-bottom: -12px;
    margin-right: 18px;
    border-radius: 50px;
  }
}
</style>
