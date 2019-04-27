import * as React from 'react';
import * as ReactWindow from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { isEqual, debounce } from 'lodash-es';

const { FixedSizeList, VariableSizeList, areEqual } = ReactWindow;
const { useContext, createContext, memo, useReducer, useMemo } = React;

export type column<T = string, K = any> = {
  key: T;
  width: number;
  title?: string;
  Component?: React.ElementType<{ row?: K; column?: column<T, K> }>;
  HeaderCell?: React.ElementType;
};

const context = createContext({
  columns: [] as column<any, any>[],
  data: [] as any[],
  Cell: 'div' as React.ElementType,
  Row: 'div' as React.ElementType,
  classNamePrefix: ''
});

const Measurer = ({ dispatch, entity }: { dispatch: any; entity: string }) => {
  const debouncedDispatch = useMemo(
    () => debounce(dispatch, 100, { leading: true }),
    []
  );
  return (
    <AutoSizer>
      {({ height, width }) => {
        debouncedDispatch({ dimensions: [height, width], entity });
        return null;
      }}
    </AutoSizer>
  );
};

const RowRenderer = memo(function RowRenderer({
  index,
  style
}: ReactWindow.ListChildComponentProps) {
  const { columns, data, Cell, classNamePrefix, Row } = useContext(context);

  return (
    <Row
      style={{
        ...style,
        display: 'flex'
      }}
      className={`${classNamePrefix}table-row`}
    >
      {columns.map(column => {
        const { key, width, Component = 'div' } = column;
        return (
          <Cell
            key={key}
            style={{
              width: `${width}px`,
              flexGrow: width,
              display: 'inline-block',
              overflow: 'auto'
            }}
            className={`${classNamePrefix}table-cell`}
          >
            <Component row={data[index]} column={column}>
              {data[index][key]}
            </Component>
          </Cell>
        );
      })}
    </Row>
  );
},
areEqual);

const HeaderRowRenderer = ({
  width,
  dispatch,
  Header,
  HeaderRow,
  HeaderCell: DefaultHeaderCell
}: {
  width: number;
  dispatch: Function;
  Header: React.ElementType;
  HeaderRow: React.ElementType;
  HeaderCell: React.ElementType;
}) => {
  const { columns, classNamePrefix } = useContext(context);

  return (
    <Header className={`${classNamePrefix}table-header`}>
      <HeaderRow
        style={{
          width: `${width}px`,
          display: 'flex'
        }}
        className={`${classNamePrefix}table-header-row`}
      >
        <Measurer dispatch={dispatch} entity="header" />
        {columns.map(
          ({ key, width, title, HeaderCell = DefaultHeaderCell }) => {
            return (
              <HeaderCell
                key={`header${key}`}
                style={{
                  width: `${width}px`,
                  display: 'inline-block',
                  flexGrow: width
                }}
                className={`${classNamePrefix}table-header-cell`}
              >
                {title}
              </HeaderCell>
            );
          }
        )}
      </HeaderRow>
    </Header>
  );
};

// Define the initial state of dimensions
// Also to be used as a state which will not trigger a re-render on changes
// So that we can change state from the useReducer, only once per all three dimension entities
let cache = { header: [10, 100], cell: [10, 20], table: [100, 100] };

function WindowTable<T = any>({
  columns,
  data,
  rowHeight,
  height,
  overscanCount = 1,
  style = {},
  Cell = 'div',
  HeaderCell = 'div',
  Table = 'div',
  Header = 'div',
  HeaderRow = 'div',
  Row = 'div',
  Body = 'div',
  className = '',
  classNamePrefix = '',
  SampleCell = 'div',
  ...rest
}: {
  columns: Array<column<keyof T, T>>;
  data: Array<T>;
  height?: number;
  rowHeight?: number;
  overscanCount?: number;
  style?: object;
  Cell?: React.ElementType;
  HeaderCell?: React.ElementType;
  Table?: React.ElementType;
  Header?: React.ElementType;
  HeaderRow?: React.ElementType;
  Row?: React.ElementType;
  Body?: React.ElementType;
  SampleCell?: React.ElementType;
  className?: string;
  classNamePrefix?: string;
}) {
  const List =
    rowHeight && typeof rowHeight === 'function'
      ? VariableSizeList
      : FixedSizeList;
  const columnWidthsSum = columns.reduce((sum, { width }) => sum + width, 0);

  const [dimensions, dispatch] = useReducer(
    (state, { entity, dimensions } = {}) => {
      if (entity) {
        // Keep updates in cache
        cache = {
          ...cache,
          [entity]: dimensions
        };
        // Update state only when `table` entity dimensions have updated
        if (entity === 'table' && !isEqual(state[entity], cache[entity])) {
          return cache;
        }
      }
      return state;
    },
    cache
  );

  const [tableHeight, tableWidth] = dimensions.table;
  const [headerHeight] = dimensions.header;
  const [sampleCellHeight] = dimensions.cell;

  const bodyHeight: number = (height || tableHeight) - headerHeight;
  const effectiveWidth = Math.max(columnWidthsSum, tableWidth);

  const TableBody = ({ children, ...props }: React.ComponentProps<any>) => (
    <Table {...props} className={`${classNamePrefix}table`}>
      <Body className={`${classNamePrefix}table-body`}>{children}</Body>
    </Table>
  );

  return (
    <div
      style={{
        height: 'calc(100% - 16px)', // 16px less to avoid possible unnecessary scrollbars
        width: '100%',
        maxHeight: '100vh', // By default, table height will be bounded by 100% of viewport height
        ...style
      }}
      {...rest}
      className={`${classNamePrefix}${className}`}
    >
      {!rowHeight && (
        <Table
          style={{
            height: 0,
            opacity: 0,
            display: 'block',
            margin: 0
          }}
          className={`${classNamePrefix}table`}
        >
          <Body className={`${classNamePrefix}table-body`}>
            <Row className={`${classNamePrefix}table-row`}>
              <Measurer dispatch={dispatch} entity="cell" />
              <Cell className={`${classNamePrefix}table-cell`}>
                {SampleCell === 'div' ? (
                  <SampleCell>{data[0][columns[0].key]}</SampleCell>
                ) : (
                  <SampleCell />
                )}
              </Cell>
            </Row>
          </Body>
        </Table>
      )}

      <context.Provider
        value={{
          columns,
          data,
          Cell,
          Row,
          classNamePrefix
        }}
      >
        <div>
          <Table>
            <HeaderRowRenderer
              width={effectiveWidth}
              dispatch={dispatch}
              Header={Header}
              HeaderRow={HeaderRow}
              HeaderCell={HeaderCell}
            />
          </Table>
          <List
            itemData={{ data1: data, columns }}
            height={bodyHeight}
            itemCount={data.length}
            itemSize={rowHeight || sampleCellHeight}
            width={effectiveWidth}
            innerElementType={TableBody}
            overscanCount={overscanCount}
          >
            {RowRenderer}
          </List>
        </div>
      </context.Provider>

      <Measurer dispatch={dispatch} entity="table" />
    </div>
  );
}

export default WindowTable;