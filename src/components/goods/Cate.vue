<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          ></el-col
        >
      </el-row>
      <!-- 表格区 -->
      <tree-table
        ref="table"
        :data="CuteList"
        :columns="columns"
        show-index
        index-text="#"
        stripe
        border
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
        class="treetop"
      >
        <!-- 是否有效列 -->
        <template slot="isdeleted" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
            >二级</el-tag
          >
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="action" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClose"
    >
      <span slot="footer" class="dialog-footer">
        <!-- 添加分类的表单 -->
        <el-form
          :model="AddCateForm"
          :rules="AddCateFormRules"
          ref="AddCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="AddCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择器
            options指定数据源
            props指定配置对象
             v-model将选中的值双向绑定到中，它是一个数组
             @change事件   选择项发生变化触发这个函数
             -->
            <el-cascader
              :options="parentCateList"
              :props="{
                expandTrigger: 'hover',
                ...cascaderProps, //连接对象
              }"
              @change="parentCateChange"
              v-model="seletedKeys"
              :clearable="true"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表，默认为空
      CuteList: [],
      //   查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //   总数据条数
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "isdeleted",
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用的模板名称
          template: "action",
        },
      ],
      // 添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类、
      AddCateForm: {
        // 添加的分类名称
        cat_name: "",
        // 不选父级分类，默认父级id以及分类层级为1
        // 父级id
        cat_pid: 0,
        // 分类层级
        cat_level: 0,
      },
      AddCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 商品分类父级数据列表
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        value: "cat_id", // 指定选中的值
        label: "cat_name", // 指定看到的值
        children: "children", // 指定父子嵌套的值
        checkStrictly: "true",
      },
      // 选中的父级分类的id数组
      seletedKeys: [],
    };
  },
  created() {
    this.getCuteList();
  },
  methods: {
    //   获取商品分类数据列表
    async getCuteList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类数据列表失败");
      // 把获取到的权限数据保存到rightsList中
      //   console.log(res.data);
      this.CuteList = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCuteList();
    },
    // 监听pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getCuteList();
    },
    // 监听添加分类按钮的触发
    showAddCateDialog() {
      // 先获取商品分类父级数据列表
      this.getParentCateList();
      // 在弹出对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类父级数据列表失败");
      // console.log(res);
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      if (this.seletedKeys.length > 0) {
        this.AddCateForm.cat_pid =
          this.seletedKeys[this.seletedKeys.length - 1];
        this.AddCateForm.cat_level = this.seletedKeys.length;
      } else {
        this.AddCateForm.cat_pid = 0;
        this.AddCateForm.cat_level = 0;
      }
    },
    // 点击确定按钮触发这个函数
    addCate() {
      this.$refs.AddCateFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error("添加分类失败");
        const { data: res } = await this.$http.post(
          "categories",
          this.AddCateForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.getCuteList();
        this.addCateDialogVisible = false;
      });
    },
    // 对话框关闭,重置表单数据
    addCateDialogClose() {
      this.$refs.AddCateFormRef.resetFields();
      this.seletedKeys = [];
      this.AddCateForm.cat_pid = 0;
      this.AddCateForm.cat_level = 0;
    },
  },
};
</script>

<style lang="less" scoped>
.treetop {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>