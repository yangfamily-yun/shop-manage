<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" :closable="false"> </el-alert>
      <!-- 进度条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormruleForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeft"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="CuteList"
                :props="{ expandTrigger: 'hover', ...cascaderProps }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染参数的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="aa"
                  v-for="(aa, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染属性的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片上传到的后台api地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce">
            </quill-editor>
            <!-- 添加商品描述按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible">
      <img :src="previewUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  data() {
    return {
      // 进度条和taby页签的索引
      // 注意：tab页签传入的值是字符串，而进度条是number，需要在进度条中进行类型转换
      activeIndex: "0",
      // 添加分类表单的数据对象
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        //   级联选择框双向绑定的数组
        // 注意：发送添加分类的请求时，参数要求：以为','分割的分类列表，所以发送请求时注意处理
        goods_cat: [],
        pics: [{ pic: "/tmp_uploads/30f08d52c551ecb447277eae232304b8" }],
        goods_introduce: "",
        attrs: [],
      },
      // 添加分类表单的验证规则对象
      addFormrules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      //商品分类数据列表
      CuteList: [],

      // 级联选择器配置对象
      cascaderProps: {
        value: "cat_id", // 指定选中的值
        label: "cat_name", // 指定看到的值
        children: "children", // 指定父子嵌套的值
        // checkStrictly: "true",
      },
      // 商品动态参数
      manyTableData: [],
      // 商品静态属性
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",

      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片预览对话框的显示与隐藏
      previewVisible: false,
      // 图片预览路径
      previewUrl: "",
    };
  },
  created() {
    this.getCuteList();
  },
  computed: {
    // 当前选中的三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2];
      return null;
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
    //   监听级联选择框的变化
    async handleChange() {},
    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabLeft(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
      return true;
    },
    // tab 被选中时触发
    async tabClicked() {
      if (this.activeIndex === "1") {
        //   根据当前选中的id以及面板获取相应的参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("获取参数列表失败");
        res.data.forEach((item) => {
          // 解决添加参数，扩展列存在tag的问题
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        // console.log(res.data);
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        //   根据当前选中的id以及面板获取相应的参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );

        if (res.meta.status !== 200)
          return this.$message.error("获取参数列表失败");
        // res.data.forEach((item) => {
        //   // 解决添加参数，扩展列存在tag的问题
        //   item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // });
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 处理图片预览
    handlePreview(file) {
      // console.log(file);
      // 获取预览图片的路径
      this.previewUrl = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理图片移除的操作
    handleRemove(file) {
      // console.log(file);
      // 1、获取要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2、从pics数组中，找到这个图片的对应索引值
      const i = this.addForm.pics.findIndex((a) => {
        a.pic === filePath;
      });
      // 3、调用数组的splice方法，把图片信息对象，从pics数组移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm.pics);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response);
      // 1、拼接得到一个图片信息对象
      const pic = { pic: response.data.tmp_path };
      // 2、将图片信息对象push到pics数组中
      this.addForm.pics.push(pic);
      // console.log(this.addForm.pics);
    },
    // 添加商品按钮
    add() {
      this.$refs.addFormruleForm.validate(async (valid) => {
        if (!valid) return this.$message.error("请输入必要的表单项");
        // 执行添加的业务逻辑
        // 解决级联选择器的数据对象为数组，但是请求时要求类型为字符串的问题：深层拷贝
        // 1、JSON.parse(JSON.stringfly(this.addForm))
        //2、 lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");

        // 为符合请求的参数要求
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const many = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(many);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const only = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(only);
        });
        form.attrs = this.addForm.attrs;
        // console.log(form);
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post("goods", form);

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }

        this.$message.success(res.meta.msg);
        this.$router.push("/goods");
      });
    },
  },
};
</script>

<style lang="less" scoped>
img {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>