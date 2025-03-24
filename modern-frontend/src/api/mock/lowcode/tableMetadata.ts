/**
 * 低代码平台表元数据模拟数据
 */

import type { TableMetadata } from '../../../types/lowcode'

export const tableMetadata: Record<string, TableMetadata> = {
  // 销售订单表
  orders: {
    name: 'orders',
    displayName: '销售订单表',
    description: '记录所有销售订单信息',
    fields: [
      {
        name: 'order_id',
        displayName: '订单号',
        dataType: 'VARCHAR',
        length: 20,
        isPrimaryKey: true,
        isNullable: false,
        description: '订单唯一标识符'
      },
      {
        name: 'customer_id',
        displayName: '客户ID',
        dataType: 'INTEGER',
        isNullable: false,
        description: '客户唯一标识符，关联客户表'
      },
      {
        name: 'customer_name',
        displayName: '客户名称',
        dataType: 'VARCHAR',
        length: 100,
        isNullable: false,
        description: '客户名称'
      },
      {
        name: 'order_date',
        displayName: '下单日期',
        dataType: 'datetime',
        isNullable: false,
        description: '订单创建时间'
      },
      {
        name: 'total_amount',
        displayName: '订单总额',
        dataType: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
        description: '订单总金额'
      },
      {
        name: 'status',
        displayName: '订单状态',
        dataType: 'VARCHAR',
        length: 20,
        isNullable: false,
        description: '订单当前状态'
      },
      {
        name: 'payment_method',
        displayName: '支付方式',
        dataType: 'VARCHAR',
        length: 30,
        isNullable: true,
        description: '订单支付方式'
      },
      {
        name: 'shipping_address',
        displayName: '收货地址',
        dataType: 'VARCHAR',
        length: 255,
        isNullable: true,
        description: '订单收货地址'
      },
      {
        name: 'created_at',
        displayName: '创建时间',
        dataType: 'TIMESTAMP',
        isNullable: false,
        description: '记录创建时间'
      },
      {
        name: 'updated_at',
        displayName: '更新时间',
        dataType: 'TIMESTAMP',
        isNullable: false,
        description: '记录最后更新时间'
      }
    ]
  },
  
  // 库存表
  inventory: {
    name: 'inventory',
    displayName: '库存表',
    description: '记录产品库存信息',
    fields: [
      {
        name: 'id',
        displayName: '库存ID',
        dataType: 'bigint',
        length: 20,
        isPrimaryKey: true,
        isNullable: false,
        description: '库存记录唯一标识'
      },
      {
        name: 'product_id',
        displayName: '商品ID',
        dataType: 'bigint',
        length: 20,
        isNullable: false,
        description: '关联商品表的ID'
      },
      {
        name: 'product_name',
        displayName: '产品名称',
        dataType: 'VARCHAR',
        length: 100,
        isNullable: false,
        description: '产品名称'
      },
      {
        name: 'category',
        displayName: '产品类别',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '产品分类'
      },
      {
        name: 'quantity',
        displayName: '库存数量',
        dataType: 'int',
        isNullable: false,
        description: '当前库存数量'
      },
      {
        name: 'warehouse',
        displayName: '仓库位置',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '仓库位置'
      },
      {
        name: 'unit_price',
        displayName: '单价',
        dataType: 'DECIMAL',
        precision: 10,
        scale: 2,
        isNullable: false,
        description: '产品单价'
      },
      {
        name: 'last_updated',
        displayName: '最后更新时间',
        dataType: 'datetime',
        isNullable: false,
        description: '库存最后更新时间'
      }
    ]
  },
  
  // 员工信息表
  employees: {
    name: 'employees',
    displayName: '员工信息表',
    description: '记录公司员工基本信息',
    fields: [
      {
        name: 'employee_id',
        displayName: '员工编号',
        dataType: 'INTEGER',
        isPrimaryKey: true,
        isAutoIncrement: true,
        isNullable: false,
        description: '员工唯一标识符'
      },
      {
        name: 'employee_name',
        displayName: '员工姓名',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: false,
        description: '员工姓名'
      },
      {
        name: 'department',
        displayName: '所属部门',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: false,
        description: '员工所属部门'
      },
      {
        name: 'position',
        displayName: '职位',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: false,
        description: '员工职位'
      },
      {
        name: 'hire_date',
        displayName: '入职日期',
        dataType: 'DATE',
        isNullable: false,
        description: '员工入职日期'
      },
      {
        name: 'salary',
        displayName: '薪资',
        dataType: 'DECIMAL',
        precision: 10,
        scale: 2,
        isNullable: false,
        description: '员工薪资'
      },
      {
        name: 'employment_status',
        displayName: '在职状态',
        dataType: 'VARCHAR',
        length: 20,
        isNullable: false,
        description: '员工在职状态'
      },
      {
        name: 'email',
        displayName: '邮箱',
        dataType: 'VARCHAR',
        length: 100,
        isNullable: true,
        description: '员工电子邮箱'
      },
      {
        name: 'phone',
        displayName: '电话',
        dataType: 'VARCHAR',
        length: 20,
        isNullable: true,
        description: '员工联系电话'
      },
      {
        name: 'address',
        displayName: '地址',
        dataType: 'VARCHAR',
        length: 255,
        isNullable: true,
        description: '员工住址'
      }
    ]
  },
  
  // 客户表
  customers: {
    name: 'customers',
    displayName: '客户信息表',
    description: '记录所有客户基本信息',
    fields: [
      {
        name: 'customer_id',
        displayName: '客户ID',
        dataType: 'INTEGER',
        isPrimaryKey: true,
        isAutoIncrement: true,
        isNullable: false,
        description: '客户唯一标识符'
      },
      {
        name: 'customer_name',
        displayName: '客户名称',
        dataType: 'VARCHAR',
        length: 100,
        isNullable: false,
        description: '客户名称'
      },
      {
        name: 'contact_name',
        displayName: '联系人',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '客户联系人姓名'
      },
      {
        name: 'contact_title',
        displayName: '联系人职位',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '客户联系人职位'
      },
      {
        name: 'phone',
        displayName: '联系电话',
        dataType: 'VARCHAR',
        length: 20,
        isNullable: true,
        description: '客户联系电话'
      },
      {
        name: 'email',
        displayName: '电子邮箱',
        dataType: 'VARCHAR',
        length: 100,
        isNullable: true,
        description: '客户电子邮箱'
      },
      {
        name: 'address',
        displayName: '地址',
        dataType: 'VARCHAR',
        length: 255,
        isNullable: true,
        description: '客户地址'
      },
      {
        name: 'city',
        displayName: '城市',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '客户所在城市'
      },
      {
        name: 'region',
        displayName: '地区',
        dataType: 'VARCHAR',
        length: 50,
        isNullable: true,
        description: '客户所在地区'
      },
      {
        name: 'customer_type',
        displayName: '客户类型',
        dataType: 'VARCHAR',
        length: 20,
        isNullable: true,
        description: '客户类型'
      },
      {
        name: 'created_at',
        displayName: '创建时间',
        dataType: 'TIMESTAMP',
        isNullable: false,
        description: '记录创建时间'
      }
    ]
  }
}