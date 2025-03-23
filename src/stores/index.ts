import { createPinia } from 'pinia';
import { useUserStore } from './user';
import { useAppStore } from './app';
import { useQueryStore } from './query';
import { useDataSourceStore } from './datasource';
import { useQueryHistoryStore } from './query-history';
import { useSqlParserStore } from './sql-parser';
import { useDashboardStore } from './dashboard';

// 导出 store 实例
export const store = createPinia();

// 导出所有 store
export * from './app';
export * from './user';
export * from './datasource';
export * from './query';
export * from './query-history';

// 导出默认实例
export default store;

export {
  useUserStore,
  useAppStore,
  useQueryStore,
  useDataSourceStore,
  useQueryHistoryStore,
  useSqlParserStore,
  useDashboardStore,
};