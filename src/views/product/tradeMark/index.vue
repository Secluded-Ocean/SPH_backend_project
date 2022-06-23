<template>
  <div>
    <!-- 按钮 -->
    <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0" @click="showDialog"
      >添加</el-button
    >
    <!-- 表格组件 -->
    <!-- border:给表格添加边框 -->
    <!-- column：
          label：显示标题
          Width：对应列的宽度
          align: 标题对的对齐方式
          注意：element中table组件展示数据是以列的形式展示的
    -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column type="index" label="序号" width="80px" align="center"> </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width"> </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="品牌LOGO未上传" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row, $index }">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTradeMark(row)"
            >修改</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      style="margin-top: 20px; text-align: center"
      :total="total"
      :current-page="page"
      :page-size="limit"
      :page-sizes="[3, 5, 10]"
      layout=" prev, pager, next, jumper, ->, sizes, total"
      @current-change="getPageList"
      @size-change="handleSizeChange"
    ></el-pagination>
    <!-- 
      对话框 
      visible.sync：控制对话框的显示与隐藏
      Form组件提供了表单验证的功能，只需要通过rules属性传入约定的验证规则，并将Form-Item的prop属性设置为需要校验的字段名即可
    -->
    <el-dialog :title="this.tmForm.id ? '修改品牌' : '添加品牌'" :visible.sync="dialogFormVisible">
      <!-- form表单 model:把表单的数据收集到那个对象的身上，将来表单验证也需要这个属性-->
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 此处收集数据不能用v-model，因为不是表单元素
              action:设置图片上传的地址
              on-success:可以检测到图片上传成功，当图片上传成功，会执行一次
              before-upload:可以在上传图片之前执行一次
          -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'tradeMark',
  data() {
    return {
      // 代表分页器的页数
      page: 1,
      // 当前页数展示数据的条数
      limit: 3,
      // 总共数据的条数
      total: 0,
      // 列表展示的数据
      list: [],
      // 对话框显示与隐藏控制的属性
      dialogFormVisible: false,
      // 收集品牌信息:对象身上的属性不能瞎写，需要看文档
      tmForm: {
        tmName: '',
        logoUrl: '',
      },
      // 表单验证规则
      rules: {
        // 品牌名称的验证规则
        tmName: [
          // required:必须要校验的字段  message：提示信息   trigger：用户触发行为设置
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' },
        ],
        // 品牌LOGO的验证规则
        logoUrl: [{ required: true, message: '请选择品牌LOGO' }],
      },
    }
  },
  // 组件挂在完毕发请求
  mounted() {
    // 获取列表数据的方法
    this.getPageList()
  },
  methods: {
    async getPageList(pager = 1) {
      this.page = pager
      // 解构出参数
      const { page, limit } = this
      // 获取品牌列表的接口
      let result = await this.$API.trademark.reqTradeMartList(page, limit)
      if (result.code == 200) {
        // 分别是展示数据的总条数和列表展示的数据
        this.total = result.data.total
        this.list = result.data.records
      }
    },
    // 当分页器某一页需要展示数据的条数发生变化时会触发
    handleSizeChange(limit) {
      // 整理参数，再次发请求
      this.limit = limit
      this.getPageList()
    },
    // 点击添加品牌按钮
    showDialog() {
      this.dialogFormVisible = true
      // 清除数据
      this.tmForm = { tmName: '', logoUrl: '' }
    },
    // 修改某个品牌
    updateTradeMark(row) {
      // row:当前用户选中的品牌的信息
      this.dialogFormVisible = true
      // 将已有的品牌信息赋值给tmForm进行展示
      // 将服务器返回的品牌的信息直接赋值给tmForm
      this.tmForm = { ...row }
    },
    // 上传图片相关的回调
    // 图片上传成功
    // 收集品牌图片数据
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data
    },
    // 图片上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 添加品牌或修改品牌
    addOrUpdateTradeMark() {
      // 当全部验证字段通过，再书写业务逻辑
      this.$refs.ruleForm.validate(async (success) => {
        // 如果全部字段符合条件
        if (success) {
          this.dialogFormVisible = false
          // 发请求（添加品牌|修改品牌）
          let result = await this.$API.trademark.reqAddOrUpdateTradeMark(this.tmForm)
          if (result.code == 200) {
            // 弹出信息:添加品牌成功/修改品牌成功
            this.$message({
              type: 'success',
              message: this.tmForm.id ? '修改品牌成功' : '添加品牌成功',
            })
            // 添加或修改品牌成功后需要再次获取品牌列表进行展示
            // 如果添加品牌，则停留在第一页，如果修改品牌则停留在当前页
            this.getPageList(this.tmForm.id ? this.page : 1)
          }
        } else {
          console.log('提交出错！')
          return false
        }
      })
    },
    // 删除品牌的操作
    deleteTradeMark(row) {
      // 弹框
      this.$confirm(`确定删除${row.tmName}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          // 当用户点击确定按钮时触发
          // 向服务器发请求
          let result = await this.$API.trademark.reqDeleteTradeMark(row.id)
          if (result.code == 200) {
            this.$message({
              type: 'success',
              message: '删除成功!',
            })
            // 再次获取品牌列表数据
            this.getPageList(this.list.length > 1 ? this.page : this.page - 1)
          }
        })
        .catch(() => {
          // 当用户点击取消按钮时触发
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
