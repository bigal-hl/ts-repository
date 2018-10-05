'use strict'
import {IRepository} from './IRepository'

type constructor<Z> = new()=>Z;

export class SimpleQueryData
{
    Filters = [];
    SelectFields = [];
    Joins: Array<Join> = [];
    SortFields = [];
    Cap: number = 99999;
    Begin: number = 0;
}

export class SimpleQuery<T>
{
    protected _Repository: IRepository<T>;
    protected _QueryData = new SimpleQueryData();
    protected _LogEnabled = false;
    protected _RequestContext;

    constructor(pRepository: IRepository<T>, pRequestContext: any)
    {
        this._Repository = pRepository;
        this._RequestContext = pRequestContext;
    }

    /**
     * Pack up query definition data, prepare to be serialized.
     */
    packageQuery() : SimpleQueryData
    {
        return this._QueryData;
    }

    /**
     * Unpackage query definition data
     */
    unpackageQuery(pRemoteQueryData: SimpleQueryData)
    {
        this._QueryData = pRemoteQueryData;
    }

    /** Specify starting record index for paging
     * @method
    */
    begin(pBeginRecordIndex: number) : SimpleQuery<T>
    {
        this._QueryData.Begin = pBeginRecordIndex;

        return this;
    }

    /** Specify LIMIT count
    * @method
    */
    cap(pMaxCap: number) : SimpleQuery<T>
    {
        this._QueryData.Cap = pMaxCap;

        return this;
    }

    /** Set flag to log query
    * @method
    */
    logQuery() : SimpleQuery<T>
    {
        this._LogEnabled = true;
        return this;
    }
    
    /**  Add field to select clause in this query
     * @method
    */
    select(pFullFieldName: string): SimpleQuery<T>
    {
        if (pFullFieldName.indexOf('(')<0 && pFullFieldName.indexOf('.')<0)
        {
            //if not an aggregate or qualified reference, then make it so
            this._QueryData.SelectFields.push(`${this._Repository.dataTypeName}.${pFullFieldName}`);
        }
        else
        {
            this._QueryData.SelectFields.push(pFullFieldName);
        }
        return this;
    }

    /**  Add field to select clause in this query (type-safe)
    * @method
    */
    selectOn<ORM>(pRemoteTable: constructor<ORM>, pRemoteField: keyof ORM): SimpleQuery<T>
    {
        return this.select(`${pRemoteTable.name}.${pRemoteField}`);
    }

    /**  Add join clause to this query (type-safe)
    * @method
    */
    joinOn<ORM,ORMSource>(pRemoteTable: constructor<ORM>, pFrom: keyof ORM, pSourceTable: constructor<ORMSource>, pTo: keyof ORMSource, pJoinType?: JoinType): SimpleQuery<T>;
    joinOn<ORM>(pRemoteTable: constructor<ORM>, pFrom: keyof ORM, pTo: keyof T, pJoinType?: JoinType): SimpleQuery<T>;
    joinOn<ORM,ORMSource>(pRemoteTable: constructor<ORM>, pFrom: keyof ORM, pSourceTableOrTo: string | constructor<ORMSource> | keyof ORMSource, pTo: keyof ORMSource, pJoinType?: JoinType): SimpleQuery<T>
    {
        return this._joinOn(pRemoteTable, pFrom, pSourceTableOrTo, pTo, pJoinType);
    }

    protected _joinOn<ORM,ORMSource>(pRemoteTable: constructor<ORM>, pFrom: keyof ORM, pSourceTableOrTo: string | constructor<ORMSource> | keyof ORMSource, pTo: keyof ORMSource, pJoinType?: JoinType): SimpleQuery<T>
    {
        if (!pJoinType) pJoinType = JoinType.INNER;
        if (typeof (pSourceTableOrTo) == 'string')
        {
            //pSourceTableOrTo IS FIELD name
            pTo = <any>pSourceTableOrTo;
            //get TABLE name
            pSourceTableOrTo = this._Repository.dataTypeName;
        }
        else if ((<any>pSourceTableOrTo).name)
        {
            //pSourceTableOrTo IS TABLE name
            pSourceTableOrTo = (<any>pSourceTableOrTo).name;
        }

        return this.join(pRemoteTable.name, `${pRemoteTable.name}.${pFrom}`, `${pSourceTableOrTo}.${pTo}`, pJoinType);
    }

