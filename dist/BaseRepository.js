'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleQuery_1 = require("./SimpleQuery");
/**
 * Base class which serves as an example for implementing a new generic Repository
 */
class BaseRepository {
    constructor(pDataType) {
        this._DataType = pDataType;
        this._PrimaryIdentifier = 'ID' + this.dataTypeName;
        this._PrimaryGUID = 'GUID' + this.dataTypeName;
    }
    createEntity() {
        //create ORM entity from type constructor
        return new this._DataType();
    }
    createEmptyEntity() {
        return {};
    }
    /** Get the fully-qualified (table name included) field name ({table}.{field})
     * @method
    */
    nameOfField(pFieldName) {
        return this.dataTypeName + "." + pFieldName;
    }
    /** Check to see if ORM entity has field
     * @method
    */
    hasField(pFieldName) {
        return !!pFieldName;
    }
    get dataTypeName() {
        return this._DataType.name;
    }
    get primaryIdentifier() {
        return this._PrimaryIdentifier;
    }
    get primaryGUID() {
        return this._PrimaryGUID;
    }
    /** Create a new query, in context of this request and data type
     * @method
    */
    query(pRequestContext) {
        return new SimpleQuery_1.SimpleQuery(this, pRequestContext);
    }
    /** Read single record by query
     * @method
     * @returns Error if record not found.
    */
    async read(pQuery, pRequestContext) {
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
    async readByID(pIDRecord, pRequestContext) {
        if (!pIDRecord)
            return null;
        return this.query(pRequestContext)
            .where(this._PrimaryIdentifier, pIDRecord)
            .read();
    }
    /** Invoke Read by ID list (multiple) on Meadow Endpoint Instance
     * @method
    */
    async readByIDs(pIDRecords, pRequestContext) {
        if (!pIDRecords || pIDRecords.length < 1)
            return new Array();
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
    async readByGUID(pGUIDRecord, pRequestContext) {
        if (!pGUIDRecord)
            return null;
        return this.query(pRequestContext)
            .where(this.primaryGUID, pGUIDRecord)
            .read();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJlcG9zaXRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQmFzZVJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUVaLCtDQUE0QztBQUk1Qzs7R0FFRztBQUNILE1BQXNCLGNBQWM7SUFNaEMsWUFBWSxTQUF5QjtRQUVqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNuRCxDQUFDO0lBRUQsWUFBWTtRQUVSLHlDQUF5QztRQUN6QyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxpQkFBaUI7UUFFYixPQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQ7O01BRUU7SUFDRixXQUFXLENBQUMsVUFBbUI7UUFFM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUM7SUFDaEQsQ0FBQztJQUNEOztNQUVFO0lBQ0YsUUFBUSxDQUFDLFVBQWtCO1FBRXZCLE9BQU8sQ0FBQyxDQUFFLFVBQXNCLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUksWUFBWTtRQUVaLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUNELElBQUksaUJBQWlCO1FBRWpCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ25DLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFFWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVEOztNQUVFO0lBQ0YsS0FBSyxDQUFDLGVBQW9CO1FBRXRCLE9BQU8sSUFBSSx5QkFBVyxDQUFJLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7OztNQUdFO0lBQ0YsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFzQixFQUFFLGVBQW9CO1FBRW5ELE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3hELElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ2xCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOztZQUVsQixPQUFPLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQ7O01BRUU7SUFDRixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWlCLEVBQUUsZUFBb0I7UUFFbEQsSUFBSSxDQUFDLFNBQVM7WUFDVixPQUFPLElBQUksQ0FBQztRQUVoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO2FBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDO2FBQ3pDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7TUFFRTtJQUNGLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBeUIsRUFBRSxlQUFvQjtRQUUzRCxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUNwQyxPQUFPLElBQUksS0FBSyxFQUFLLENBQUM7UUFFMUIsNkVBQTZFO1FBQzdFLHdEQUF3RDtRQUV4RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO2FBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDO2FBQ3pDLEdBQUcsQ0FBQyxLQUFLLENBQUM7YUFDVixLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQ7O01BRUU7SUFDRixLQUFLLENBQUMsVUFBVSxDQUFDLFdBQW1CLEVBQUUsZUFBb0I7UUFFdEQsSUFBSSxDQUFDLFdBQVc7WUFDWixPQUFPLElBQUksQ0FBQztRQUVoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO2FBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQzthQUNwQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0NBS0o7QUF4SEQsd0NBd0hDIn0=