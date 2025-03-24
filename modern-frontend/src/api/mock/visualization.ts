/**
 * 可视化模拟数据
 */
import type { Visualization } from '../../types/visualization'

// 模拟的可视化数据
export const visualizations: Visualization[] = [
  {
    id: '1',
    name: '月度销售趋势',
    description: '展示最近12个月的销售趋势，包括销售额和订单数量',
    queryId: '1',
    type: 'line',
    config: {
      title: {
        text: '月度销售趋势',
        subtext: '最近12个月销售数据分析'
      },
      xAxis: {
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          data: [12500, 15000, 18000, 16500, 19000, 21500, 23000, 24500, 22000, 25500, 28000, 30000]
        },
        {
          name: '订单数量',
          type: 'line',
          data: [125, 150, 180, 165, 190, 215, 230, 245, 220, 255, 280, 300]
        }
      ],
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['销售额', '订单数量']
      }
    },
    styleConfig: {
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      animation: true,
      legendPosition: 'top',
      colorScheme: 'default'
    },
    dataMapping: {
      xField: 'month',
      yFields: ['sales_amount', 'order_count'],
      seriesNames: ['销售额', '订单数量']
    },
    createdAt: '2023-02-15T10:30:00Z',
    updatedAt: '2023-03-05T14:25:00Z',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    name: '产品销售占比',
    description: '各产品类别的销售占比情况',
    queryId: '2',
    type: 'pie',
    config: {
      title: {
        text: '产品销售占比',
        subtext: '按产品类别划分'
      },
      series: [
        {
          name: '销售额',
          type: 'pie',
          radius: '60%',
          data: [
            { value: 35, name: '电子产品' },
            { value: 25, name: '服装' },
            { value: 15, name: '食品' },
            { value: 10, name: '家具' },
            { value: 15, name: '其他' }
          ]
        }
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      }
    },
    styleConfig: {
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      animation: true,
      legendPosition: 'right',
      colorScheme: 'blue'
    },
    dataMapping: {
      nameField: 'category',
      valueField: 'sales_amount'
    },
    createdAt: '2023-02-20T09:15:00Z',
    updatedAt: '2023-03-10T11:40:00Z',
    createdBy: 'admin',
    updatedBy: 'user1'
  },
  {
    id: '3',
    name: '地区销售分布',
    description: '不同地区的销售数据对比',
    queryId: '3',
    type: 'bar',
    config: {
      title: {
        text: '地区销售分布',
        subtext: '按省份划分的销售情况'
      },
      xAxis: {
        data: ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安']
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: [28000, 26500, 22000, 21500, 18000, 17500, 16000, 15000]
        }
      ],
      tooltip: {
        trigger: 'axis'
      }
    },
    styleConfig: {
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      animation: true,
      legendPosition: 'top',
      colorScheme: 'green'
    },
    dataMapping: {
      xField: 'region',
      yFields: ['sales_amount'],
      seriesNames: ['销售额']
    },
    createdAt: '2023-03-01T13:45:00Z',
    updatedAt: '2023-03-15T16:20:00Z',
    createdBy: 'user2',
    updatedBy: 'user2'
  },
  {
    id: '4',
    name: '客户满意度分析',
    description: '不同产品线的客户满意度评分',
    queryId: '4',
    type: 'radar',
    config: {
      title: {
        text: '客户满意度分析',
        subtext: '按产品线划分'
      },
      radar: {
        indicator: [
          { name: '产品质量', max: 10 },
          { name: '服务态度', max: 10 },
          { name: '价格合理性', max: 10 },
          { name: '售后服务', max: 10 },
          { name: '物流速度', max: 10 }
        ]
      },
      series: [
        {
          name: '满意度评分',
          type: 'radar',
          data: [
            {
              value: [9, 8.5, 7.5, 9, 8],
              name: '电子产品'
            },
            {
              value: [8.5, 9, 8, 7.5, 7],
              name: '服装'
            },
            {
              value: [7, 8, 9, 7, 9],
              name: '食品'
            }
          ]
        }
      ],
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['电子产品', '服装', '食品']
      }
    },
    styleConfig: {
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      animation: true,
      legendPosition: 'bottom',
      colorScheme: 'purple'
    },
    dataMapping: {
      dimensionFields: ['quality', 'service', 'price', 'after_sale', 'logistics'],
      seriesField: 'product_line'
    },
    createdAt: '2023-03-05T10:20:00Z',
    updatedAt: '2023-03-18T09:30:00Z',
    createdBy: 'user1',
    updatedBy: 'admin'
  },
  {
    id: '5',
    name: '用户增长趋势',
    description: '最近一年的用户增长情况',
    queryId: '5',
    type: 'line',
    config: {
      title: {
        text: '用户增长趋势',
        subtext: '最近12个月数据'
      },
      xAxis: {
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      series: [
        {
          name: '新增用户',
          type: 'line',
          data: [1200, 1350, 1550, 1850, 2100, 2300, 2600, 2900, 3200, 3500, 3800, 4200],
          smooth: true,
          areaStyle: {}
        }
      ],
      tooltip: {
        trigger: 'axis'
      }
    },
    styleConfig: {
      theme: 'light',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      animation: true,
      legendPosition: 'top',
      colorScheme: 'orange'
    },
    dataMapping: {
      xField: 'month',
      yFields: ['new_users'],
      seriesNames: ['新增用户']
    },
    createdAt: '2023-03-08T15:50:00Z',
    updatedAt: '2023-03-20T11:15:00Z',
    createdBy: 'admin',
    updatedBy: 'user3'
  }
]