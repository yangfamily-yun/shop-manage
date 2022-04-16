<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <div>
            <el-input
              placeholder="请输入内容"
              clearable
              @clear="clearText"
              v-model="queryInfo.query"
              @keyup.enter.native="search"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="search"
              ></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4" class="addCateClass">
          <el-button type="primary" @click="goAddPage"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <el-table :data="GoodsList" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px">
        </el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template v-slot="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <div>
              <!-- 修改按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
              ></el-button>
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deletedCate(scope.row)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      //   商品列表总数
      total: 0,
      //   商品列表
      GoodsList: [],
      //   搜索关键词
      searchData: "",
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    //   获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      //   console.log(res);
      this.GoodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    //   监听页码的改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage;
      this.getGoodsList();
    },
    // 监听搜索的输入框清空事件
    clearText() {
      this.searchData = "";
      this.getGoodsList();
    },
    // 监听搜索按钮的点击事件
    async search() {
      this.getGoodsList();
    },
    // 监听删除按钮的点击事件
    async deletedCate(row) {
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
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`);
      if (res.meta.status !== 200) return this.$message.error("删除失败");
      this.$message.success(res.meta.msg);
      this.getGoodsList();
    },
    // 监听添加商品按钮的点击事件
    goAddPage() {
      this.$router.push(`/home/add`);
    },
  },
};
</script>

<style lang="less" scoped>
.addCateClass {
  margin-left: 20px;
}
</style>