/**
 * 低代码查询设计器模拟数据
 */
import { QueryDesign } from '../../../types/lowcode'

export const queryDesigns: QueryDesign[] = [
  {
    id: '1',
    name: '销售订单查询',
    description: '用于查询所有销售订单记录，支持按客户、日期、金额等条件筛选',
    dataSourceId: '1',
    tableName: 'orders',
    conditions: [
      {
        id: '1',
        field: 'customer_name',
        label: '客户名称',
        component: 'Input',
        operator: 'contains',
        required: false,
        defaultValue: '',
        order: 1,
        props: {
          placeholder: '请输入客户名称',
          clearable: true
        },
        validation: []
      },
      {
        id: '2',
        field: 'order_date',
        label: '订单日期',
        component: 'DateRangePicker',
        operator: 'between',
        required: false,
        defaultValue: '',
        order: 2,
        props: {
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          valueFormat: 'YYYY-MM-DD'
        },
        validation: []
      },
      {
        id: '3',
        field: 'total_amount',
        label: '订单金额',
        component: 'InputNumber',
        operator: 'greaterThan',
        required: false,
        defaultValue: 0,
        order: 3,
        props: {
          min: 0,
          precision: 2,
          step: 100,
          controlsPosition: 'right'
        },
        validation: [
          {
            type: 'number',
            message: '请输入有效的金额',
            trigger: 'blur'
          }
        ]
      },
      {
        id: '4',
        field: 'status',
        label: '订单状态',
        component: 'Select',
        operator: 'equals',
        required: false,
        defaultValue: '',
        order: 4,
        props: {
          placeholder: '请选择订单状态',
          clearable: true,
          options: [
            { label: '待付款', value: 'pending' },
            { label: '已付款', value: 'paid' },
            { label: '已发货', value: 'shipped' },
            { label: '已完成', value: 'completed' },
            { label: '已取消', value: 'canceled' }
          ]
        },
        validation: []
      }
    ],
    resultColumns: [
      {
        id: '1',
        field: 'order_id',
        label: '订单号',
        show: true,
        sortable: true,
        width: '120',
        fixed: 'left',
        order: 1
      },
      {
        id: '2',
        field: 'customer_name',
        label: '客户名称',
        show: true,
        sortable: true,
        width: '150',
        order: 2
      },
      {
        id: '3',
        field: 'order_date',
        label: '订单日期',
        show: true,
        sortable: true,
        width: '120',
        order: 3
      },
      {
        id: '4',
        field: 'total_amount',
        label: '订单金额',
        show: true,
        sortable: true,
        width: '120',
        order: 4
      },
      {
        id: '5',
        field: 'status',
        label: '订单状态',
        show: true,
        sortable: true,
        width: '100',
        order: 5
      },
      {
        id: '6',
        field: 'payment_method',
        label: '支付方式',
        show: true,
        sortable: false,
        width: '120',
        order: 6
      },
      {
        id: '7',
        field: 'shipping_address',
        label: '收货地址',
        show: true,
        sortable: false,
        width: '250',
        order: 7
      }
    ],
    pagination: {
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      layout: 'total, sizes, prev, pager, next, jumper'
    },
    defaultSort: {
      prop: 'order_date',
      order: 'descending'
    },
    createdAt: '2023-03-10T08:30:00Z',
    updatedAt: '2023-03-15T14:22:15Z',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    name: '库存管理查询',
    description: '用于查询仓库库存信息，支持按产品类别、库存量等条件筛选',
    dataSourceId: '1',
    tableName: 'inventory',
    conditions: [
      {
        id: '1',
        field: 'product_name',
        label: '产品名称',
        component: 'Input',
        operator: 'contains',
        required: false,
        defaultValue: '',
        order: 1,
        props: {
          placeholder: '请输入产品名称',
          clearable: true
        },
        validation: []
      },
      {
        id: '2',
        field: 'category',
        label: '产品类别',
        component: 'Select',
        operator: 'equals',
        required: false,
        defaultValue: '',
        order: 2,
        props: {
          placeholder: '请选择产品类别',
          clearable: true,
          options: [
            { label: '电子产品', value: 'electronics' },
            { label: '服装', value: 'clothing' },
            { label: '家具', value: 'furniture' },
            { label: '食品', value: 'food' }
          ]
        },
        validation: []
      },
      {
        id: '3',
        field: 'stock_quantity',
        label: '库存数量',
        component: 'InputNumber',
        operator: 'lessThan',
        required: false,
        defaultValue: 100,
        order: 3,
        props: {
          min: 0,
          step: 10,
          controlsPosition: 'right'
        },
        validation: [
          {
            type: 'number',
            message: '请输入有效的数量',
            trigger: 'blur'
          }
        ]
      },
      {
        id: '4',
        field: 'warehouse',
        label: '仓库位置',
        component: 'Select',
        operator: 'equals',
        required: false,
        defaultValue: '',
        order: 4,
        props: {
          placeholder: '请选择仓库位置',
          clearable: true,
          options: [
            { label: '北京仓', value: 'beijing' },
            { label: '上海仓', value: 'shanghai' },
            { label: '广州仓', value: 'guangzhou' },
            { label: '成都仓', value: 'chengdu' }
          ]
        },
        validation: []
      }
    ],
    resultColumns: [
      {
        id: '1',
        field: 'product_id',
        label: '产品编号',
        show: true,
        sortable: true,
        width: '120',
        fixed: 'left',
        order: 1
      },
      {
        id: '2',
        field: 'product_name',
        label: '产品名称',
        show: true,
        sortable: true,
        width: '150',
        order: 2
      },
      {
        id: '3',
        field: 'category',
        label: '产品类别',
        show: true,
        sortable: true,
        width: '120',
        order: 3
      },
      {
        id: '4',
        field: 'stock_quantity',
        label: '库存数量',
        show: true,
        sortable: true,
        width: '120',
        order: 4
      },
      {
        id: '5',
        field: 'warehouse',
        label: '仓库位置',
        show: true,
        sortable: true,
        width: '120',
        order: 5
      },
      {
        id: '6',
        field: 'unit_price',
        label: '单价',
        show: true,
        sortable: true,
        width: '120',
        order: 6
      },
      {
        id: '7',
        field: 'last_update',
        label: '最后更新时间',
        show: true,
        sortable: true,
        width: '180',
        order: 7
      }
    ],
    pagination: {
      pageSize: 20,
      pageSizes: [10, 20, 50, 100],
      layout: 'total, sizes, prev, pager, next, jumper'
    },
    defaultSort: {
      prop: 'stock_quantity',
      order: 'ascending'
    },
    createdAt: '2023-03-12T10:15:23Z',
    updatedAt: '2023-03-18T09:45:30Z',
    createdBy: 'admin',
    updatedBy: 'inventory_manager'
  },
  {
    id: '3',
    name: '员工信息查询',
    description: '用于查询公司员工信息，支持按部门、职位、入职日期等条件筛选',
    dataSourceId: '1',
    tableName: 'employees',
    conditions: [
      {
        id: '1',
        field: 'employee_name',
        label: '员工姓名',
        component: 'Input',
        operator: 'contains',
        required: false,
        defaultValue: '',
        order: 1,
        props: {
          placeholder: '请输入员工姓名',
          clearable: true
        },
        validation: []
      },
      {
        id: '2',
        field: 'department',
        label: '所属部门',
        component: 'Select',
        operator: 'equals',
        required: false,
        defaultValue: '',
        order: 2,
        props: {
          placeholder: '请选择部门',
          clearable: true,
          options: [
            { label: '研发部', value: 'rd' },
            { label: '市场部', value: 'marketing' },
            { label: '销售部', value: 'sales' },
            { label: '人力资源', value: 'hr' },
            { label: '财务部', value: 'finance' }
          ]
        },
        validation: []
      },
      {
        id: '3',
        field: 'hire_date',
        label: '入职日期',
        component: 'DatePicker',
        operator: 'after',
        required: false,
        defaultValue: '',
        order: 3,
        props: {
          placeholder: '请选择日期',
          valueFormat: 'YYYY-MM-DD'
        },
        validation: []
      },
      {
        id: '4',
        field: 'employment_status',
        label: '在职状态',
        component: 'RadioGroup',
        operator: 'equals',
        required: false,
        defaultValue: 'active',
        order: 4,
        props: {
          options: [
            { label: '在职', value: 'active' },
            { label: '离职', value: 'inactive' },
            { label: '所有', value: 'all' }
          ]
        },
        validation: []
      }
    ],
    resultColumns: [
      {
        id: '1',
        field: 'employee_id',
        label: '员工编号',
        show: true,
        sortable: true,
        width: '120',
        fixed: 'left',
        order: 1
      },
      {
        id: '2',
        field: 'employee_name',
        label: '员工姓名',
        show: true,
        sortable: true,
        width: '120',
        order: 2
      },
      {
        id: '3',
        field: 'department',
        label: '所属部门',
        show: true,
        sortable: true,
        width: '120',
        order: 3
      },
      {
        id: '4',
        field: 'position',
        label: '职位',
        show: true,
        sortable: true,
        width: '120',
        order: 4
      },
      {
        id: '5',
        field: 'hire_date',
        label: '入职日期',
        show: true,
        sortable: true,
        width: '120',
        order: 5
      },
      {
        id: '6',
        field: 'salary',
        label: '薪资',
        show: true,
        sortable: true,
        width: '120',
        order: 6
      },
      {
        id: '7',
        field: 'employment_status',
        label: '在职状态',
        show: true,
        sortable: true,
        width: '100',
        order: 7
      },
      {
        id: '8',
        field: 'email',
        label: '邮箱',
        show: true,
        sortable: false,
        width: '180',
        order: 8
      }
    ],
    pagination: {
      pageSize: 15,
      pageSizes: [15, 30, 50, 100],
      layout: 'total, sizes, prev, pager, next, jumper'
    },
    defaultSort: {
      prop: 'employee_id',
      order: 'ascending'
    },
    createdAt: '2023-03-15T14:32:45Z',
    updatedAt: '2023-03-20T11:18:52Z',
    createdBy: 'hr_manager',
    updatedBy: 'hr_manager'
  }
]