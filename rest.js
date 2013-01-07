/**
 * Mongodb REST library for node.js based on native mongodb driver.
 * version 0.1
 *
 * Paweł 'Lipathor' Lipka
 * pawel@lipka.net.pl || pawel@trewebs.com
 * http://lipka.net.pl || http://trewebs.com
 */

function mongoRest(db, server){
    this.mongo = require("mongodb");
    ObjectID = require("mongodb").ObjectID;
    Q = require('q');

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
    this.client = new this.mongo.Db(db,new this.mongo.Server(server.addr,server.ip,{}),{w:1});

    mongoRest.prototype.get = function(collection,id,fields,sort,pagination,callback) {
        id = id || {};
        fields = fields || {};
        sort = sort || {};
        pagination = pagination || {};
        callback = callback || function(){};

            this.client.open(function(err,p_client){
                if(err) throw err;
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
                        p_client.close(function(a,b){
                            callback(err,docs);    
                        });
                    });
                });
            });
    }
    
    mongoRest.prototype.post = function(collection,docs,callback) {
        this.client.open(function(err,p_client){
            if(err) throw err;
            p_client.collection(collection,function(err,collection){
                if(err) throw err;
                
                collection.insert(docs,function(err,docs){
                    p_client.close(function(a,b){
                        callback(err,docs);    
                    });
                });    
            })
        });
    }
    
    mongoRest.prototype.delete = function(collection,id,callback){
        id = id || '-';
        this.client.open(function(err,p_client){
            if(err) throw err;
            
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
                    p_client.close(function(a,b){
                        callback(err,removed);    
                    });
                });
            });
        });
    }
    
    mongoRest.prototype.put = function(collection,id,doc,callback) {
        this.client.open(function(err,p_client){
            if(err) throw err;
            p_client.collection(collection,function(err,collection){
                if(err) throw err;

                var find = {_id:new ObjectID(id.toString())};
                collection.update(find,doc,function(err,docs){
                    p_client.close(function(a,b){
                        callback(err,docs);    
                    });
                });    
            })
        });
    }
}

exports.mongoRest = mongoRest;
