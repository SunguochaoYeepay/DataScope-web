/**
 * 查询结果模拟数据
 */

// 销售订单查询结果
export const ordersQueryResult = {
  total: 100,
  data: [
    {
      order_id: 'ORD-20230315-001',
      customer_name: '北京科技有限公司',
      order_date: '2023-03-15',
      total_amount: 18650.50,
      status: 'completed',
      payment_method: '银行转账',
      shipping_address: '北京市海淀区中关村科技园A座1201'
    },
    {
      order_id: 'ORD-20230314-002',
      customer_name: '上海贸易有限公司',
      order_date: '2023-03-14',
      total_amount: 9260.00,
      status: 'shipped',
      payment_method: '支付宝',
      shipping_address: '上海市浦东新区张江高科技园区B栋302'
    },
    {
      order_id: 'ORD-20230313-003',
      customer_name: '广州电子科技有限公司',
      order_date: '2023-03-13',
      total_amount: 12480.75,
      status: 'paid',
      payment_method: '微信支付',
      shipping_address: '广州市天河区珠江新城C塔1505'
    },
    {
      order_id: 'ORD-20230312-004',
      customer_name: '深圳信息技术有限公司',
      order_date: '2023-03-12',
      total_amount: 5680.25,
      status: 'pending',
      payment_method: '待付款',
      shipping_address: '深圳市南山区科技园D区501'
    },
    {
      order_id: 'ORD-20230311-005',
      customer_name: '杭州网络科技有限公司',
      order_date: '2023-03-11',
      total_amount: 7890.60,
      status: 'canceled',
      payment_method: '信用卡',
      shipping_address: '杭州市西湖区文三路E座801'
    },
    {
      order_id: 'ORD-20230310-006',
      customer_name: '成都数据科技有限公司',
      order_date: '2023-03-10',
      total_amount: 15680.30,
      status: 'completed',
      payment_method: '银行转账',
      shipping_address: '成都市高新区天府大道F栋1001'
    },
    {
      order_id: 'ORD-20230309-007',
      customer_name: '武汉软件开发有限公司',
      order_date: '2023-03-09',
      total_amount: 8970.40,
      status: 'shipped',
      payment_method: '支付宝',
      shipping_address: '武汉市洪山区光谷G座602'
    },
    {
      order_id: 'ORD-20230308-008',
      customer_name: '南京电子商务有限公司',
      order_date: '2023-03-08',
      total_amount: 6430.80,
      status: 'paid',
      payment_method: '微信支付',
      shipping_address: '南京市建邺区奥体中心H栋901'
    },
    {
      order_id: 'ORD-20230307-009',
      customer_name: '重庆通信设备有限公司',
      order_date: '2023-03-07',
      total_amount: 11230.50,
      status: 'pending',
      payment_method: '待付款',
      shipping_address: '重庆市渝北区龙湖I座1205'
    },
    {
      order_id: 'ORD-20230306-010',
      customer_name: '西安软件服务有限公司',
      order_date: '2023-03-06',
      total_amount: 9840.25,
      status: 'completed',
      payment_method: '信用卡',
      shipping_address: '西安市高新区科技路J栋701'
    }
  ]
}

