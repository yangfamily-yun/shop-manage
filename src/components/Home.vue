<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="quit">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 菜单的折叠与展开 -->
        <div class="toggleButton" @click="toggele">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activepath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <!-- 一级菜单名称 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + second.path"
              v-for="second in item.children"
              :key="second.id"
              @click="saveSubState('/' + second.path)"
            >
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-s-operation"></i>
                <!-- 二级菜单名称 -->
                <span>{{ second.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容区 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
    <!-- 主体区域 -->
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      activepath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activepath = window.sessionStorage.getItem("activepath");
  },
  methods: {
    quit() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      console.log(res);
    },
    // 点击按钮，菜单的折叠与展开
    toggele() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveSubState(activepath) {
      //如果不经过session 刷新就全收缩了
      window.sessionStorage.setItem("activepath", activepath);
      this.activepath = activepath;
    },
  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #373d41;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
//一级菜单图标与文字的间隔
.iconfont {
  margin-right: 10px;
}
.el-menu {
  border-right: none;
}
.toggleButton {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2rem;
  color: #fff;
  cursor: pointer;
}
</style>