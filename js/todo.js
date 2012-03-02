var gtugruhr = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;
if ('webkitIndexedDB' in window) {
	window.IDBTransaction = window.webkitIDBTransaction;
	window.IDBKeyRange = window.webkitIDBKeyRange;
}
gtugruhr.indexedDB = {};
gtugruhr.indexedDB.db = null;
gtugruhr.indexedDB.onerror = function(e) {
	console.log(e);
};
gtugruhr.indexedDB.open = function() {
	var request = indexedDB.open("todos");
	request.onsuccess = function(e) {
		var v = "1.99";
		gtugruhr.indexedDB.db = e.target.result;
		var db = gtugruhr.indexedDB.db;
		// We can only create Object stores in a setVersion transaction;
		if (v!= db.version) {
			var setVrequest = db.setVersion(v);
			// onsuccess is the only place we can create Object Stores
			setVrequest.onerror = gtugruhr.indexedDB.onerror;
			setVrequest.onsuccess = function(e) {
				if(db.objectStoreNames.contains("todo")) {
					db.deleteObjectStore("todo");
				}
				var store = db.createObjectStore("todo",
						{keyPath: "timeStamp"});
				gtugruhr.indexedDB.getAllTodoItems();
			};
		}
		else {
			gtugruhr.indexedDB.getAllTodoItems();
		}
	};
	request.onerror = gtugruhr.indexedDB.onerror;
}
gtugruhr.indexedDB.addTodo = function(todoText) {
	var db = gtugruhr.indexedDB.db;
	var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
	var store = trans.objectStore("todo");
	if(!todoText) return;
	var data = {
		"text": todoText,
		"timeStamp": new Date().getTime()
	};
	var request = store.put(data);
	request.onsuccess = function(e) {
		gtugruhr.indexedDB.getAllTodoItems();
	};
	request.onerror = function(e) {
		console.log("Error Adding: ", e);
	};
};
gtugruhr.indexedDB.getAllTodoItems = function() {
	var todos = document.getElementById("todoItems");
	todos.innerHTML = "";
	var db = gtugruhr.indexedDB.db;
	var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
	var store = trans.objectStore("todo");
	// Get everything in the store;
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = store.openCursor(keyRange);
	cursorRequest.onsuccess = function(e) {
		var result = e.target.result;
		if(!!result == false)
			return;
		renderTodo(result.value);
		result.continue();
	};
	cursorRequest.onerror = gtugruhr.indexedDB.onerror;
};
function renderTodo(row) {
	var todos = document.getElementById("todoItems");
	var li = document.createElement("li");
	var t = document.createTextNode(row.text);
	li.appendChild(t);
	todos.appendChild(li)
}
function addTodo() {
	var todo = document.getElementById("todo");
	gtugruhr.indexedDB.addTodo(todo.value);
	todo.value = "";
}
function init() {
	gtugruhr.indexedDB.open();
}
window.addEventListener("DOMContentLoaded", init, false);
