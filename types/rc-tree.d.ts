import 'rc-tree';

declare module 'rc-tree/lib/interface' {
  export type KeyEntities<DateType extends object = any> = Record<
    string | number,
    DataEntity<DateType>
  >;
  export interface DataEntity<DateType> {
    key: string | number;
    // ... 可根据需要补充其它字段
  }
} 