/**
 * Created by Amit on 29/07/2016.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="jquery.d.ts" />
/// <reference path="jquerymobile.d.ts" />
/// <reference path="google.visualization.d.ts" />
/// <reference path="datejs.d.ts" />
/// <reference path="sugarpak.d.ts" />
/// <reference path="es6-collections.d.ts" />
$(document).ready(function () {
    google.charts.load('current', { 'packages': ['corechart'] });
    $("#slctExpenses").change(function () {
        var optionSelected = $(this).find('option:selected');
        ExpensesTracker.costs.optValueSelected = optionSelected.val();
        ExpensesTracker.costs.getCosts();
        /*switch (ExpensesTracker.costs.optValueSelected) {
            case 'thisMonth':
                ExpensesTracker.costs.getCostsThisMonth();
                break;
            case 'lastMonth':
                ExpensesTracker.costs.getCostsLastMonth();
                break;
            case 'thisYear':
                ExpensesTracker.costs.getCostsThisYear();
                break;
            case 'lastYear':
                ExpensesTracker.costs.getCostsLastYear()
                break;
            case 'betweenDates':
                break;
        }*/
    });
    $("#slctCharts").change(function () {
        var optionSelected = $(this).find('option:selected');
        var optValueSelected = optionSelected.val();
        Charts.chart = Charts.ChartFactory.createChart(optValueSelected);
        ExpensesTracker.costs.getCosts();
        /*switch (optValueSelected) {
            case 'pieChart':
                Charts.chart = Charts.ChartFactory.createChart('piechart');
                break;
            case 'columnChart':
                break;
            case 'barChart':
                break;
            case 'comboChart':
                break;
            case 'histogram':
                break;
            case 'lineChart':
                break;
            case 'areaChart':
                break;
        }*/
    });
    $('.ui-input-clear').on('click', function () {
        $('#added').html('');
    });
});
window.indexedDB = window.indexedDB ||
    //window.mozIndexedDB ||
    //window.webkitIndexedDB ||
    window.msIndexedDB;
