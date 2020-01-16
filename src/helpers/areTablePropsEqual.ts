const objectProps = ['style', 'sampleRow'];
const otherProps = [
  'columns',
  'data',
  'rowHeight',
  'height',
  'width',
  'className',
  'rowClassName',
  'classNamePrefix',
  'loading',
];

export function areTablePropsEqual(prev: any, next: any) {
  const areObjectPropsEqual = objectProps.every(propName => {
    return JSON.stringify(prev[propName]) === JSON.stringify(next[propName]);
  });
  if (!areObjectPropsEqual) {
    return false;
  }
  return otherProps.every(propName => {
    return prev[propName] === next[propName];
  });
}
