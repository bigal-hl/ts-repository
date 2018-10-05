import 'mocha';
import {TestRepository, TestObject} from './example'
import * as chai from 'chai';

const expect = chai.expect;

describe('Repository initialization', () => {
    const testRepo = new TestRepository(TestObject);

    describe('Repository instance', () => {
        it('should define name of data type', () => {
            expect(testRepo.dataTypeName).to.eq('TestObject');
        });
        it('should define primary identifiers', () => {
            expect(testRepo.primaryIdentifier).to.eq('IDTestObject');
            expect(testRepo.primaryGUID).to.eq('GUIDTestObject');
        });
    });
    describe('Repository query', () => {
        let query = testRepo.query(null);
        it('should be able to create a query object', () => {
            expect(query).to.not.be.an('null');
        });
        it('should be able to add filters to query', () => {
            query.whereOn(TestObject, 'Name', 'Test 1');
            expect(query.packageQuery().Filters.length).to.be.gt(0);
            expect(query.packageQuery().Filters[0]).to.deep.eq({
                  "Column": "TestObject.Name",
                  "Connector": "AND",
                  "Operator": "=",
                  "Parameter": "TestObject_Name",
                  "Value": "Test 1"
                });
        });
        it('should be able to query and return a record', async() => {
            //read a single record
            let record = await query.read();

            expect(record).to.deep.eq({
                IDTestObject: 1,
                GUIDTestObject: '001',
                Name: 'Test 1'
            });
        });
        it('should be able to query and return a record, with fluent syntax', async() => {
            //read a single record
            let record = await testRepo.query(null)
                .whereOn(TestObject, 'Name', 'Test 1')
                .read();
            
            expect(record).to.deep.eq({
                IDTestObject: 1,
                GUIDTestObject: '001',
                Name: 'Test 1'
            });
        });
    });
});
