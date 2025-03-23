/**
 * 仪表盘类型定义
 */

export interface Creator {
  id: string;
  name: string;
  avatar?: string;
}

export interface ShareConfig {
  requirePassword: boolean;
  password?: string;
  enableExpiry: boolean;
  expiryDate?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  favorite: boolean;
  shared: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  creator: Creator;
  shareConfig?: ShareConfig;
}

export interface DashboardFilter {
  type: 'all' | 'created' | 'favorite' | 'shared';
  search?: string;
  sortBy: 'updated' | 'created' | 'name' | 'views';
}

export interface ShareDashboardPayload {
  dashboardId: string;
  type: 'link' | 'user';
  users?: string[];
  shareConfig?: ShareConfig;
}

export interface DashboardResponse {
  total: number;
  items: Dashboard[];
}

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

export type WidgetType = 'chart' | 'metric' | 'text' | 'filter';

export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
}

export interface ChartWidgetConfig extends BaseWidgetConfig {
  type: 'chart';
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  dataSource: string;
  query: string;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
  filters?: string[];
}

export interface MetricWidgetConfig extends BaseWidgetConfig {
  type: 'metric';
  dataSource: string;
  query: string;
  format?: string;
  prefix?: string;
  suffix?: string;
  filters?: string[];
}

export interface TextWidgetConfig extends BaseWidgetConfig {
  type: 'text';
  content: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
}

export interface FilterWidgetConfig extends BaseWidgetConfig {
  type: 'filter';
  filterType: 'select' | 'text' | 'range' | 'date';
  placeholder?: string;
  clearable?: boolean;
  defaultValue?: any;
  multiple?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
}

export type WidgetConfig = ChartWidgetConfig | MetricWidgetConfig | TextWidgetConfig | FilterWidgetConfig;

export interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
}