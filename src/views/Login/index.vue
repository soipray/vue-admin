<template>
  <div id="login">
    <div class="login-warp">
      <ul class="menu-tab">
        <li
          v-for="item in menuTab"
          :key="item.id"
          :class="{'current': item.current}"
          @click="toggleMenu(item)"
        >{{item.txt}}</li>
      </ul>
      <!--表单start-->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username" class="item-form">
          <label for="username">邮箱</label>
          <el-input id="username" type="text" v-model="ruleForm.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item prop="password" class="item-form">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="passwords" class="item-form" v-show="model === 'register'">
          <label for="passwords">重复密码</label>
          <el-input
            id="passwords"
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code" class="item-form">
          <label>验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input v-model="ruleForm.code"></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                @click="getSms"
                :disabled="codeButtonStatus.status"
              >{{codeButtonStatus.text}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            @click="submitForm('loginForm')"
            class="login-btn block"
            :disabled="loginButtonStatus"
          >{{model === 'login' ? "登录": "注册"}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import sha1 from "js-sha1";
import { GetSms, Register, Login } from "@/api/login";
import { reactive, ref, isRef, toRefs, onMounted } from "@vue/composition-api";
import {
  stripscript,
  validateEmail,
  validatePass,
  validateVCode
} from "@/utils/validate";
export default {
  name: "Login",
  setup(props, { refs, root }) {
    //验证用户名
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式有误"));
      } else {
        callback();
      }
    };
    //验证密码
    let validatePassword = (rule, value, callback) => {
      return callback();
      ruleForm.password = stripscript(value);
      value = ruleForm.password;

      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6-20位数字+字母"));
      } else {
        callback();
      }
    };
    //验证重复密码
    let validatePasswords = (rule, value, callback) => {
      return callback();
      if (model.value === "login") {
        callback();
      }

      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;

      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("重复密码不正确"));
      } else {
        callback();
      }
    };
    //验证验证码
    let validateCode = (rule, value, callback) => {
      ruleForm.code = stripscript(value);
      value = ruleForm.code;

      let reg = /^[a-z0-9]{6}$/;
      if (value === "") {
        callback(new Error("请输入验证码"));
      } else if (validateVCode(value)) {
        callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };

    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);

    //tab模块值
    const model = ref("login");
    //登录按钮禁用状态
    const loginButtonStatus = ref(true);
    //验证码按钮装啊提
    const codeButtonStatus = reactive({
      status: false,
      text: "获取验证码"
    });
    //倒计时
    const timer = ref(null);

    //表单验证数据
    let ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });

    const updateButtonStatus = params => {
      codeButtonStatus.status = params.status;
      codeButtonStatus.text = params.text;
    };

    const toggleMenu = data => {
      menuTab.forEach(elem => (elem.current = false));
      data.current = true;
      model.value = data.type;

      //重置表单
      refs.loginForm.resetFields(); //3.0写法
      clearCountDown();
    };
    //表单方法
    const submitForm = formName => {
      refs[formName].validate(valid => {
        if (valid) {
          model.value === "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };

    //登陆
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: password/*sha1(ruleForm.password)*/,
        code: ruleForm.code
      };
      Login(requestData)
        .then(response => {
          console.log(response);
        })
        .catch(error => {});
    };

    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: password/*sha1(ruleForm.password)*/,
        code: ruleForm.code,
        module: "register"
      };
      Register(requestData)
        .then(response => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success"
          });

          //模拟注册成功
          toggleMenu(menuTab[0]);
          clearCountDown();
        })
        .catch(error => {});
    };

    //注册

    //获取验证码
    const getSms = () => {
      // 进行提示
      if (ruleForm.username == "") {
        root.$message.error("邮箱不能为空！！");
        return false;
      }
      if (validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误，请重新输入！！");
        return false;
      }
      // 获取验证码
      let requestData = {
        username: ruleForm.username,
        module: model.value
      };

      //修改验证码按钮状态
      updateButtonStatus({
        status: true,
        text: "发送中"
      });

      GetSms(requestData)
        .then(response => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success"
          });

          //启用登录或者注册按钮
          loginButtonStatus.value = false;
          //倒计时
          countDown(60);
        })
        .catch(error => {
          console.log(error);
        });
    };

    //倒计时
    const countDown = number => {
      //判断定时器是否存在 存在则清除
      if (timer.value) {
        clearInterval(timer.value);
      }

      let time = 5;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
          updateButtonStatus({
            status: false,
            text: "再次发送"
          });
        } else {
          codeButtonStatus.text = `倒计时${time}秒`;
        }
      }, 1000);
    };

    const clearCountDown = () => {
      //还原验证码状态

      updateButtonStatus({
        status: false,
        text: "获取验证码"
      });
      //清除倒计时
      clearInterval(timer.value);
    };

    //挂载完成后
    onMounted(() => {});

    return {
      menuTab,
      model,
      loginButtonStatus,
      codeButtonStatus,
      ruleForm,
      rules,

      toggleMenu,
      submitForm,
      getSms
    };
  }
};
</script>

<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-warp {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
}
.current {
  background-color: rgba(0, 0, 0, 0.1);
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
}
.item-form {
  margin-bottom: 13px;
}
.block {
  display: block;
  width: 100%;
}
.login-btn {
  margin-top: 19px;
}
</style>