import {Adapter} from 'js-data-adapter'

interface IDict {
  [key: string]: any;
}
interface IBaseAdapter extends IDict {
  debug?: boolean,
  raw?: boolean
}
interface IBaseSqlAdapter extends IBaseAdapter {
  knexOpt?: IDict
}
export class SqlAdapter extends Adapter {
  static extend(instanceProps?: IDict, classProps?: IDict): typeof SqlAdapter
  constructor(opts?: IBaseSqlAdapter)
}
export interface OPERATORS {
  '=': Function
  '==': Function
  '===': Function
  '!=': Function
  '!==': Function
  '>': Function
  '>=': Function
  '<': Function
  '<=': Function
  'isectEmpty': Function
  'isectNotEmpty': Function
  'in': Function
  'notIn': Function
  'contains': Function
  'notContains': Function
}
export interface version {
  full: string
  minor: string
  major: string
  patch: string
  alpha: string | boolean
  beta: string | boolean
}