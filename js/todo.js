var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
if ('webkitIndexedDB' in window) {
	window.IDBTransaction = window.webkitIDBTransaction;
	window.IDBKeyRange = window.webkitIDBKeyRange;
}
var gtugruhr = {};
gtugruhr.indexedDB = {};
gtugruhr.indexedDB.db = null;
gtugruhr.indexedDB.open = function(){
	var request = indexedDB.open("todos");
	request.onsuccess = function(e){
		var v = "1.0";
		gtugruhr.indexedDB.db = e.target.result;
		var db = gtugruhr.indexedDB.db;
		if(v != db.version){
			var setVrequest = db.setVersion(v);
			setVrequest.onfailure = gtugruhr.indexedDB.onerror;
			setVrequest.onsuccess = function(e){
				var store = db.createObjectStore("todo",
						{keyPath: "timestamp"});
				gtugruhr.indexedDB.getAllTodoItems();
			};
		}
		gtugruhr.indexedDB.getAllTodoItems();
	};
	request.onfailure = gtugruhr.indexedDB.onerror;
};
gtugruhr.indexedDB.addTodo = function(todoText){
	var db = gtugruhr.indexedDB.db;
	var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
	var store = trans.objectStore("todo");
	var request = store.put({
			"text": todoText,
			"timeStamp": new Date().getTime()
			});
	request.onsuccess = function(e){
		gtugruhr.indexedDB.getAllTodoItems();
	};
	request.onerror = function(e){
		console.log(e.value);
	};
};
gtugruhr.indexedDB.getAllTodoItems = function(){
	var todos = document.getElementById("todoItems");
	todos.inerHTML = "";
	var db = gtugruhr.indexedDB.db;
	var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
	var store = trans.objectStore("todo");
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = store.openCursor(keyRange);
	cursorRequest.onsuccess = function(e){
		var result = e.target.result;
		if(!!result == false)
			return;
		renderTodo(result.value);
		result.continue();
	};
	cursorRequest.onerror = gtugruhr.indexedDB.onerror;
};
function renderTodo(row){
	var todoItems = document.getElementById("todoItems");
	var li = document.createElement("li");
	var t = document.createTextNode();
	t.data = row.text;
	li.appendChild(t);
	todoItems.appendChild(li);
}
function addTodo() {
	var todo = document.getElementById('todo-item');
	gtugruhr.indexedDB.addTodo(todo.value);
	todo.value = '';
}
function init(){
	gtugruhr.indexedDB.open();
}
$(document).ready(function(){
		init();
		});
