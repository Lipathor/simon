/**
 * SiMoN - Simple Mongodb for node.js library based on native mongodb driver.
 * version 0.2.2
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
	server.once = false;
    }
    if(db == undefined)
	db = "local";
    server.addr = server.addr || "127.0.0.1";
    server.port = server.port || 27017;
    server.once = server.once || false;
    db = db || "local";

    this.client = new this.mongo.Db(db,new this.mongo.Server(server.addr,server.port,{}),{w:1});
    self = this;
    this.client.open(function(err,p_client){
    	if(err) throw err;
	self.p_client = p_client;
	ee.emit("opened",{p_client:p_client,once:server.once});
    });
}

ee.on("opened",function(data){
	var ObjectID = require("mongodb").ObjectID;
	var Q = require('q');
	var p_client = data.p_client;
	var once = data.once;

var cruds = {};
cruds.get = function(collection,id,fields,sort,pagination,callback,doNotClose) {
        id = id || {};
	fields = fields || {};
	sort = sort || {};
	pagination = pagination || {};
	callback = callback || function(){};
	notClose = doNotClose || false;

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
			notClose = callback;
			callback = pagination;
			pagination = {};
		}

		collection.find(find,{limit: pagination.limit, skip: pagination.offset, sort: sort, fields: fields}).toArray(function(err,docs){
			callback(err,docs);
			if(data.once && !notClose) p_client.close();
		});
		
	});
}

cruds.post = function(collection,docs,callback) {
	p_client.collection(collection,function(err,collection){
        	if(err) throw err;
	        collection.insert(docs,function(err,docs){
			callback(err,docs);
			if(data.once) p_client.close();
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
			if(data.once) p_client.close();
		});
	});
}

cruds.put = function(collection,id,doc,callback) {
	p_client.collection(collection,function(err,collection){
		if(err) throw err;
		var find = {_id:ObjectID(id.toString())};
		collection.update(find,doc,function(err,docs){
			callback(err,docs);
			if(data.once) p_client.close();
		});
	})
}

cruds.close = function() {
p_client.close();
}

simon.fn(cruds);
});

exports.simon = simon;
