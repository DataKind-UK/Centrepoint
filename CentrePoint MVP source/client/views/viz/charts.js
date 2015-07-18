

Template.charts.rendered = function() {
	var svg = dimple.newSvg("#bar-chart", 590, 400);
	d3.tsv("/testdata/example_data.tsv", function (data) {
	  var myChart = new dimple.chart(svg, data);
	  myChart.setBounds(60, 30, 510, 305)
	  var x = myChart.addCategoryAxis("x", "Month");
	  x.addOrderRule("Date");
	  myChart.addMeasureAxis("y", "Unit Sales");
	  myChart.addSeries("Channel", dimple.plot.bar);
	  myChart.addLegend(60, 10, 510, 20, "right");
	  myChart.draw();
	});
}

Template.chartselector.localauths = function() {
  return _.uniq(FOI.find({},{fields: {"Local Authority": true}}
  ).fetch().map(function(x) {
    return x["Local Authority"];
  }), true);
}