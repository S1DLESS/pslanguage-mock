import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class Currency extends Model {
  @Column
  iso: string;

  @Column
  usd_rate: number;
}
