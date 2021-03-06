function createMySQLDriver(context, options) {
    return  {
        query:function (query, parameters, id, callback) {
            var self = context;
            if (parameters instanceof Array) {
                var parametersPrepared = parameters;
            } else {
                var parametersPrepared = [parameters];
            }
            var queryPrepared = query.replace(/\$\d+/g, '?');
            options.db.query(queryPrepared, parametersPrepared, function (err, result, info) {
                if (err){
                    self.logger('query on ' + id + ':\n\ttext: ' + queryPrepared + JSON.stringify(parametersPrepared) + '\n\tfailed: ' + err);
                } else {
                    self.logger('query on ' + id + ':\n\ttext: ' + queryPrepared + '\n\tparams: ' + JSON.stringify(parametersPrepared) + '\n\treturns ' + JSON.stringify(result));
                }
                if(/^select/i.test(query)){
                    //this is select query
                    /*
                     result:[{id:1,name:'lalala1'},{id:2,name:'lalala2'},.....]
                     */
                    callback(err, {rows: result, count: result.length});
                } else {
                    //this is update/delete/insert query
                    /*
                     result:{ fieldCount: 0,
                     affectedRows: 1,
                     insertId: 4,
                     serverStatus: 2,
                     warningCount: 0,
                     message: '',
                     protocol41: true,
                     changedRows: 0 }
                     */
                    callback(err, {sql:query, changes:result.changedRows, lastID:result.insertId});
                }
            });

        },
        // gets a SQL clause to have an INSERT query return the id of the new row
        getInsertQueryText:function (table) {
            return "";
        },

        // gets the id of a new row from the result of an INSERT query
        getIdForInsert:function (table, result) {
            if (result && result.insertId)
                return result.insertId;
            return -1;
        }
    };
}

module.exports = createMySQLDriver;