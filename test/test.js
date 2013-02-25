var assert = require('chai').assert,
    expect = require('chai').expect;
var simon = require('../simon.js');
var ids = [];

var testdata = [{name: "PL", age: 27},
                {name: "LL", age: 19},
                {name: "AS", age: 20},
                {name: "TS", age: 21},
                {name: "NZ", age: 22},
                {name: "MB", age: 19},
                {name: "BK", age: 18}];

describe('Post',function(){
    
    it('should insert seven new docs into collection',function(done){
        simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){
	test.post("test",testdata,function(err,docs){
            ids = [docs[0]["_id"],docs[1]["_id"], docs[2]["_id"], docs[3]["_id"], docs[4]["_id"], docs[5]["_id"], docs[6]["_id"]];
            assert.lengthOf(docs,7,'seven docs inserted');
            done();
        });    
    })
  });  
});

describe('Get',function(){
    
    it('should return seven elements',function(done){
     simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){
     	test.get("test","-",function(err,docs){
            assert.lengthOf(docs,7,'seven docs got');
            done();
        });    
	});
    });

    it('should return one element with query request',function(done){
    	simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){
	test.get("test",{name:"LL"},function(err,docs){
		    assert.lengthOf(docs,1,'one doc got');
		    done();
	    });
	    });
    });

    it('should return only age fields', function(done){
        simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){

	test.get("test","-",{age:1}, function(err,docs){
            for(var doc in docs) {
                assert.isDefined(docs[doc].age,'Age field found');
                assert.isUndefined(docs[doc].name, 'Name field not found (and it is OK)');
            }
         done();
        });
	});
    });

    it('should be sorted by age', function(done){
        simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){

	test.get("test","-",{},{age:1},function(err,docs){
            for(var i=0; i<7; i++) {
                if(i<6)
                assert(docs[i+1].age >= docs[i].age, 'Elements in good order');
            }
            done();
        });
	});
    });

});

describe('Put',function(){

    it('should change age of people',function(done){
      simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){
      test.put("test",ids[0],{name:"Lipathor",age:28},function(err,doc){
            test.put("test",ids[1],{name:"LL",age:20},function(err,doc){
                test.get("test","-",function(err,docs){
                   assert.equal(docs[0].age,20,'Age is 20');
                   assert.equal(docs[6].age,28,'Age is 28');
                   done(); 
                });
            });
        });    
    }); 
    });
});

describe('Delete',function(){

    it('should return seven docs are removed',function(done){
    simon.simon("local",{addr:"127.0.0.1",port:27017},function(test){

        test.delete("test","-",function(err,removed){
            assert.equal(removed,7,'seven docs removed');
            done();
        });    
    });
    });
});
