// 此模块用于获取品牌管理的数据
import request from '@/utils/request'

// 获取品牌列表接口
// URL:/admin/product/baseTrademark/{page}/{limit}
export const reqTradeMartList = (page, limit) =>
  request({
    url: `/admin/product/baseTrademark/${page}/${limit}`,
    method: 'get',
  })

// 处理添加品牌
// 新增品牌 POST /admin/product/baseTrademark/save 携带两个参数：品牌名称、品牌logo
// 切记：对于新增的品牌，给服务器传递数据不需要传递id，因为id由服务器生成

// 修改品牌
// PUT /admin/product/baseTrademark/update 携带三个参数：id/品牌名称/品牌logo
// 切记：对于修改某一品牌的操作，前端携带的参数需要带上id，你要告诉服务器修改的是哪个品牌

export const reqAddOrUpdateTradeMark = (tradeMark) => {
  // 带给服务器的数据携带id————修改
  if (tradeMark.id) {
    return request({ url: '/admin/product/baseTrademark/update', method: 'put', data: tradeMark })
  } else {
    // 新增品牌
    return request({ url: '/admin/product/baseTrademark/save', method: 'post', data: tradeMark })
  }
}

// 删除品牌
// DELETE /admin/product/baseTrademark/remove/{id} delete

export const reqDeleteTradeMark = (id) =>
  request({ url: `/admin/product/baseTrademark/remove/${id}`, method: 'delete' })
