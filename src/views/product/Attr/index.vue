<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect @getCategoryId="getCategoryId" :show="!isShowTable"></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
          style="margin-bottom: 18px"
          >添加属性</el-button
        >
        <!-- 表格：展示平台属性 -->
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column type="index" label="序号" width="80" align="center"> </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"> </el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <!-- row:数组中的每个元素（相应的平台的属性） -->
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0px 20px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性/修改属性 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrInfo.attrName"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button>取消</el-button>
        <el-table style="width: 100%; margin: 20px 0px" border :data="attrInfo.attrValueList">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <!-- 此处结构需要使用span和input来回切换 -->
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                v-if="row.flag"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
                :ref="$index"
              ></el-input>
              <span v-else @click="toEdit(row, $index)" style="display: block">{{
                row.valueName
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <!-- 气泡确认框 -->
              <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm="deleteAttrValue">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="addOrUpdateAttr"
          :disabled="attrInfo.attrValueList.length < 1"
          >保存</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash中的深拷贝
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Attr',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      // 接受平台属性的字段
      attrList: [],
      // 这个属性控制table表格的显示与隐藏
      isShowTable: true,
      // 收集新增属性/修改属性
      attrInfo: {
        attrName: '', //属性名
        attrValueList: [
          //属性值，可以有多个，每个属性值都是一个对象，需要attrId和valueName
        ],
        categoryId: 0, //三级分类的id
        categoryLevel: 3, //服务器也要区分是几级id
      },
      flag: true,
    }
  },
  methods: {
    // 自定义事件的回调
    getCategoryId({ categoryId, level }) {
      // 区分三级分类相应的id以及父组件进行存储
      if (level == 1) {
        this.category1Id = categoryId
        this.category2Id = ''
        this.category3Id = ''
      } else if (level == 2) {
        this.category2Id = categoryId
        this.category3Id = ''
      } else {
        // 代表三级分类的id有了
        this.category3Id = categoryId
        // 发请求获取品牌属性
        this.getAttrList()
      }
    },
    // 发请求获取平台属性的数据
    // 当用户确定三级分类数据时，可以向服务器发请求获取平台属性进行展示
    async getAttrList() {
      // 获取分类的ID
      const { category1Id, category2Id, category3Id } = this
      let result = await this.$API.attr.reqAttrList(category1Id, category2Id, category3Id)
      if (result.code == 200) {
        this.attrList = result.data
      }
    },
    // 添加属性值的回调
    addAttrValue() {
      // 向属性值的数组里面添加元素
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //新增属性值时，需要把已有的属性值id带上
        valueName: '', //相应的属性值的名称
        // flag属性：用于切换每一个属性的查看模式和编辑模式
        // 当前flag属性：相应式数据（数据变化跟着视图变化）
        flag: true,
      })
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus()
      })
    },
    // 添加属性按钮的回调
    addAttr() {
      // 切换table的显示与隐藏
      this.isShowTable = false
      // 清除数据
      // 收集三级分类的id
      this.attrInfo = {
        attrName: '', //属性名
        attrValueList: [
          //属性值，可以有多个，每个属性值都是一个对象，需要attrId和valueName
        ],
        categoryId: this.category3Id, //三级分类的id
        categoryLevel: 3, //服务器也要区分是几级id
      }
    },
    // 修改某一个属性
    updateAttr(row) {
      this.isShowTable = false
      // 将选中的属性赋值给attrInfo
      // 由于对象和数组连环重复嵌套，所以需要使用深拷贝解决这类问题
      this.attrInfo = cloneDeep(row)
      // 在修改某个属性时，将相应属性值元素添加上flag标记用于切换修改模式和浏览模式
      this.attrInfo.attrValueList.forEach((item) => {
        // 以下书写也可以s给属性值添加flag，但是视图不会变化，因为flag不是响应式数据，vue无法探测普通的新增属性
        // item.flag = false
        // 要用$.set添加相应式属性，第一个参数是对象，第二个参数是添加的新的响应式属性，第三个参数是相应属性的属性值
        this.$set(item, 'flag', false)
      })
    },
    // 失去焦点的事件，切换为查看模式，展示span
    toLook(row) {
      if (row.valueName.trim() == '') {
        this.$message('请输入属性值')
        return
      }
      // 新增的属性石不能与已有属性值重复
      let isRepat = this.attrInfo.attrValueList.some((item) => {
        // 将row从数组里判断时去除
        // row:新增的属性值
        // 判断时要把已有的数组中新增的属性去掉
        if (row !== item) {
          return row.valueName == item.valueName
        }
      })
      if (isRepat) return
      row.flag = false
    },
    // 点击span的回调，变为编辑模式
    toEdit(row, index) {
      row.flag = true
      // 获取input节点，实现自动聚焦
      // 注意：点击span时切换为编辑模式，但是对于浏览器来说，页面重绘和重排是耗时间的
      // 因此不能一点击就立刻获取到inpput
      // 用$nextTick()实现节点渲染完毕后执行
      this.$nextTick(() => {
        this.$refs[index].focus()
      })
    },
    // 气泡确认框确定按钮的回调
    deleteAttrValue(index) {
      this.attrInfo.attrValueList.splice(index, 1)
    },
    // 保存按钮，进行添加或修改属性的操作
    async addOrUpdateAttr() {
      // 整理参数:1.如果用户添加了很多属性值且属性值为空，则不应该提交给服务器
      // 提交给服务器的数据中不应该包含flag字段
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter((item) => {
        // 过滤掉属性值不为空的
        if (item.valueName != '') {
          // 删除掉flag属性
          delete item.flag
          return true
        }
      })
      // 发请求
      try {
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo)
        // 展示所有平台属性
        this.isShowTable = true
        // 提示消息
        this.$message({ type: 'success', message: '保存成功' })
        // 保存成功后需要再次获取平台属性进行展示
        this.getAttrList()
      } catch (error) {
        this.$message('保存失败')
      }
    },
  },
}
</script>

<style></style>
