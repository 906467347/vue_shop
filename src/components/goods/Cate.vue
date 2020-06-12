<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template v-slot:isOk="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" size="mini" v-if="scope.row.cat_level ===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-if="scope.row.cat_level ===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑{{scope.row._isExpanded}}</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader
              expand-trigger="hover"
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
             visible-change
             ref="elcascaderRefs"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      catelist: [],
      total: 0,
      //   为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 自定义模板列
          type: "template",
          // 当前列使用的模板名
          template: "isOk"
        },
        {
          label: "排序",
          // 自定义模板列
          type: "template",
          // 当前列使用的模板名
          template: "order"
        },

        {
          label: "操作",
          // 自定义模板列
          type: "template",
          // 当前列使用的模板名
          template: "opt"
        }
      ],
      // 控制添加对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类的ID
        cat_pid: 0,
        // 分类的等级默认要添加的是一级分类
        cat_level: 0
      },
      // 添加规则
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur"
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children',
        checkStrictly: true,
        
      },
      // 选中的父级分类的id数组
      selectedKeys:[]
    }
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }

      //   数据列表赋值给catelist
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 pagenum的改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮,展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表 再展示出对话框
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      // console.log(res.data);
      this.parentCateList = res.data;
    },
    parentCateChanged() {
      this.$refs.elcascaderRefs.dropDownVisible = false
      // 如果 selectedKeys 数据中的 length 大于0，证明选中了父级分类
      // 反之说明没有选中任何父级分类
      if(this.selectedKeys.length > 0){
        this.addCateForm.cat_pid = this.selectedKeys
        [this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
        // 父级分类的id
        this.addCateForm.cat_pid = 0
      }

    },
    // 点击添加按钮添加新的分类
     addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.post('categories',this.addCateForm)

        if(res.meta.status !==201){
          this.$message.error('添加失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateFormcat_level = 0
    }
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>