// 库存查询结果
export const inventoryQueryResult = {
  total: 152,
  data: [
    {
      product_id: 'P-0001',
      product_name: '高性能笔记本电脑',
      category: 'electronics',
      stock_quantity: 85,
      warehouse: 'beijing',
      unit_price: 6799.00,
      last_update: '2023-03-18 10:25:36'
    },
    {
      product_id: 'P-0002',
      product_name: '智能手机Pro',
      category: 'electronics',
      stock_quantity: 120,
      warehouse: 'shanghai',
      unit_price: 4999.00,
      last_update: '2023-03-17 15:42:08'
    },
    {
      product_id: 'P-0003',
      product_name: '无线蓝牙耳机',
      category: 'electronics',
      stock_quantity: 230,
      warehouse: 'beijing',
      unit_price: 899.00,
      last_update: '2023-03-19 09:15:22'
    },
    {
      product_id: 'P-0004',
      product_name: '商务休闲西装',
      category: 'clothing',
      stock_quantity: 45,
      warehouse: 'guangzhou',
      unit_price: 1299.00,
      last_update: '2023-03-15 16:30:47'
    },
    {
      product_id: 'P-0005',
      product_name: '时尚连衣裙',
      category: 'clothing',
      stock_quantity: 68,
      warehouse: 'shanghai',
      unit_price: 699.00,
      last_update: '2023-03-16 11:05:18'
    },
    {
      product_id: 'P-0006',
      product_name: '办公桌椅套装',
      category: 'furniture',
      stock_quantity: 28,
      warehouse: 'beijing',
      unit_price: 2199.00,
      last_update: '2023-03-14 14:28:56'
    },
    {
      product_id: 'P-0007',
      product_name: '北欧风格沙发',
      category: 'furniture',
      stock_quantity: 15,
      warehouse: 'chengdu',
      unit_price: 3599.00,
      last_update: '2023-03-13 08:47:33'
    },
    {
      product_id: 'P-0008',
      product_name: '有机蔬菜套装',
      category: 'food',
      stock_quantity: 150,
      warehouse: 'guangzhou',
      unit_price: 99.00,
      last_update: '2023-03-20 07:30:15'
    },
    {
      product_id: 'P-0009',
      product_name: '进口牛肉礼盒',
      category: 'food',
      stock_quantity: 32,
      warehouse: 'shanghai',
      unit_price: 399.00,
      last_update: '2023-03-19 16:55:42'
    },
    {
      product_id: 'P-0010',
      product_name: '智能平板电脑',
      category: 'electronics',
      stock_quantity: 95,
      warehouse: 'beijing',
      unit_price: 2999.00,
      last_update: '2023-03-18 13:22:09'
    }
  ]
}

// 员工信息查询结果
export const employeesQueryResult = {
  total: 127,
  data: [
    {
      employee_id: 1001,
      employee_name: '张三',
      department: 'rd',
      position: '高级工程师',
      hire_date: '2020-05-15',
      salary: 18000.00,
      employment_status: 'active',
      email: 'zhangsan@example.com'
    },
    {
      employee_id: 1002,
      employee_name: '李四',
      department: 'marketing',
      position: '市场经理',
      hire_date: '2019-08-22',
      salary: 15000.00,
      employment_status: 'active',
      email: 'lisi@example.com'
    },
    {
      employee_id: 1003,
      employee_name: '王五',
      department: 'sales',
      position: '销售顾问',
      hire_date: '2021-03-10',
      salary: 12000.00,
      employment_status: 'active',
      email: 'wangwu@example.com'
    },
    {
      employee_id: 1004,
      employee_name: '赵六',
      department: 'hr',
      position: 'HR专员',
      hire_date: '2022-01-05',
      salary: 10000.00,
      employment_status: 'active',
      email: 'zhaoliu@example.com'
    },
    {
      employee_id: 1005,
      employee_name: '钱七',
      department: 'finance',
      position: '财务主管',
      hire_date: '2018-11-18',
      salary: 16000.00,
      employment_status: 'active',
      email: 'qianqi@example.com'
    },
    {
      employee_id: 1006,
      employee_name: '孙八',
      department: 'rd',
      position: '前端工程师',
      hire_date: '2020-09-25',
      salary: 14000.00,
      employment_status: 'active',
      email: 'sunba@example.com'
    },
    {
      employee_id: 1007,
      employee_name: '周九',
      department: 'rd',
      position: '后端工程师',
      hire_date: '2021-07-12',
      salary: 14500.00,
      employment_status: 'active',
      email: 'zhoujiu@example.com'
    },
    {
      employee_id: 1008,
      employee_name: '吴十',
      department: 'marketing',
      position: '市场专员',
      hire_date: '2022-02-28',
      salary: 9000.00,
      employment_status: 'active',
      email: 'wushi@example.com'
    },
    {
      employee_id: 1009,
      employee_name: '郑十一',
      department: 'sales',
      position: '销售经理',
      hire_date: '2019-05-20',
      salary: 18000.00,
      employment_status: 'active',
      email: 'zhengshiyi@example.com'
    },
    {
      employee_id: 1010,
      employee_name: '刘十二',
      department: 'finance',
      position: '会计',
      hire_date: '2021-10-15',
      salary: 11000.00,
      employment_status: 'inactive',
      email: 'liushier@example.com'
    }
  ]
}