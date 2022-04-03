<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <div>
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUserList"
              ></el-button>
            </el-input></div
        ></el-col>
        <el-col :span="4"
          ><el-button type="primary" round @click="addUserForm">
            添加用户</el-button
          ></el-col
        >
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="mobile"
          label="电话"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="180"
        ></el-table-column>
        <!-- 当prop的值为布尔值时，页面不会显示 -->
        <el-table-column prop="mg_state" label="状态" width="180">
          <!-- 作用域插槽/具名插槽：会覆盖上面prop的内容 ，通过它获取这一行的数据-->
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="修改角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addFormClose"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleForm"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 控制用户对话框的显示与隐藏 -->
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示、修改用户信息对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="currentUserForm"
        :rules="addFormRules"
        ref="editRuleForm"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="currentUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 控制用户对话框的显示与隐藏 -->
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //   验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    //   验证手机规则
    var checkMobile = (rule, value, callback) => {
      const regEmail = /^1[3456789]\d{9}$/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前的页面下显示多少条数据
        pagesize: 2,
      },
      //   用户列表
      userlist: [],
      total: 0,
      //   添加用户对话框
      addDialogVisible: false,
      //   修改用户信息对话框
      editDialogVisible: false,
      //查询到的用户对象
      currentUserForm: {},
      addForm: {
        username: "",
        password: "",
        email: "fesf342@qq.com",
        mobile: "19049211846",
      },
      addFormRules: {
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
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    //得到用户数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    // 监听pagesize改变的事件
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize;
      this.getUserList();
      console.log(newsize);
    },
    // 监听页码改变的事件
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getUserList();
    },
    // 监听switch按钮开关的状态改变
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        //修改失败，用户状态不变
        userinfo.mg_state != userinfo.mg_state;
        return this.$message.error("状态修改失败");
      }
      this.$message.success("状态修改成功");
    },
    // 显示添加用户对话框
    addUserForm() {
      this.addDialogVisible = true;
    },
    // 监听添加用户对话框的关闭事件
    addFormClose() {
      this.$refs.addRuleForm.resetFields();
    },
    //将用户添加到数据库
    addUser() {
      //验证表单合法性
      this.$refs.addRuleForm.validate(async (value) => {
        if (!value) return this.$message.error("添加用户失败");
        const { data: res } = await this.$http.post("/users", this.addForm);
        //验证请求是否成功
        if (res.meta.status !== 201) {
          return this.$message.success(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        // 隐藏添加用户对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserList();
      });
    },
    // 对话框展示当前用户信息
    async editUser(id) {
      this.id = id;
      // 弹出编辑当前用户信息对话框
      this.editDialogVisible = true;
      console.log(id);
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.currentUserForm = res.data;
      //   console.log(this.currentUserForm);
    },
    // 监听展示、修改用户信息对话框关闭事件
    editDialogClose() {
      this.$refs.editRuleForm.resetFields();
    },
    // 修改用户信息并提交到数据库
    editUserInfo() {
      //验证表单合法性
      this.$refs.editRuleForm.validate(async (value) => {
        if (!value) return this.$message.error("修改用户失败");
        const { data: res } = await this.$http.put(
          "users/" + this.currentUserForm.id,
          {
            email: this.currentUserForm.email,
            mobile: this.currentUserForm.mobile,
          }
        );
        //验证请求是否成功
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        // 提示更新成功
        this.$message.success(res.meta.msg);
        // 刷新用户列表
        this.getUserList();
        // 关闭对话框
        this.editDialogVisible = false;
      });
    },
    // 根据id删除用户
    async removeUserById(id) {
      // 弹窗询问用户是否删除数据
      const data = await this.$confirm(
        "此操作将永久删除该拥护, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //点击确定，返回字符串，confirm
      // 点击取消，返回字符串，cancel
      console.log(data);
      if (data !== "confirm") {
        return this.$message.info("取消删除该用户");
      }
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success(res.meta.msg);
      this.getUserList();
    },
  },
};
</script>
<style lang="less" scoped>
</style>