import {SimpleQuery,BaseRepository} from '../source/index'

//An example ORM object
export class TestObject
{
    IDTestObject: number;
    GUIDTestObject: string;
    Name: string;
}

//An example Repository
export class TestRepository<T> extends BaseRepository<T>
{
    async reads(pQuery: SimpleQuery<T>, pRequest: any): Promise<Array<T>>
    {
        let queryDefinition = pQuery.packageQuery();
        if (queryDefinition.Filters.length > 0 &&
            queryDefinition.Filters[0].Column == 'TestObject.Name' &&
            queryDefinition.Filters[0].Value == 'Test 1')
        {
            return Promise.resolve(<any>[
            {
                IDTestObject: 1,
                GUIDTestObject: '001',
                Name: 'Test 1'
            }]);
        }
        else
        {
            return Promise.resolve([]);
        }
    }
    async readsLite(pQuery: SimpleQuery<T>, pRequest: any): Promise<Array<T>>
    {
        //console.log(pQuery.packageQuery());
        return [];
    }
    async count(pQuery: SimpleQuery<T>, pRequest: any): Promise<number>
    {
        //console.log(pQuery.packageQuery());
        return 0;
    }
}