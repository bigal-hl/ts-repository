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
    select(pFullFieldName, pAlias) {
        if (pFullFieldName.indexOf('(') < 0 && pFullFieldName.indexOf('.') < 0) {
            //if not an aggregate or qualified reference, then make it so
            this._QueryData.SelectFields.push([`${this._Repository.dataTypeName}.${pFullFieldName}`, pAlias]);
        }
        else {
            this._QueryData.SelectFields.push([pFullFieldName, pAlias]);
        }
        return this;
    }
    /**  Add field to select clause in this query (type-safe)
     * @method
     */
    selectOn(pRemoteTable, pRemoteField, pAlias) {
        return this.select(`${pRemoteTable.name}.${pRemoteField}`, pAlias);
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
        else if (Array.isArray(pValue) && (pOperator == "!=" /* NOT_Equals */ || pOperator == "NOT IN" /* NOT_IN */)) {
            if (!pValue.length) {
                //if there is nothing in the list, then ignore the parameter
                return this;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2ltcGxlUXVlcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvU2ltcGxlUXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUtaO0lBQUE7UUFFSSxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFDbEIsVUFBSyxHQUFnQixFQUFFLENBQUM7UUFDeEIsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixRQUFHLEdBQVcsS0FBSyxDQUFDO1FBQ3BCLFVBQUssR0FBVyxDQUFDLENBQUM7SUFDdEIsQ0FBQztDQUFBO0FBUkQsMENBUUM7QUFFRDtJQU9JLFlBQVksV0FBMkIsRUFBRSxlQUFvQjtRQUpuRCxlQUFVLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNuQyxnQkFBVyxHQUFHLEtBQUssQ0FBQztRQUsxQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztJQUMzQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBRVIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxnQkFBaUM7UUFFNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O01BRUU7SUFDRixLQUFLLENBQUMsaUJBQXlCO1FBRTNCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLGlCQUFpQixDQUFDO1FBRTFDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7TUFFRTtJQUNGLEdBQUcsQ0FBQyxPQUFlO1FBRWYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO1FBRTlCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7TUFFRTtJQUNGLFFBQVE7UUFFSixJQUFJLENB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