import * as React from 'react';

export interface ReducerState {
  header: [number, number];
  row: [number, number];
  table: [number, number];
}

export type TableEntity = keyof ReducerState;

export interface MeasureAction {
  entity: TableEntity;
  dimensions: [number, number];
}

export type Column<T = string, K = any> = {
  key: T;
  width: number;
  title?: string;
  Component?: React.ElementType<{ row?: K; column?: Column<T, K> }>;
  HeaderCell?: React.ElementType;
};

export type WindowTableProps<T> = {
  columns: Column<keyof T, T>[];
  data: T[];
  height?: number;
  width?: number;
  rowHeight?: number;
  overscanCount?: number;
  style?: React.CSSProperties;
  Cell?: React.ElementType;
  HeaderCell?: React.ElementType;
  Table?: React.ElementType;
  Header?: React.ElementType;
  HeaderRow?: React.ElementType;
  Row?: React.ElementType;
  Body?: React.ElementType;
  sampleRowIndex?: number;
  sampleRow?: T;
  className?: string;
  rowClassName?: string;
  classNamePrefix?: string;
  debounceWait?: number;
};

export interface RowCellsProps {
  columns: any[];
  classNamePrefix: string;
  datum: any;
  Cell: React.ElementType;
  index?: number;
}

export interface HeaderRowProps {
  measure: React.Dispatch<MeasureAction>;
  Header: React.ElementType;
  HeaderRow: React.ElementType;
  HeaderCell: React.ElementType;
  debounceWait: number;
}

export interface Html5TableProps<T> extends WindowTableProps<T> {
  headerClassName: string;
}
