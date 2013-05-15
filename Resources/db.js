/* This is a modification of the API for this app to use the ForceTK library
 * for data access. Everything is changed to handle the asynchronous API calls.
 */
exports.selectItems = function(_done, callback) {
	globals.client.query("Select Id, Name, Done__c From Todo__c Where Done__c = " + _done, 
		function(result) {
			var retData = [];
			_(result.records).each(function(record) {
				retData.push({item:record.Name, id:record.Id});
			});
			callback(retData);
		}, 
		function(error) {
			Ti.API.debug("Error: " + JSON.stringify(error));
		}
	);
};

exports.updateItem = function(_id, _done, objectname, callback) { 
	globals.client.update(objectname, _id, { Done__c:_done }, callback);
};

exports.addItem = function(_item, objectname, callback) {
	globals.client.create(objectname, { Name:_item }, callback);
};

exports.deleteItem = function(_id, objectname, callback) {
	globals.client.del(objectname, _id, callback);
};