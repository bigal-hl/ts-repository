'use strict'
import {IRepository} from './IRepository'
import { SimpleQuery } from './SimpleQuery';

type constructor<Z> = new()=>Z;

/**
 * Base class which serves as an example for implementing a new generic Repository
 */
export abstract class BaseRepository<T> implements IRepository<T>
{
    protected _DataType: constructor<T>;
    protected _DataTypeName: string;

    constructor(pDataType: constructor<T>)
    {
        this._DataType = pDataType;
        this._DataTypeName = this._DataType.name;
    }

    createEntity(): T
    {
        //create ORM entity from type constructor
        return new this._DataType();
    }

    createEmptyEntity(): T
    {
        return <T>{};
    }

    /** Get the fully-qualified (table name included) field name ({table}.{field})
     * @method
    */
    nameOfField(pFieldName: keyof T): string
    {
        return this.dataTypeName + "." + pFieldName;
    }
    /** Check to see if ORM entity has field
     * @method
    */
    hasField(pFieldName: string): boolean
    {
        return !!(pFieldName as keyof T);
    }

    get dataTypeName()
    {
        return this._DataTypeName;
    }
    get primaryIdentifier(): string
    {
        return 'ID' + this._DataTypeName;
    }
    get primaryGUID(): string
    {
        return 'GUID' + this._DataTypeName;
    }

    /** Create a new query, in context of this request and data type
     * @method
    */
    query(pRequestContext: any): SimpleQuery<T>
    {
        return new SimpleQuery<T>(this, pRequestContext);
    }

    /** Read single record by query
     * @method
     * @returns Error if record not found.
    */
    async read(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<T>
    {
        pQuery.cap(1);
        var records = await this.reads(pQuery, pRequestContext);
        if (records.length > 0)
            return records[0];
        else
            return null;
    }

    /** Read single record by ID
    * @method
    */
    async readByID(pIDRecord: number, pRequestContext: any): Promise<T>
    {
        if (!pIDRecord)
            return null;
        
        return this.query(pRequestContext)
            .where(this.primaryIdentifier, pIDRecord)
            .read();
    }

    /** Invoke Read by ID list (multiple) on Meadow Endpoint Instance
     * @method
    */
    async readByIDs(pIDRecords: Array<number>, pRequestContext: any): Promise<Array<T>>
    {
        if (!pIDRecords || pIDRecords.length < 1)
            return new Array<T>();

        //note: so if asking for a list by IDs, we never want to leave out any record
        // (this is generally used in manual joining operations)

        return this.query(pRequestContext)
            .where(this.primaryIdentifier, pIDRecords)
            .cap(99999)
            .reads();
    }

    /** Invoke Read by ID (singular) on Meadow Endpoint Instance
     * @method
    */
    async readByGUID(pGUIDRecord: string, pRequestContext: any): Promise<T>
    {
        if (!pGUIDRecord)
            return null;
        
        return this.query(pRequestContext)
            .where(this.primaryGUID, pGUIDRecord)
            .read();
    }

    abstract reads(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<Array<T>>
    abstract readsLite(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<Array<T>>
    abstract count(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<number>
}
