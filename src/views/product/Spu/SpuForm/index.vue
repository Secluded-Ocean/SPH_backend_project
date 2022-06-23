<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input type="textarea" rows="4" placeholder="描述" v-model="spu.description"></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- file-list：照片墙需要展示的数据（数组：数组里面的元素要有name和url属性） -->
        <!-- on-preview:图片预览 -->
        <!-- on-remove：删除图片时会触发 -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
          :on-success="handlerSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`还有${unSelectSaleAttr.length}未选择`"
          v-model="attrIdAndAttrName"
        >
          <el-option
            :label="unselect.name"
            :value="`${unselect.id}:${unselect.name}`"
            v-for="(unselect, index) in unSelectSaleAttr"
            :key="unselect.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrIdAndAttrName"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <!-- 展示的是当前SPU属于自己的销售属性 -->
        <el-table style="width: 100%" border :data="spu.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80px" align="center"> </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="width"> </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <!-- el-tag:用于展示已有属性值列表的数据 -->
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <!-- 下面的结构可以当做span和input的切换 -->
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="addSaleAttrValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      // spu属性初始化时是个空对象
      spu: {
        //三级分类的id
        category3Id: 0,
        //描述
        description: '',
        //spu名称
        spuName: '',
        //平台的id
        tmId: '',
        //收集SPU图片的信息
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        //平台属性与属性值收集
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ],
      },
      tradeMarkList: [], //存储品牌信息
      spuImageList: [], //存储SPU图片的数据
      saleAttrList: [], //销售属性的数据(全部的销售属性)
      attrIdAndAttrName: '', //收集未选择的销售属性id
    }
  },
  methods: {
    // 照片墙删除某个图片时触发
    handleRemove(file, fileList) {
      // file：删除的那张图片
      // fileList：删除后剩余的图片
      // 收集照片墙图片的数据,对于已有的图片（照片墙中显示的图片）需要name和url字段，因为照片墙显示数据需要这两个属性
      // 对于服务器来说不需要name和url字段，所以在提交数据给服务器时需要处理
      this.spuImageList = fileList
    },
    // 照片墙图片预览的回调
    handlePictureCardPreview(file) {
      // 将数据中图片的地址赋值给属性
      this.dialogImageUrl = file.url
      // 对话框显示
      this.dialogVisible = true
    },
    // 初始化spuForm数据
    async initSpuData(spu) {
      // 获取spu信息的数据
      let spuResult = await this.$API.spu.reqSpu(spu.id)
      if (spuResult.code == 200) {
        this.spu = spuResult.data
      }
      // 获取品牌信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList()
      if (tradeMarkResult.code == 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      // 获取图片信息
      let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id)
      if (spuImageResult.code == 200) {
        let lisArr = spuImageResult.data
        // 处理数据为照片墙要求的格式
        lisArr.forEach((item) => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        // 整理好的数据赋值给
        this.spuImageList = lisArr
      }
      // 获取平台全部销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data
      }
    },
    // 照片墙图片上传成功的回调
    handlerSuccess(response, file, fileList) {
      // 收集图片的信息
      this.spuImageList = fileList
    },
    // 添加新的销售属性
    addSaleAttr() {
      // 已经收集到了需要添加的销售属性的信息
      // 把收集到的销售属性的数据进行分隔
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndAttrName.split(':')
      // 向spu对象的spuSaleAttrList属性添加新的销售属性
      let newSaleAttr = { baseSaleAttrId, saleAttrName, spuSaleAttrValueList: [] }
      // 添加新的销售属性
      this.spu.spuSaleAttrList.push(newSaleAttr)
      // 清空数据
      this.attrIdAndAttrName = ''
    },
    // 添加新的销售属性的值（添加 按钮的回调）
    addSaleAttrValue(row) {
      // 点击销售属性值中的添加按钮时，需要由button变为input，通过当前销售属性的inputVisible进行控制
      // 挂载在销售属性身上的响应式数据inputVisible，控制着button与input的切换
      this.$set(row, 'inputVisible', true)
      // 通过响应式数据inputValue字段收集新增的销售属性值
      this.$set(row, 'inputValue', '')
    },
    // el-input失去焦点的事件
    handleInputConfirm(row) {
      // 解构出销售属性中收集的数据
      const { baseSaleAttrId, inputValue } = row
      // 新增的销售属性值不能为空
      if (inputValue.trim() == '') {
        this.$message('属性值不能为空')
        return
      }
      // 属性值不能重复
      let result = row.spuSaleAttrValueList.every((item) => item.saleAttrValueName != inputValue)
      if (!result) {
        this.$message('属性值不能重复')
        return
      }
      // 新增的销售属性值
      let newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue }
      // 新增
      row.spuSaleAttrValueList.push(newSaleAttrValue)
      // 修改inputVisible，隐藏输入框
      row.inputVisible = false
    },
    // “保存”按钮的回调
    async addOrUpdateSpu() {
      //整理参数:需要整理照片墙的数据
      // 携带参数：对于图片，需要携带imageName和imageUrl字段
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imageName: item.name,
          imageUrl: (item.response && item.response.data) || item.url,
        }
      })
      // 发请求
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu)
      if (result.code == 200) {
        this.$message({ type: 'success', message: '保存成功' })
        // 通知父组件回到场景0
        this.$emit('changeScene', { scene: 0, flag: this.spu.id ? '修改' : '添加' })
      }
      // 清除数据
      Object.assign(this._data, this.$options.data())
    },
    // 点击父组件的“添加SPU按钮”时发请求
    async addSpuData(category3Id) {
      // 添加SPU时搜集3级ID
      this.spu.category3Id = category3Id
      // 获取品牌信息
      let tradeMarkResult = await this.$API.spu.reqTradeMarkList()
      if (tradeMarkResult.code == 200) {
        this.tradeMarkList = tradeMarkResult.data
      }
      // 获取平台全部销售属性
      let saleResult = await this.$API.spu.reqBaseSaleAttrList()
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data
      }
    },
    cancel() {
      // 取消按钮的回调，通知父亲场景切换为0
      this.$emit('changeScene', { scene: 0, flag: '添加' })
      // 清理数据this.$options.data()得到配置对象的data数据，返回的响应式数据为空
      Object.assign(this._data, this.$options.data())
    },
  },
  computed: {
    // 计算出还未选择的销售属性
    unSelectSaleAttr() {
      // 整个平台的销售属性一共三个
      let result = this.saleAttrList.filter((item) => {
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name != item1.saleAttrName
        })
      })
      return result
    },
  },
}
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
