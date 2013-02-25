/**
 * SiMoN - Simple Mongodb for node.js library based on native mongodb driver.
 * version 0.1
 *
 * Paweł 'Lipathor' Lipka
 * pawel@lipka.net.pl || pawel@trewebs.com
 * http://lipka.net.pl || http://trewebs.com
 */

var ee = new (require('events').EventEmitter);



function simon(db, server,fn){
    this.mongo = require("mongodb");
	simon.fn = fn || function(){};
    if(server == undefined){
        server = {};
        server.addr = "127.0.0.1";
        server.ip = 27017;
    }
    if(db == undefined)
        db = "local";
    server.addr = server.addr || "127.0.0.1";
    server.port = server.port || 27017;
    db = db || "local";
    this.client = new this.mongo.Db(db,new this.mongo.Server(server.addr,server.port,{}),{w:1});
    

    this.client.open(function(err,p_client){
    if(err) throw err;
    ee.emit("opened",p_client);
 });
}

ee.on("opened",function(p_client){
var ObjectID = require("mongodb").ObjectID;
var Q = require('q');

var cruds = {};
cruds.get = function(collection,id,fields,sort,pagination,callback) {
        id = id || {};
	fields = fields || {};
	sort = sort || {};
	pagination = pagination || {};
	callback = callback || function(){};

	p_client.collection(collection,function(err, collection){
		if(err) throw err;
		var find;
		
		if(typeof(id) == "object") {
			find = id;
		}
		
		else if(id == "-"){
			find = {}
		}
																													                    else {
			find = {_id:new ObjectID(id)};
		}
	
		if(typeof(fields) == "function") {
			callback = fields;
			fields = {};
			sort = {};
			pagination = {};
		}

		if(typeof(sort) == "function") {
			callback = sort;
			sort = {};
			pagination = {};
		}
	
		if(typeof(pagination) == "function") {
			callback = pagination;
			pagination = {};
		}

		collection.find(find,{limit: pagination.limit, skip: pagination.offset, sort: sort, fields: fields}).toArray(function(err,docs){
			callback(err,docs);
		});
	});
}

cruds.post = function(collection,docs,callback) {
     p_client.collection(collection,function(err,collection){
	if(err) throw err;
	collection.insert(docs,function(err,docs){
		callback(err,docs);
	});
    })
}

cruds.delete = function(collection,id,callback){
        id = id || '-';
        p_client.collection(collection,function(err,collection){
		if(err) throw err;
	        var find;
		if(id == '-')
		find = {};
		else if(typeof(id) == "object")
		find = id;
		else
		find = {_id:new ObjectID(id)};
		collection.remove(find,function(err,removed){
			callback(err,removed);
		});
	});
}

cruds.put = function(collection,id,doc,callback) {
	p_client.collection(collection,function(err,collection){
		if(err) throw err;
		var find = {_id:ObjectID(id.toString())};
		collection.update(find,doc,function(err,docs){
			callback(err,docs);
		});
	})
}

simon.fn(cruds);
});

exports.simon = simon;
