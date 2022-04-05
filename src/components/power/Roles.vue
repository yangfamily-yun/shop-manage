<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="add">添加角色</el-button></el-col
        >
      </el-row>
      <!-- 角色列表区域 -->
      <el-table border stripe :data="rolesList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item, i1) in scope.row.children"
              :key="item.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRoleById(scope.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="['vcenter', i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRoleById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRoleById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 控制用户对话框的显示与隐藏 -->
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialog"
      width="50%"
      @close="setRightDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取角色列表
      rolesList: [],
      //   添加角色对话框的显示与隐藏
      addDialogVisible: false,
      //   是否展示分配角色对话框
      setRightDialog: false,
      //   添加角色时的信息
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      //   添加角色时的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      //   所有权限数据
      rightsList: [],

      //   树形控件的属性绑定对象
      treeProps: {
        // 通过那个属性实现父子嵌套
        children: "children",
        //   页面显示的文本是数据源的哪一个字
        label: "authName",
      },
      //   默认选中节点的id数组
      defKeys: [],
      roleId: "",
    };
  },

  created() {
    //   页面加载时得到角色列表
    this.getRolesList();
  },
  methods: {
    // 得到角色列表信息
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
    },
    // 弹出添加角色的提示框
    add() {
      this.addDialogVisible = true;
    },
    //将角色添加到数据库
    addRole() {
      //验证表单合法性
      this.$refs.addRuleForm.validate(async (value) => {
        if (!value) return this.$message.error("添加用户失败");
        const { data: res } = await this.$http.post("/roles", this.addForm);
        //验证请求是否成功
        if (res.meta.status !== 201) {
          return this.$message.success("添加角色失败");
        }
        this.$message.success(res.meta.msg);
        // 隐藏添加用户对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
        this.$refs.addRuleForm.resetFields();
      });
    },
    //监听弹窗的关闭事件
    addFormClose() {
      this.addDialogVisible = false;
      this.$refs.addRuleForm.resetFields();
    },
    //删除角色指定权限
    async removeRoleById(role, right) {
      const a = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (a !== "confirm") return this.$message.info("取消删除该角色指定权限");
      //  返回的data, 是当前角色下最新的权限数据
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${right}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success(res.meta.msg);
      //   this.getRolesList();会重新获取整个列表，列表会重新渲染
      //  因为返回的data, 是当前角色下最新的权限数据 为防止删除权限后，扩展区域合起来
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showSetRightDialog(node) {
      //获得当前角色的id，为分配权限
      this.roleId = node.id;
      // 获取所有权限的数据,tree 树状显示权限,
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限数据失败");
      // 把获取到的权限数据保存到rightsList中
      this.rightsList = res.data;
      console.log(this.rightsList);
      this.$message.success(res.meta.msg);
      this.getLeafKeys(node, this.defKeys);
      this.setRightDialog = true;
    },
    // 通过递归的方式，获取角色下所有的三级权限id，并保存在defKeys中
    getLeafKeys(node, arr) {
      // 如果当前节点下没children属性，则是三级节点，直接取出id
      // 如果当前节点下有children属性，则递归，一直到没有children为止
      if (!node.children) return arr.push(node.id);
      //判断node.children下的节点是不是三级节点
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    //监听分配角色对话框关闭事件
    setRightDialogClose() {
      this.defKeys = [];
    },
    // 点击确定按钮，为角色分配权限
    async allotRight() {
      // 得到半勾选，或者勾选的权限
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // 格式化成传入参数需要的格式
      const keysId = keys.join(",");
      // console.log(keys);
      const { data: res } = await this.$http.post(
        // 在点击分配权限按钮时，同时获得roleid以供使用
        `roles/${this.roleId}/rights`,
        { rids: keysId }
      );
      if (res.meta.status !== 200) return this.$message.error("更新失败");
      this.$message.success(res.meta.msg);
      this.getRolesList();
      this.setRightDialog = false;
    },
  },
};
</script>

<style>
</style>