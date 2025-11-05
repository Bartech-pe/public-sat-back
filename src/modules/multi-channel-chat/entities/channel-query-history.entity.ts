  import { User } from '@modules/user/entities/user.entity';
  import {
    Table,
    Column,
    Model,
    DataType,
    DefaultScope,
    Scopes,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    ForeignKey,
    BelongsTo,
  } from 'sequelize-typescript';
  import { ChannelAttention } from './channel-attention.entity';
  import { QueryType, DocumentType } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';

  @DefaultScope(() => ({
    attributes: { exclude: ['deletedAt', 'deletedBy'] },
  }))
  @Scopes(() => ({}))
  @Table({
    tableName: 'channel_query_history',
    timestamps: true,
    paranoid: true,
    underscored: true,
  })
  export class ChannelQueryHistory extends Model {
    @Column({
      field: 'id',
      type: DataType.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Identificador del registro de consulta',
    })
    declare id: number;

    @Column({
      field: 'query_type',
      type: DataType.ENUM(...Object.values(QueryType)),
      allowNull: false,
      comment: 'Tipo de consulta realizada',
    })
    declare queryType: QueryType;

    @Column({
      field: 'document_type',
      type: DataType.ENUM(...Object.values(DocumentType)),
      allowNull: false,
      comment: 'Tipo de documento utilizado en la consulta',
    })
    declare documentType: DocumentType;

    @ForeignKey(() => ChannelAttention)
    @Column({
      field: 'channel_attention_id',
      type: DataType.BIGINT,
      allowNull: false,
      comment: 'FK hacia la atención en curso (channel_attentions)',
    })
    declare attentionId: number;

    @BelongsTo(() => ChannelAttention)
    declare attention: ChannelAttention;

    @Column({
      field: 'document_value',
      type: DataType.STRING(100),
      allowNull: false,
      comment: 'Valor del documento ingresado',
    })
    declare documentValue: string;

    @Column({
      field: 'status',
      type: DataType.BOOLEAN,
      defaultValue: true,
      comment: 'Campo para habilitar o inhabilitar un registro',
    })
    declare status: boolean;

    /** ================================
     * AUDITORÍA
     * ================================ */

    @ForeignKey(() => User)
    @Column({ field: 'created_by', allowNull: true })
    declare createdBy: number;

    @BelongsTo(() => User, 'createdBy')
    declare createdByUser?: User;

    @ForeignKey(() => User)
    @Column({ field: 'updated_by', allowNull: true })
    declare updatedBy: number;

    @BelongsTo(() => User, 'updatedBy')
    declare updatedByUser?: User;

    @ForeignKey(() => User)
    @Column({ field: 'deleted_by', allowNull: true })
    declare deletedBy: number;

    @BelongsTo(() => User, 'deletedBy')
    declare deletedByUser?: User;

    /** ================================
     * TIMESTAMPS
     * ================================ */
    @CreatedAt
    @Column({ field: 'created_at', allowNull: true })
    declare createdAt: Date;

    @UpdatedAt
    @Column({ field: 'updated_at', allowNull: true })
    declare updatedAt: Date;

    @DeletedAt
    @Column({ field: 'deleted_at', allowNull: true })
    declare deletedAt: Date;
  }