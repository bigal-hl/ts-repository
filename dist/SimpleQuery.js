'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleQueryData {
    constructor() {
        this.Filters = [];
        this.SelectFields = [];
        this.Joins = [];
        this.SortFields = [];
        this.Cap = 99999;
        this.Begin = 0;
    }
}
exports.SimpleQueryData = SimpleQueryData;
class SimpleQuery {
    constructor(pRepository, pRequestContext) {
        this._QueryData = new SimpleQueryData();
        this._LogEnabled = false;
        this._Repository = pRepository;
        this._RequestContext = pRequestContext;
    }
    /**
     * Pack up query definition data, prepare to be serialized.
     */
    packageQuery() {
        return this._QueryData;
    }
    /**
     * Unpackage query definition data
     */
    unpackageQuery(pRemoteQueryData) {
        this._QueryData = pRemoteQueryData;
    }
    /** Specify starting record index for paging
     * @method
    */
    begin(pBeginRecordIndex) {
        this._QueryData.Begin = pBeginRecordIndex;
        return this;
    }
    /** Specify LIMIT count
    * @method
    */
    cap(pMaxCap) {
        this._QueryData.Cap = pMaxCap;
        return this;
    }
    /** Set flag to log query
    * @method
    */
    logQuery() {
        this._LogEnabled = true;
        return this;
    }
    /**  Add field to select clause in this query
     * @method
    */
    select(pFullFieldName) {
        if (pFullFieldName.indexOf('(') < 0 && pFullFieldName.indexOf('.') < 0) {
            //if not an aggregate or qualified reference, then make it so
            this._QueryData.SelectFields.push(`${this._Repository.dataTypeName}.${pFullFieldName}`);
        }
        else {
            this._QueryData.SelectFields.push(pFullFieldName);
        }
        return this;
    }
    /**  Add field to select clause in this query (type-safe)
    * @method
    */
    selectOn(pRemoteTable, pRemoteField) {
        return this.select(`${pRemoteTable.name}.${pRemoteField}`);
    }
    joinOn(pRemoteTable, pFrom, pSourceTableOrTo, pTo, pJoinType) {
        return this._joinOn(pRemoteTable, pFrom, pSourceTableOrTo, pTo, pJoinType);
    }
    _joinOn(pRemoteTable, pFrom, pSourceTableOrTo, pTo, pJoinType) {
        if (!pJoinType)
            pJoinType = "INNER JOIN" /* INNER */;
        if (typeof (pSourceTableOrTo) == 'string') {
            //pSourceTableOrTo IS FIELD name
            pTo = pSourceTableOrTo;
            //get TABLE name
            pSourceTableOrTo = this._Repository.dataTypeName;
        }
        else if (pSourceTableOrTo.name) {
            //pSourceTableOrTo IS TABLE name
            pSourceTableOrTo = pSourceTableOrTo.name;
        }
        return this.join(pRemoteTable.name, `${pRemoteTable.name}.${pFrom}`, `${pSourceTableOrTo}.${pTo}`, pJoinType);
    }
    /**  Add join clause to this query
    * @method
    */
    join(pTableName, pFrom, pTo, pJoinType = "INNER JOIN" /* INNER */) {
        return this.joinClause({ tableName: pTableName, from: pFrom, to: pTo, type: pJoinType });
    }
    /**  Add join clause to this query
    * @method
    */
    joinClause(pJoin) {
        this._QueryData.Joins.push(pJoin);
        return this;
    }
    /**  Add ORDER BY clause to query
    * @method
    */
    sortOn(pTable, pFieldName, pDescending = false) {
        return this.sort(`${pTable.name}.${pFieldName}`, pDescending);
    }
    /**  Add ORDER BY clause to query
    * @method
    */
    sort(pFieldName, pDescending = false) {
        this._QueryData.SortFields.push({
            Column: pFieldName,
            Direction: pDescending ? 'Descending' : 'Ascending'
        });
        return this;
    }
    /**  Add where filter to this query
    * @method
    */
    whereOn(pTable, pFieldName, pValue, pOperator = "=" /* Equals */, pAndOr = 'AND', pAlias) {
        return this.where(`${pTable.name}.${pFieldName}`, pValue, pOperator, pAlias);
    }
    /**  Add where filter to this query
    * @method
    */
    where(pFieldName, pValue, pOperator = "=" /* Equals */, pAndOr = 'AND', pAlias) {
        if (Array.isArray(pValue) && pOperator == "=" /* Equals */) {
            //cannot use equals with value arrays in meadow -- fix it
            pOperator = "IN" /* IN */;
        }
        else if (Array.isArray(pValue) && pOperator == "!=" /* NOT_Equals */) {
            //cannot use equals with value arrays in meadow -- fix it
            pOperator = "NOT IN" /* NOT_IN */;
        }
        this._addFilter(pFieldName, pOperator, pValue, pAndOr, pAlias);
        return this;
    }
    /**  Open parenthesis for a WHERE clause
    * @method
    */
    beginParen(pAndOr = 'AND') {
        this._addFilter('', '(', '', pAndOr);
        return this;
    }
    /**  End parenthesis for a WHERE clause
    * @method
    */
    endParen() {
        this._addFilter('', ')', '');
        return this;
    }
    /** Read a record based on this query
    * @method
    */
    async read() {
        return this._Repository.read(this, this._RequestContext);
    }
    /** Reads (multiple) records based on this query
    * @method
    */
    async reads() {
        return this._Repository.reads(this, this._RequestContext);
    }
    /** Reads (multiple) records based on this query
    * @method
    */
    async readsLite() {
        return this._Repository.readsLite(this, this._RequestContext);
    }
    /** Count records based on this query
     * @method
    */
    async count() {
        return this._Repository.count(this, this._RequestContext);
    }
    /** Resolve if count>0, Fail otherwise (note: this method NEVER rejects)
     * @method
    */
    async exists() {
        return new Promise((resolve, reject) => {
            this._Repository.count(this, this._RequestContext)
                .then((r) => {
                return resolve(r > 0);
            })
                .catch((err) => {
                return resolve(false);
            });
        });
    }
    get hasFilters() {
        return this._QueryData.Filters.length > 0;
    }
    // match up w/ existing meadow pattern
    _addFilter(pColumn, pOperator, pValue, pConnector, pAliasParameter) {
        var tmpOperator = (typeof (pOperator) === 'undefined') ? '=' : pOperator;
        var tmpConnector = (typeof (pConnector) === 'undefined') ? 'AND' : pConnector;
        var tmpParameter = (typeof (pAliasParameter) === 'undefined') ? pColumn : pAliasParameter;
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
exports.SimpleQuery = SimpleQuery;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltcGxlUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvU2ltcGxlUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUtaLE1BQWEsZUFBZTtJQUE1QjtRQUVJLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFDYixpQkFBWSxHQUFHLEVBQUUsQ0FBQztRQUNsQixVQUFLLEdBQWdCLEVBQUUsQ0FBQztRQUN4QixlQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLFFBQUcsR0FBVyxLQUFLLENBQUM7UUFDcEIsVUFBSyxHQUFXLENBQUMsQ0FBQztJQUN0QixDQUFDO0NBQUE7QUFSRCwwQ0FRQztBQUVELE1BQWEsV0FBVztJQU9wQixZQUFZLFdBQTJCLEVBQUUsZUFBb0I7UUFKbkQsZUFBVSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDbkMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFLMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7SUFDM0MsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWTtRQUVSLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjLENBQUMsZ0JBQWlDO1FBRTVDLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7SUFDdkMsQ0FBQztJQUVEOztNQUVFO0lBQ0YsS0FBSyxDQUFDLGlCQUF5QjtRQUUzQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsQ0FBQztRQUUxQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7O01BRUU7SUFDRixHQUFHLENBQUMsT0FBZTtRQUVmLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztRQUU5QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7O01BRUU7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