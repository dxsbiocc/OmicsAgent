/**
 * 通用类型定义
 * 项目中通用的类型定义
 */

// 基础类型
export type ID = number | string;

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'asc' | 'desc';

export type SortField = string;

// 分页相关
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CommonPaginationParams {
  page?: number;
  pageSize?: number;
  skip?: number;
  limit?: number;
}

// 搜索相关
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: SortOrder;
  };
}

// 状态管理相关
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface AsyncAction {
  type: string;
  payload?: any;
  error?: string;
}

// 表单相关
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 组件相关
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface BaseComponentProps extends ComponentProps {
  id?: string;
  'data-testid'?: string;
}

// 事件相关
export interface BaseEvent {
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface ChangeEvent<T = any> extends BaseEvent {
  target: {
    value: T;
    name: string;
    checked?: boolean;
  };
}

export interface ClickEvent extends BaseEvent {
  currentTarget: HTMLElement;
}

// 主题相关
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// 响应式相关
export interface Breakpoint {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export type BreakpointKey = keyof Breakpoint;

// 动画相关
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount?: number | 'infinite';
}

// 通知相关
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 模态框相关
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
}

// 表格相关
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSort?: (field: string, order: SortOrder) => void;
  onFilter?: (filters: Record<string, any>) => void;
  rowKey?: keyof T | ((record: T) => string);
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
}

// 菜单相关
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
}

// 面包屑相关
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// 标签相关
export interface CommonTag {
  id: string;
  label: string;
  color?: string;
  closable?: boolean;
}

// 步骤条相关
export interface StepItem {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

// 时间相关
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface CommonDateRange {
  startDate: Date;
  endDate: Date;
}

// 文件相关
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

export interface UploadFile extends FileInfo {
  uid: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  percent?: number;
  response?: any;
  error?: Error;
}

// 权限相关
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

// 配置相关
export interface AppConfig {
  apiBaseUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  theme: Theme;
  features: Record<string, boolean>;
}

// 错误相关
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: number;
}

// 日志相关
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  error?: Error;
}

// 国际化相关
export interface Locale {
  code: string;
  name: string;
  flag?: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

// 路由相关
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    permissions?: string[];
    roles?: string[];
  };
}

// 工具函数类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
