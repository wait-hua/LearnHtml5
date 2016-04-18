
window.indexDB = window.indexedDB || window.webkitIndexedDB || window.msIndexedDB || window.mozIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.idbKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
window.idbCursor = window.IDBCursor || window.webkitIDBCursor || window.msIDBCursor;
var idb; //连接成功的数据库对象
function init() {
	//连接indexDB数据库
	var dbName = "messageboard";
	var dbVersion = 20160327;
	
	var dbConnet = indexDB.open(dbName, dbVersion);
	dbConnet.onsuccess = function(e) {
		idb = e.target.result;
		console.log("连接数据库成功");

		showAllData();
	};

	dbConnet.onerror = function() {
		console.log("连接数据库失败");
	};

	dbConnet.onupgradeneeded = function(e) {
		//在数据库版本更新中创建对象仓库（表），Chrome23以上版本
		idb = e.target.result;
		var tx = e.target.transaction; //版本更新事物

		var name = "Users";
		var optionalParameters = {
			keyPath: "userId",
			autoIncrement : true
		};
		//创建对象仓库
		var store = idb.createObjectStore(name, optionalParameters);
		console.log("对象仓库创建成功");

		var indexName = "usernameIndex";
		var keyPath = 'userName';
		var indexOptionalParameters = {
			unique : false,
			multiEntry : false
		};
		var idx = store.createIndex(indexName, keyPath, indexOptionalParameters);
		console.log("索引创建成功");

	}

}

function saveData() {
	//数据插入数据库
	var mode = IDBTransaction.READ_WRITE;
	
	var storeName = ['Users'];
	//开启读写事物
	var td = idb.transaction(storeName, "readwrite");
	var store = td.objectStore(storeName);

	var name = document.getElementById("name").value;
	var message = document.getElementById("mes").value;

	var saveReq = store.put({userName:name, mes:message});
	saveReq.onsuccess = function() {
		console.log("保存数据成功");
		showAllData();
	};
	saveReq.onerror = function() {
		console.log("保存数据失败");
	};
}

function showAllData() {
	//先清除表内容，再全部展示
	clearTable();
	var tx = idb.transaction(['Users'],"readonly");
	var store = tx.objectStore(['Users']);
	var range = idbKeyRange.lowerBound(1);
	var direction = IDBCursor.NEXT;
	//设置游标遍历数据库中所有的数据
	var req = store.openCursor(range, direction);
	req.onsuccess = function() {
		var cursor = this.result; //检索成功result对象保存了当前游标指向的数据记录
		if(cursor) {
			console.log("检索到一条数据"+cursor.value.mes);
			showData(cursor.value);
			cursor.continue();
		}else {
			console.log("检索结束");
		}
	};
	req.onerror = function() {
		console.log("检索数据失败");
	}
}

function showData(data) {
	var tab = document.getElementById("tb");
	var tr = document.createElement("tr");
	var td1 = document.createElement("td");
	td1.innerHTML = data.userName;
	var td2 = document.createElement("td");
	td2.innerHTML = data.mes;

	tr.appendChild(td1);
	tr.appendChild(td2);
	tb.appendChild(tr);
}

function clearTable() {
	var tb = document.getElementById("tb");
	for(var i=tb.childNodes.length-1; i>=0; i--) {
		tb.removeChild(tb.childNodes[i]);
	}
	var tr = document.createElement("tr");
	var th1 = document.createElement("th");
	th1.innerHTML = "姓名";
	var th2 = document.createElement("th");
	th2.innerHTML = "留言";
	tr.appendChild(th1);
	tr.appendChild(th2);
	tb.appendChild(tr);
}

function deleteData() {
	var del_name = document.getElementById("del_name").value;
	var tx = idb.transaction(['Users'], "readwrite");
	var store = tx.objectStore(['Users']);
	var range = IDBKeyRange.lowerBound(1);
	var direction = IDBCursor.NEXT;
	var searReq = store.openCursor(range,direction);
	searReq.onsuccess = function() {
		var cursor = this.result;
		if(cursor) {
			console.log("名字:"+cursor.value.userName);
			if(cursor.value.userName == del_name) {
				id = cursor.value.userId;
				console.log("找到id:"+id);
				var req = store.delete(id);  //根据Primay key(userId)键值删除
				req.onsuccess = function(){
					console.log("成功删除一条数据");
				};
				req.onerror = function() {
					console.log("删除数据失败");
				};
			} else {
				cursor.continue();
			}
		}
	};
	searReq.onerror = function(){
		console.log("数据不存在");
	}	

	showAllData();			
}
