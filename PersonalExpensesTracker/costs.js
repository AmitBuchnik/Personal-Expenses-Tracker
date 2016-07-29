/**
 * Created by Amit on 29/07/2016.
 */
$(document).ready(function () {
});
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
    var Costs = (function () {
        function Costs() {
        }
        /*The getCosts method should return an array that holds the total cost in each one of the categories.
        The addCost should get a cost + category and add it.
        The resetCosts should delete all costs currently stored in the web browser.*/
        Costs.prototype.addCost = function (cost, category) {
            if (cost != 0) {
                this.cost = cost;
                this.category = category;
            }
            //alert(Category[category]);
        };
        Costs.prototype.getCosts = function () {
        };
        Costs.prototype.resetCosts = function () {
        };
        return Costs;
    }());
    ExpensesTracker.Costs = Costs;
    ExpensesTracker.costs = new Costs();
})(ExpensesTracker || (ExpensesTracker = {}));
var PieChart;
(function (PieChart) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
        var data = google.visualization.arrayToDataTable([
            ['Task', 'Hours per Day'],
            ['Work', 11],
            ['Eat', 2],
            ['Commute', 2],
            ['Watch TV', 2],
            ['Sleep', 7]
        ]);
        var options = {
            title: 'My Daily Activities'
        };
        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
    }
})(PieChart || (PieChart = {}));
//# sourceMappingURL=costs.js.map