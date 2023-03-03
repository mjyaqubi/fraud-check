import {
  Column,
  Model,
  Table,
  DataType,
  IsUUID,
  Index,
} from 'sequelize-typescript';
import { FraudCheckStatus } from './enum';

@Table({
  tableName: 'fraud_check_results',
  timestamps: true,
})
export class FraudCheckModel extends Model {
  @IsUUID(4)
  @Index({ type: 'UNIQUE', unique: true })
  @Column
  orderFraudCheckId: string;

  @IsUUID(4)
  @Column
  customerGuid: string;

  @Column
  @Index({ type: 'UNIQUE', unique: true })
  orderId: string;

  @Column
  orderAmount: number;

  @Column({
    type: DataType.ENUM,
    values: [FraudCheckStatus.FAILED, FraudCheckStatus.PASSED],
    allowNull: false,
  })
  fraudCheckStatus: FraudCheckStatus;

  @Column
  providerName: string;

  @Column
  providerResponse: string;
}
