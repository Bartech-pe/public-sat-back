import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { NotFoundException } from '@nestjs/common';
import {
  BulkCreateOptions,
  DestroyOptions,
  FindOptions,
  RestoreOptions,
  UpdateOptions,
  WhereOptions,
} from 'sequelize';
import { Model, ModelStatic } from 'sequelize-typescript';

/**
 * Generic repository for CRUD operations on Sequelize models.
 * Provides reusable methods to manage entities in an abstract way.
 */
export class GenericCrudRepository<T extends Model> {
  protected readonly model: ModelStatic<T> & typeof Model;

  constructor(model: ModelStatic<T>) {
    this.model = model as ModelStatic<T> & typeof Model;
  }

  /**
   * Retrieves all records matching the given options.
   * @param options Search options (filters, associations, etc.)
   * @returns List of found records
   */
  async findAll(options?: FindOptions<T>): Promise<T[]> {
    const results = await this.model.findAll({
      raw: false,
      nest: true,
      ...options,
    } as FindOptions);

    return results as T[];
  }

  /**
   * Retrieves records with pagination and includes the total count.
   * @param options Search options with `limit` and `offset`
   * @returns Object containing total, limit, offset, and data
   */
  async findAndCountAll(
    options?: FindOptions<T>,
  ): Promise<PaginatedResponse<T>> {
    const results = await this.model.findAndCountAll({
      ...options,
    } as FindOptions);

    return {
      total: results.count,
      limit: options?.limit,
      offset: options?.offset,
      data: results.rows as T[],
    };
  }

  /**
   * Finds a record by its ID.
   * @param id Unique identifier of the record
   * @param options Additional search options
   * @throws NotFoundException if no record is found
   * @returns The found record
   */
  async findById(id: number, options?: FindOptions<T>): Promise<T> {
    const item = await this.model.findOne({
      where: { id } as unknown as WhereOptions<any>,
      ...options,
    });
    if (!item) throw new NotFoundException(`${this.model.name} not found`);
    return item as T;
  }

  /**
   * Finds a single record based on conditions.
   * Allows dynamic scopes and the option to throw if not found.
   * @param options Search options, including `scopes` and `throwIfNotFound`
   * @returns The found record or null if not found
   */
  async findOne(
    options?: FindOptions<T> & { scopes?: string[]; throwIfNotFound?: boolean },
  ): Promise<T | null> {
    const {
      scopes = [],
      throwIfNotFound = true,
      ...findOptions
    } = options || {};

    // Apply scopes dynamically if present
    const query = scopes.length > 0 ? this.model.scope(...scopes) : this.model;

    const item = await query.findOne({
      raw: false,
      nest: true,
      ...findOptions,
    } as FindOptions);

    return item as T | null;
  }

  /**
   * Creates a new record in the database.
   * @param dto Data to create the record
   * @param options Additional creation options
   * @returns The created record
   */
  async create(dto: Partial<T>, options?: any): Promise<T> {
    const item = await this.model.create(dto, options);
    return item as T;
  }

  /**
   * Finds a record based on conditions, or creates it if not found.
   * @param where Condition to search the record
   * @param defaults Default values to create if not found
   * @param options Additional Sequelize options
   * @returns The found or newly created record
   */
  async findOrCreate(
    where: WhereOptions<any>,
    defaults: Partial<T> = {},
    options?: any,
  ): Promise<T> {
    const [item] = await this.model.findOrCreate({
      ...options,
      where,
      defaults: defaults as unknown as T,
    });

    return item as T;
  }

  /**
   * Creates multiple records in bulk.
   * If `restoreOpts` is provided, previously deleted records are restored first.
   * @param dtos List of data to insert
   * @param options Additional creation options
   * @param restoreOpts Options for restoring deleted records
   * @returns List of created records
   */
  async bulkCreate(
    dtos: Partial<T>[],
    options?: BulkCreateOptions<any>,
    restoreOpts?: FindOptions<T>,
  ): Promise<T[]> {
    if (restoreOpts) {
      const restoreAll = await this.model.findAll({
        ...options,
        paranoid: true,
      } as FindOptions);

      await Promise.all(restoreAll.map((res) => res.restore()));
    }

    const items = await this.model.bulkCreate(dtos, options);
    return items as T[];
  }

  /**
   * Updates a record by its ID.
   * @param id Identifier of the record to update
   * @param dto Data to update
   * @returns Number of affected rows and the updated record
   */
  async update(
    id: number,
    dto: Partial<T>,
  ): Promise<[count: number, rows: T[]]> {
    const [count] = await this.model.update(dto, {
      where: { id },
      returning: true,
    } as UpdateOptions);

    const row = await this.findById(id);

    return [count, [row] as T[]];
  }

  /**
   * Deletes a record by its ID (soft-delete if enabled).
   * @param id Identifier of the record
   */
  async delete(id: number): Promise<void> {
    await this.model.destroy({ where: { id } as unknown as WhereOptions<any> });
  }

  /**
   * Deletes multiple records based on conditions.
   * @param options Deletion options
   */
  async bulkDestroy(options?: DestroyOptions<T>): Promise<void> {
    await this.model.destroy(options);
  }

  /**
   * Restores a previously deleted record by its ID.
   * @param id Identifier of the record
   */
  async restore(id: number): Promise<void> {
    await this.model.restore({ where: { id } as unknown as WhereOptions<any> });
  }

  /**
   * Restores multiple deleted records based on conditions.
   * @param options Restore options
   */
  async bulkRestore(options: RestoreOptions<any>): Promise<void> {
    await this.model.restore(options);
  }
}
