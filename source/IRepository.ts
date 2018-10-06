'use strict'
import {SimpleQuery} from "./SimpleQuery";
/**
* IRepository abstraction layer for common data access patterns
*
* @class IRepository
* @constructor
*/

export interface IRepository<T>
{
    dataTypeName: string;
    primaryIdentifier: string;
    primaryGUID: string
    query(pRequestContext: any): SimpleQuery<T>;
    hasField(pFieldName: string): boolean;
    nameOfField(pFieldName: keyof T): string;
    createEntity(): T
    createEmptyEntity(): T
    
    read(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<T>;
    reads(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<Array<T>>;
    readsLite(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<Array<T>>;
    count(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<number>;

    readByID(pID: number, pRequestContext: any): Promise<T>;
    readByGUID(pGUIDRecord: string, pRequest: any): Promise<T>
}

export interface ICRUDRepository<T> extends IRepository<T>
{
    create(pRecord: T, pRequestContext: any): Promise<T>;
    update(pRecord: T, pRequestContext: any): Promise<T>;
    upsert(pRecord: T, pRequestContext: any): Promise<T>;
    delete(pRecord: T | number, pRequestContext: any): Promise<boolean>;
    //deletes(pQuery: SimpleQuery<T>, pRequestContext: any): Promise<boolean>;
}
