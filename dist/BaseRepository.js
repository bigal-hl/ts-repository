'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SimpleQuery_1 = require("./SimpleQuery");
/**
 * Base class which serves as an example for implementing a new generic Repository
 */
class BaseRepository {
    constructor(pDataType) {
        this._DataType = pDataType;
        this._DataTypeName = this._DataType.name;
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
        return this._DataTypeName;
    }
    get primaryIdentifier() {
        return 'ID' + this._DataTypeName;
    }
    get primaryGUID() {
        return 'GUID' + this._DataTypeName;
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
            .where(this.primaryIdentifier, pIDRecord)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJlcG9zaXRvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zb3VyY2UvQmFzZVJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOztBQUVaLCtDQUE0QztBQUk1Qzs7R0FFRztBQUNILE1BQXNCLGNBQWM7SUFLaEMsWUFBWSxTQUF5QjtRQUVqQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQzdDLENBQUM7SUFFRCxZQUFZO1FBRVIseUNBQXlDO1FBQ3pDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUVELGlCQUFpQjtRQUViLE9BQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7TUFFRTtJQUNGLFdBQVcsQ0FBQyxVQUFtQjtRQUUzQixPQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQztJQUNoRCxDQUFDO0lBQ0Q7O01BRUU7SUFDRixRQUFRLENBQUMsVUFBa0I7UUFFdkIsT0FBTyxDQUFDLENBQUUsVUFBc0IsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBRVosT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFJLGlCQUFpQjtRQUVqQixPQUFPLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3JDLENBQUM7SUFDRCxJQUFJLFdBQVc7UUFFWCxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7TUFFRTtJQUNGLEtBQUssQ0FBQyxlQUFvQjtRQUV0QixPQUFPLElBQUkseUJBQVcsQ0FBSSxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7TUFHRTtJQUNGLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBc0IsRUFBRSxlQUFvQjtRQUVuRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN4RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUNsQixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7WUFFbEIsT0FBTyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQUVEOztNQUVFO0lBQ0YsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFpQixFQUFFLGVBQW9CO1FBRWxELElBQUksQ0FBQyxTQUFTO1lBQ1YsT0FBTyxJQUFJLENBQUM7UUFFaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQzthQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQzthQUN4QyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQ7O01BRUU7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLFVBQXlCLEVBQUUsZUFBb0I7UUFFM0QsSUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUM7WUFDcEMsT0FBTyxJQUFJLEtBQUssRUFBSyxDQUFDO1FBRTFCLDZFQUE2RTtRQUM3RSx3REFBd0Q7UUFFeEQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQzthQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQzthQUN6QyxHQUFHLENBQUMsS0FBSyxDQUFDO2FBQ1YsS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUVEOztNQUVFO0lBQ0YsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFtQixFQUFFLGVBQW9CO1FBRXRELElBQUksQ0FBQyxXQUFXO1lBQ1osT0FBTyxJQUFJLENBQUM7UUFFaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQzthQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7YUFDcEMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztDQUtKO0FBdEhELHdDQXNIQyJ9