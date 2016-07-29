/**
 * Created by Amit on 29/07/2016.
 */
$(document).ready (function () {


});

module ExpensesTracker
{
    export enum Category {
        Food,
        Transportation,
        Clothes,
        Health,
        Education,
        Housing,
        Other
    }

    export class Costs {
        private cost:number;
        private category:Category;

        constructor() {
        }

        /*The getCosts method should return an array that holds the total cost in each one of the categories.
        The addCost should get a cost + category and add it.
        The resetCosts should delete all costs currently stored in the web browser.*/

        addCost(cost: number, category: Category):void {
            if(cost != 0) {
                this.cost = cost;
                this.category = category;
            }

            //alert(Category[category]);
        }

        getCosts() {

        }

        resetCosts() {

        }
    }

    export var costs = new Costs();
}

module PieChart {
    google.charts.load('current', {'packages': ['corechart']});
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
}