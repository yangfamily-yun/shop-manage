<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-key"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //表单的双向数据绑定
      loginForm: {
        username: "admin",
        password: "123456",
      },
      //   表单的数据校验的规则
      loginFormRules: {
        //   注意：这里规则的命名要与loginForm的属性名相同
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    //   重置按钮
    reset() {
      this.$refs["loginFormRef"].resetFields();
    },
    // 登录按钮
    login() {
      this.$refs["loginFormRef"].validate(async (value) => {
        if (!value) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) return this.$message.error("用户不存在");
        this.$message.success("登录成功");
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage（存储会话期间的地址） 中
        //   1.1 项目中 除了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        // sessionStorage.setItem("token",res.data.token);
        window.sessionStorage.setItem("token", res.data.token);
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push("/home");
      });
    },
  },
};
</script>
<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
// 登录表单
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
// 登录图标
.avatar_box {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  position: absolute;
  padding: 10px;
  background-color: #fff;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    // img在div内，所以上面三个会影响盒子大小形状的，img也要写入
    background-color: #eee;
    box-shadow: 0 0 10px #ddd;
  }
}
// 登录表单
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 30px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>