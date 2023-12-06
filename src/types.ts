import { MomentObjectOutput } from 'moment'
import { Util } from './util'

export type Await<T> = T extends PromiseLike<infer U> ? U : T

export type Config = ReturnType<typeof Util.getInputs>

export interface Timespan {
  name: string
  unit: string
  fromDate: string
  toDate: string
  fromDatePretty: string
  toDatePretty: string
  fromDateObject: MomentObjectOutput
  toDateObject: MomentObjectOutput
}
