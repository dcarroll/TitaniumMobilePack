var platform = Ti.Platform.osname;

//A window object which will be associated with the stack of windows
exports.ListWindow = function(args) {
	var AddWindow = require('ui/AddWindow').AddWindow;
	var self = Ti.UI.createWindow(args);
	var tableview = Ti.UI.createTableView();
	var isDone = args.isDone;
	
	getTableData(isDone, function(tdata) {
		tableview.setData(tdata);
	});
	// Need to add a special 'add' button in the 'Todo' window for Mobile Web
	if (isDone || platform !== 'mobileweb') {
		self.add(tableview);
	}
	
	if (!isDone) {
		if (platform !== 'android') {
			var addBtn = Ti.UI.createButton({
				title:'+'
			});
			addBtn.addEventListener('click', function() {
				new AddWindow().open();
			});
			if (platform === 'mobileweb') {
				self.layout = 'vertical';
				addBtn.height = 40;
				addBtn.width = 40;
				addBtn.top = 0;
				addBtn.right = 10;
				self.add(addBtn);
				self.add(tableview);
			}
			else{
				self.rightNavButton = addBtn;
			}
		}
	}
	
	tableview.addEventListener('click', function(e) {
		createConfirmDialog(e.row.id, e.row.title, isDone).show();
	});
	
	Ti.App.addEventListener('app:updateTables', function(e) {
		var tv = tableview;
		getTableData(isDone, function(tdata) {
			tv.setData(tdata);
		});
	});
	
	return self;
};

var getTableData = function(done, callback) {
	var db = require('db');
	
	db.selectItems(done, function(results) {
		var data = [];
		var row = null;
		_(results).each(function(item) {
			row = Ti.UI.createTableViewRow({
				id: item.id,
				title: item.item,
				color: '#000',
				font: {
					fontWeight: 'bold'	
				}
			});
			data.push(row);
		});
		callback(data);
	});
};

var createConfirmDialog = function(id, title, isDone) {
	var db = require('db');
	var buttons, doneIndex, clickHandler;
	
	if (isDone) {
		buttons = ['Delete', 'Cancel'];	
		clickHandler = function(e) {
			if (e.index === 0) {
				db.deleteItem(id, "Todo__c", function(result) {
					Ti.App.fireEvent('app:updateTables');
				});
			}
		};
	} else {
		buttons = ['Done', 'Delete', 'Cancel'];
		clickHandler = function(e) {
			if (e.index === 0) {
				db.updateItem(id, 1, "Todo__c", function(result) {
					Ti.App.fireEvent('app:updateTables');
				});
			} else if (e.index === 1) {
				db.deleteItem(id, "Todo__c", function(result) {
					Ti.App.fireEvent('app:updateTables');
				});
			}
		};
	}
	
	var confirm = Ti.UI.createAlertDialog({
		title: 'Change Task Status',
		message: title,
		buttonNames: buttons
	});
	confirm.addEventListener('click', clickHandler);
	
	return confirm;
};