    /**  Add join clause to this query
    * @method
    */
    join(pTableName: string, pFrom: string, pTo: string, pJoinType: JoinType = JoinType.INNER): SimpleQuery<T>
    {
        return this.joinClause({tableName: pTableName, from: pFrom, to: pTo, type: pJoinType});
    }

    /**  Add join clause to this query
    * @method
    */
    joinClause(pJoin: Join): SimpleQuery<T>
    {
        this._QueryData.Joins.push(pJoin);

        return this;
    }

    /**  Add ORDER BY clause to query
    * @method
    */
    sortOn<ORM>(pTable: constructor<ORM>, pFieldName: keyof ORM, pDescending = false): SimpleQuery<T>
    {
        return this.sort(`${pTable.name}.${pFieldName}`, pDescending);
    }

    /**  Add ORDER BY clause to query
    * @method
    */
    sort(pFieldName: string | keyof T, pDescending = false): SimpleQuery<T>
    {
        this._QueryData.SortFields.push({
            Column: pFieldName,
            Direction: pDescending ? 'Descending' : 'Ascending'
            });
        
        return this;
    }

    /**  Add where filter to this query
    * @method
    */
    whereOn<ORM>(pTable: constructor<ORM>, pFieldName: keyof ORM, pValue: string | number | Date | Array<string> | Array<number>, pOperator: Operator = Operator.Equals, pAndOr: string = 'AND', pAlias?: string): SimpleQuery<T>
    {
        return this.where(`${pTable.name}.${pFieldName}`, pValue, pOperator, pAlias);
    }

    /**  Add where filter to this query
    * @method
    */
    where(pFieldName: string | keyof T, pValue: string | number | Date | Array<string> | Array<number>, pOperator: Operator = Operator.Equals, pAndOr: string = 'AND', pAlias?: string) : SimpleQuery<T>
    {
        if (Array.isArray(pValue) && pOperator == Operator.Equals)
        {
            //cannot use equals with value arrays in meadow -- fix it
            pOperator = Operator.IN;
        }
        else if (Array.isArray(pValue) && pOperator == Operator.NOT_Equals)
        {
            //cannot use equals with value arrays in meadow -- fix it
            pOperator = Operator.NOT_IN;
        }

        this._addFilter(pFieldName, pOperator, pValue, pAndOr, pAlias);

        return this;
    }

    /**  Open parenthesis for a WHERE clause
    * @method
    */
    beginParen(pAndOr: string = 'AND') : SimpleQuery<T>
    {
        this._addFilter('', '(', '', pAndOr);

        return this;
    }

    /**  End parenthesis for a WHERE clause
    * @method
    */
    endParen() : SimpleQuery<T>
    {
        this._addFilter('', ')', '');

        return this;
    }

    /** Read a record based on this query
    * @method
    */
    async read(): Promise<T>
    {
        return this._Repository.read(this, this._RequestContext);
    }

    /** Reads (multiple) records based on this query
    * @method
    */
    async reads(): Promise<Array<T>>
    {
        return this._Repository.reads(this, this._RequestContext);
    }

    /** Reads (multiple) records based on this query
    * @method
    */
    async readsLite(): Promise<Array<T>>
    {
        return this._Repository.readsLite(this, this._RequestContext);
    }

    /** Count records based on this query
     * @method
    */
    async count(): Promise<number>
    {
        return this._Repository.count(this, this._RequestContext);
    }

    /** Resolve if count>0, Fail otherwise (note: this method NEVER rejects)
     * @method
    */
    async exists(): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject)=>
        {
            this._Repository.count(this, this._RequestContext)
                .then((r)=>
                {
                    return resolve(r>0);
                })
                .catch((err)=>
                {
                    return resolve(false);
                });
        });
    }

    get hasFilters()
    {
        return this._QueryData.Filters.length>0;
    }

    // match up w/ existing meadow pattern
    protected _addFilter(pColumn, pOperator, pValue, pConnector?, pAliasParameter?)
    {
        var tmpOperator = (typeof(pOperator) === 'undefined') ? '=' : pOperator;
        var tmpConnector = (typeof(pConnector) === 'undefined') ? 'AND' : pConnector;
        var tmpParameter = (typeof(pAliasParameter) === 'undefined') ? pColumn : pAliasParameter;

        //support table.field notation (mysql2 requires this)
        tmpParameter = tmpParameter.replace('.', '_');

        this._QueryData.Filters.push({
            Column: pColumn,
            Operator: tmpOperator,
            Value: pValue,
            Connector: tmpConnector,
            Parameter: tmpParameter
        });
    }
}