if (!window.indexedDB) {
    console.log("The browser doesn't support IndexedDB");
}
var indxDB = {};
indxDB.openDB = function () {
    indxDB.dbOpenDBRequest = window.indexedDB.open('costs', 8);
    indxDB.dbOpenDBRequest.onerror = function (event) {
        console.log('error: ');
    };
    indxDB.dbOpenDBRequest.onsuccess = function (event) {
        indxDB.dbDatabase = indxDB.dbOpenDBRequest.result;
        console.log("success: " + indxDB.dbDatabase);
    };
    indxDB.dbOpenDBRequest.onupgradeneeded = function (event) {
        indxDB.dbDatabase = event.target.result;
        //db.dbDatabase.deleteObjectStore('costs');
        var objectStore = indxDB.dbDatabase.createObjectStore('costs', { autoIncrement: true });
        //let objectStore = db.dbDatabase.createObjectStore('costs', {keyPath: 'date'});
        //db.index = objectStore.index('date');
        objectStore.createIndex('index', 'date', { unique: false });
        console.log("creating db: " + indxDB.dbDatabase);
    };
};
indxDB.closeDB = function () {
    indxDB.dbDatabase.close();
};
indxDB.addItem = function (cost, category, date) {
    // Create a new object ready to insert into the IDB
    var newItem = [{ cost: cost, category: category, date: date }];
    // open a read/write db transaction, ready for adding the data
    var transaction = indxDB.dbDatabase.transaction(['costs'], 'readwrite');
    // report on the success of opening the transaction
    transaction.oncomplete = function (event) {
        console.log('Transaction completed: database modification finished');
    };
    transaction.onerror = function (event) {
        console.log('Transaction not opened due to error. Duplicate items not allowed');
    };
    // create an object store on the transaction
    var objectStore = transaction.objectStore('costs');
    console.log(objectStore.keyPath);
    // add our newItem object to the object store
    var objectStoreRequest = objectStore.add(newItem[0]);
    objectStoreRequest.onsuccess = function (event) {
        // report the success of our new item going into the database
        console.log('New item added to database');
    };
};
indxDB.readItem = function () {
    var transaction = indxDB.dbDatabase.transaction(['costs']);
    var objectStore = transaction.objectStore('costs');
    var request = objectStore.get('12121212');
    request.onerror = function (event) {
        console.log('readItem(): cannot find the data item');
    };
    request.onsuccess = function (event) {
        if (request.result) {
            console.log('readItem(): ' + request.result.brand + ', '
                + request.result.id + ', ' + request.result.model);
        }
        else {
            console.log('readItem(): cannot find the item');
        }
    };
};
indxDB.getCostsThisMonth = function () {
    var options = { title: 'Expenses this month' };
    var firstDay = Date.today().moveToFirstDayOfMonth();
    indxDB.getCostsBetweenDates(firstDay, Date.today(), options);
};
indxDB.getCostsLastMonth = function () {
    var options = { title: 'Expenses last month' };
    var firstDay = Date.today().last().month().moveToFirstDayOfMonth();
    var lastDay = Date.today().last().month().moveToLastDayOfMonth();
    indxDB.getCostsBetweenDates(firstDay, lastDay, options);
};
indxDB.getCostsThisYear = function () {
    var options = { title: 'Expenses this year' };
    var firstDay = Date.today().addYears(-1).moveToMonth(0, -1).moveToFirstDayOfMonth();
    indxDB.getCostsBetweenDates(firstDay, Date.today(), options);
};
indxDB.getCostsLastYear = function () {
    var options = { title: 'Expenses last year' };
    var firstDay = Date.today().addYears(-1).moveToMonth(0, -1).moveToFirstDayOfMonth();
    var lastDay = Date.today().addYears(-1).moveToMonth(11, +1).moveToLastDayOfMonth();
    indxDB.getCostsBetweenDates(firstDay, lastDay, options);
};
indxDB.getCostsBetweenDates = function (startDate, endDate, options) {
    var transaction = indxDB.dbDatabase.transaction('costs', 'readonly');
    var store = transaction.objectStore('costs');
    var index = store.index('index');
    //let results : { [key: number]: number; } = {};
    var results = new Map();
    if (endDate >= startDate) {
        var boundKeyRange = IDBKeyRange.bound(startDate, endDate);
        index.openCursor(boundKeyRange).onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                console.log('getCostsThisMonth(): cost = ' + cursor.value.cost + ' category = '
                    + cursor.value.category + ' date = ' + cursor.value.date);
                var value = results.get(cursor.value.category);
                if (value != undefined) {
                    value += parseFloat(cursor.value.cost);
                }
                else {
                    value = parseFloat(cursor.value.cost);
                }
                results.set(cursor.value.category, value);
                cursor.continue();
            }
        };
    }
    store.transaction.oncomplete = function () {
        Charts.chart.deleteChart();
        if (results.size > 0) {
            options.is3D = true;
            Charts.chart.drawChart(options, results);
        }
    };
};
indxDB.readAllItems = function () {
    var objectStore = indxDB.dbDatabase.transaction('costs').objectStore('costs');
    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            console.log('readAllItems(): cost = ' + cursor.value.cost + ' category = '
                + cursor.value.category + ' date = ' + cursor.value.date);
            cursor.continue();
        }
        else {
            console.log('readAllItems(): no more entries!');
        }
    };
    /*index.getAll().onsuccess = function(event) {
     console.log("Got all costs: " + event.target.result);

     event.target.result.forEach(r => {
     console.log('getCostsThisMonth(): cost = ' + r.cost + ' category = '
     + r.category + ' date = ' + r.date);

     let value = db.results.get(r.category);
     if(value != undefined ) {
     value += r.cost;
     }
     else {
     value = r.cost;
     }
     db.results.set(r.category, value);
     });
     };*/
};
indxDB.removeItem = function () {
    var request = indxDB.dbDatabase.transaction(['costs'], 'readwrite')
        .objectStore('costs')
        .delete('12121212');
    request.onsuccess = function (event) {
        console.log("removeItem(): the data item was removed from the database");
    };
    request.onerror = function (event) {
        console.log("removeItem(): problem with removing a data item from the database");
    };
};
indxDB.resetCosts = function () {
    var transaction = indxDB.dbDatabase.transaction('costs', 'readwrite');
    var objectStore = transaction.objectStore('costs');
    // clear all the data out of the object store
    var objectStoreRequest = objectStore.clear();
    objectStoreRequest.onsuccess = function (event) {
        // report the success of our clear operation
        console.log('Data cleared');
    };
};
var ExpensesTracker;
(function (ExpensesTracker) {
    (function (Category) {
        Category[Category["Food"] = 0] = "Food";
        Category[Category["Transportation"] = 1] = "Transportation";
        Category[Category["Clothes"] = 2] = "Clothes";
        Category[Category["Health"] = 3] = "Health";
        Category[Category["Education"] = 4] = "Education";
        Category[Category["Housing"] = 5] = "Housing";
        Category[Category["Other"] = 6] = "Other";
    })(ExpensesTracker.Category || (ExpensesTracker.Category = {}));
    var Category = ExpensesTracker.Category;
    var indexedDBCosts = (function () {
        function indexedDBCosts() {
            this.optValueSelected = 'thisMonth';
            indxDB.openDB();
        }
        indexedDBCosts.prototype.addCost = function (cost, category) {
            if (cost != 0) {
                indxDB.addItem(cost, category, Date.today());
                /*db.addItem(cost, category, Date.today().add(-1).years());

                db.addItem(cost, Category.Clothes, Date.today().add(3).months());
                db.addItem(cost, Category.Education, Date.today().add(1).months());
                db.addItem(cost, Category.Food, Date.today().add(-6).months());
                db.addItem(cost, Category.Housing, Date.today().add(3).days());           //
                db.addItem(cost, Category.Clothes, Date.today());                         //
                db.addItem(cost, Category.Education, Date.today().add(12).days());        //
                db.addItem(cost, Category.Clothes, Date.today().addYears(1));
                db.addItem(cost, Category.Education, Date.today().add(-1).days());        //*/
                $('#added').html('Sum added to ' + Category[category]);
            }
        };
        indexedDBCosts.prototype.getCosts = function () {
            switch (ExpensesTracker.costs.optValueSelected) {
                case 'thisMonth':
                    ExpensesTracker.costs.getCostsThisMonth();
                    break;
                case 'lastMonth':
                    ExpensesTracker.costs.getCostsLastMonth();
                    break;
                case 'thisYear':
                    ExpensesTracker.costs.getCostsThisYear();
                    break;
                case 'lastYear':
                    ExpensesTracker.costs.getCostsLastYear();
                    break;
                case 'betweenDates':
                    var startDate = Date.parse($('#dateFrom').val());
                    var endDate = Date.parse($('#dateTo').val());
                    ExpensesTracker.costs.getCostsBetweenDates(startDate, endDate);
                    break;
            }
        };
        indexedDBCosts.prototype.getCostsThisMonth = function () {
            try {
                indxDB.getCostsThisMonth();
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.getCostsLastMonth = function () {
            try {
                indxDB.getCostsLastMonth();
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.getCostsThisYear = function () {
            try {
                indxDB.getCostsThisYear();
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.getCostsLastYear = function () {
            try {
                indxDB.getCostsLastYear();
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.getCostsBetweenDates = function (startDate, endDate) {
            try {
                this.optValueSelected = 'betweenDates';
                var options = { title: 'Expenses between ' + startDate.toLocaleDateString() + ' and ' + endDate.toLocaleDateString() };
                indxDB.getCostsBetweenDates(startDate, endDate, options);
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.readAllItems = function () {
            try {
                indxDB.readAllItems();
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        indexedDBCosts.prototype.resetCosts = function () {
            try {
                $("#popupDialog").popup('open');
                $("#popupDialog #btnDelete").one("click.popupDialog", function () {
                    indxDB.resetCosts();
                });
            }
            catch (e) {
                alert(e.name + ' ' + e.message);
            }
        };
        return indexedDBCosts;
    }());
    var CostsFactory = (function () {
        function CostsFactory() {
        }
        CostsFactory.createCost = function (type) {
            if (type === "indexeddb") {
                return new indexedDBCosts();
            }
            return null;
        };
        return CostsFactory;
    }());
    ExpensesTracker.costs = CostsFactory.createCost('indexeddb');
})(ExpensesTracker || (ExpensesTracker = {}));
var Charts;
(function (Charts) {
    var Category = ExpensesTracker.Category;
    /*abstract class ChartFactory {
        constructor() {
            this.createChart();
        }
        abstract createChart(): IChart;
    }

    class PieChartFactory implements ChartFactory {
        createChart(): IChart {
            return new PieChart();
        }
    }*/
    var Chart = (function () {
        function Chart() {
        }
        Chart.prototype.deleteChart = function () {
            $('#chart').html('');
        };
        return Chart;
    }());
    var ColumnChart = (function (_super) {
        __extends(ColumnChart, _super);
        function ColumnChart() {
            _super.call(this);
            //google.charts.load('current', {'packages': ['corechart']});
        }
        ColumnChart.prototype.drawChart = function (options, results) {
            google.charts.setOnLoadCallback(function () {
                var arr = [
                    ["Expenses", "Cost", { role: "style" }],
                    [Category[Category.Education], 0, 'Blue'],
                    [Category[Category.Clothes], 0, 'Yellow'],
                    [Category[Category.Transportation], 0, 'Orange'],
                    [Category[Category.Health], 0, 'Green'],
                    [Category[Category.Housing], 0, 'Purple'],
                    [Category[Category.Food], 0, 'Azure'],
                ];
                results.forEach(function (value, key) {
                    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                        var a = arr_1[_i];
                        if (a[0] == Category[key]) {
                            a[1] = value;
                        }
                    }
                });
                var data = google.visualization.arrayToDataTable(arr);
                var view = new google.visualization.DataView(data);
                view.setColumns([0, 1,
                    { calc: "stringify",
                        sourceColumn: 1,
                        type: "string",
                        role: "annotation" },
                    2]);
                var opt = {
                    title: options.title,
                    /*width: 600,
                    height: 400,*/
                    bar: { groupWidth: "95%" },
                    legend: { position: "none" }
                };
                var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
                chart.draw(view, opt);
            });
        };
        return ColumnChart;
    }(Chart));
    var PieChart = (function (_super) {
        __extends(PieChart, _super);
        function PieChart() {
            _super.call(this);
            //google.charts.load('current', {'packages': ['corechart']});
        }
        PieChart.prototype.drawChart = function (options, results) {
            google.charts.setOnLoadCallback(function () {
                var arr = [
                    ['Expenses', 'How much?'],
                    [Category[Category.Education], 0],
                    [Category[Category.Clothes], 0],
                    [Category[Category.Transportation], 0],
                    [Category[Category.Health], 0],
                    [Category[Category.Housing], 0],
                    [Category[Category.Food], 0],
                ];
                results.forEach(function (value, key) {
                    for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
                        var a = arr_2[_i];
                        if (a[0] == Category[key]) {
                            a[1] = value;
                        }
                    }
                });
                /*var options = {
                 title: 'My Daily Activities'
                 };*/
                var data = google.visualization.arrayToDataTable(arr);
                var chart = new google.visualization.PieChart(document.getElementById('chart'));
                chart.draw(data, options);
            });
        };
        return PieChart;
    }(Chart));
    var ChartFactory = (function () {
        function ChartFactory() {
        }
        ChartFactory.createChart = function (type) {
            if (type === "pieChart") {
                return new PieChart();
            }
            if (type === "columnChart") {
                return new ColumnChart();
            }
            return null;
        };
        return ChartFactory;
    }());
    Charts.ChartFactory = ChartFactory;
})(Charts || (Charts = {}));
$(document).on("pagecontainerchange", function (event, ui) {
    if (ui.toPage[0].id == 'chart_container') {
        Charts.chart = Charts.ChartFactory.createChart($('#slctCharts').find('option:selected').val());
        ExpensesTracker.costs.getCosts();
    }
});
//# sourceMappingURL=costs.js.map