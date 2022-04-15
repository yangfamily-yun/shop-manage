<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader
            v-model="seletedKeys"
            :options="CuteList"
            :props="{ expandTrigger: 'hover', ...cascaderProps }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many" :disabled="tabsDiabled">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="mini" @click="addDialog"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <div>
                  <!-- 循环渲染tag标签 -->
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClose(scope.row, i)"
                  >
                    {{ item }}
                  </el-tag>
                  <!-- 按钮与输入框的切换 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <div>
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                    >编辑</el-button
                  >
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="deletedParams(scope.row.attr_id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only" :disabled="tabsDiabled">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="mini" @click="addDialog"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 扩展列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <div>
                  <!-- 循环渲染tag标签 -->
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClose(scope.row, i)"
                  >
                    {{ item }}
                  </el-tag>
                  <!-- 按钮与输入框的切换 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </div>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <div>
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                    >编辑</el-button
                  >
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    @click="deletedParams(scope.row.attr_id)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="addVialogVisible"
      width="30%"
      @close="addVialogClose"
    >
      <el-form
        :model="addRuleForm"
        :rules="addRuleFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addVialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改' + textTitle"
      :visible.sync="editVialogVisible"
      width="30%"
      @close="editVialogClose"
    >
      <el-form
        :model="editRuleForm"
        :rules="editRuleFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      CuteList: [],
      //   级联选择框双向绑定的数组
      seletedKeys: [],
      // 级联选择器配置对象
      cascaderProps: {
        value: "cat_id", // 指定选中的值
        label: "cat_name", // 指定看到的值
        children: "children", // 指定父子嵌套的值
        // checkStrictly: "true",
      },
      //   被激活的页签名称
      activeName: "many",
      //   获取的参数列表
      manyTableData: [],
      onlyTableData: [],
      // 添加参数对话框的关闭与显示
      addVialogVisible: false,
      // 添加表单的数据对象
      addRuleForm: {
        attr_name: "",
      },
      // 修改表单的验证规则对象
      addRuleFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改对话框的显示与隐藏
      editVialogVisible: false,
      // 修改表单的数据对象
      editRuleForm: {},
      // 修改表单的验证规则对象
      editRuleFormRules: {},
    };
  },
  created() {
    this.getCuteList();
  },
  computed: {
    //   决定tab页签是否可用
    tabsDiabled() {
      // 如果级联选择器没有选择，那么页签禁用
      if (this.seletedKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.seletedKeys.length === 3)
        return this.seletedKeys[this.seletedKeys.length - 1];
      return null;
    },
    // 添加参数对话框的标题
    textTitle() {
      if (this.activeName === "many") return "动态参数";
      return "静态属性";
    },
  },
  methods: {
    //   获取商品分类数据列表
    async getCuteList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类数据列表失败");
      // 把获取到的权限数据保存到rightsList中
      //   console.log(res.data);
      this.CuteList = res.data;
    },
    // 监听tab页签的变化
    handleTabClick() {
      // console.log(this.activeName);
      this.handleChange();
    },
    //   监听级联选择框的变化
    async handleChange() {
      //   根据当前选中的id以及面板获取相应的参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("获取参数列表失败");
      console.log(res.data);
      res.data.forEach((item) => {
        // 解决添加参数，扩展列存在tag的问题
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 解决输入框同步的问题
        // 控制文本框的显示与隐藏
        item.inputVisible = false;
        // 文本框中输入的值
        item.inputValue = "";
      });
      // 区别参数列表，分别保存
      if (this.activeName === "many") this.manyTableData = res.data;
      this.onlyTableData = res.data;
    },
    // 点击添加按钮弹出对话框
    addDialog() {
      this.addVialogVisible = true;
    },
    // 监听对话框的关闭事件，重置表单
    addVialogClose() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 点击确定按钮添加参数
    addParams() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("添加参数失败");
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addRuleForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) return this.$message.error("添加参数失败");
        this.$message.success("添加参数成功");
        // 添加属性成功后，立马刷新tab页签内的表格数据
        this.handleChange();
        this.addVialogVisible = false;
      });
    },
    // 点击修改按钮弹出对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories//${this.cateId}/attributes/${id}`,
        { params: { attr_sel: this.activeName } }
      );
      if (res.meta.status !== 200) return this.$message.error("获取参数失败");
      this.editRuleForm = res.data;
      this.editVialogVisible = true;
    },
    // 监听修改对话框关闭
    editVialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击确定，修改参数，刷新表格，关闭对话框
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("修改参数失败");
        const { data: res } = await this.$http.put(
          `categories//${this.cateId}/attributes/${this.editRuleForm.attr_id}`,
          {
            attr_name: this.editRuleForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) return this.$message.error("修改参数失败");
        this.$message.success(res.meta.msg);
        // 修改属性成功后，立马刷新tab页签内的表格数据
        this.handleChange();
        this.editVialogVisible = false;
      });
    },
    // 点击删除按钮，根据id删除参数
    async deletedParams(id) {
      const result = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result !== "confirm") {
        return this.$message.error("删除参数失败");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) return this.$message.error("删除参数失败");
      this.$message.success(res.meta.msg);
      // 删除属性成功后，立马刷新tab页签内的表格数据
      this.handleChange();
    },
    // 点击切换为input输入框
    showInput(row) {
      row.inputVisible = true;
      // $nextTick:页面上的元素重新渲染后，才会执行回调函数的代码
      this.$nextTick((_) => {
        // 让输入框自动获取焦点
        // 第一个ref拿到el-input，第二个ref从el-input身上拿到原生DOM节点
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 文本框失去焦点或按下enter都会触发，为参数添加tag
    async handleInputConfirm(row) {
      // 判断输入框的内容是否有效，而不是空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 如果没有return则做其他的处理
      // 将输入内容添加
      row.attr_vals.push(row.inputValue.trim());
      // 重置，为这一行下一次添加准备
      row.inputValue = "";
      row.inputVisible = false;
      // 需要发送请求保存这一次操作
      saveAttr_vals(row);
    },
    // 将对attr_vals的操作保存到数据库
    async saveAttr_vals(row) {
      // 需要发送请求保存这一次操作
      const { data: res } = await this.$http.put(
        `categories//${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200)
        return this.$message.error("添加参数的属性值失败");
      this.$message.success(res.meta.msg);
      this.handleChange();
    },
    // 删除参数的属性值
    async handleClose(row, i) {
      row.attr_vals.splice(i, 1);
      // 需要发送请求保存这一次操作
      saveAttr_vals(row);
    },
  },
};
</script>

<style scoped>
.input-new-tag {
  width: 100px;
}
</style>