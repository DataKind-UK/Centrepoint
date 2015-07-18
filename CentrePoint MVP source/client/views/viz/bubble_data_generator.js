bubbleDataGenerator = function(){
	var age_range = Session.get('age_range');
	var age_ranges = ['16-24','16-17','18-20'];
	var year = Session.get('year');
	var year_start = 2012;
	var year_end = 2014;
    var p1eData = P1E.find({});
    
    var jsonArray = [];

 	p1eData.forEach(function(local_auth){
 		var la_object= {};
 		la_object['la_name'] = local_auth["Laname"];
 		la_object['id'] = local_auth["ONS Code"];
 		var all_totals={};
 		age_ranges.forEach(function(age){
 			la_object[age+" all"] =0;
 		});
 		for (var i = year_start; i <= year_end; i++) {
 			
 			age_ranges.forEach(function(age){
 				var year_total = 0;
 				for (var quarter = 1; quarter <= 4; quarter++) {
 					if(!isNaN(local_auth[age+" Q"+quarter+" "+i])){
 						year_total+=parseInt(local_auth[age+" Q"+quarter+" "+i]);
 					}
 				}
 				la_object[age+" "+i] = year_total;
 				la_object[age+" all"] += year_total;
 			});
 		}
 		jsonArray.push(la_object);
 	});

	return jsonArray;
}

bubbleDataFiscal = function(){
	var age_range = Session.get('age_range');
	var age_ranges = ['16-24','16-17','18-20'];
	var fiscal_years = ['2002_3','2003_4','2004_5','2005_6','2007_8','2008_9',
	'2009_10','2010_11','2011_12','2012_13','2013_14'];
	var year = Session.get('year');
	var year_start = 2012;
	var year_end = 2014;
    var p1eData = P1E.find({});
    
    var jsonArray = [];

 	p1eData.forEach(function(local_auth){
 		var la_object= {};
 		la_object['la_name'] = local_auth["Laname"];
 		la_object['id'] = local_auth["ONS Code"];
 		var all_totals={};
 		var age = '16-24';
 		var quarters = ["Q1 2014","Q2 2014","Q3 2013","Q4 2013"];
 		la_object["2013"] = 0; 
 		quarters.forEach(function(qtr){
 			if(!isNaN(local_auth[age + " " + qtr])) {
 				la_object["2013"] += parseInt(local_auth[age + " " + qtr]);
 			}
 		});
 		la_object["country"] ='england';
 		jsonArray.push(la_object);
 	});

 	scotlandData = Scotland.find({});

 	scotlandData.forEach(function(local_auth){
 		var la_object= {};
 		la_object['la_name'] = local_auth["Laname"];
 		la_object['id'] = local_auth["Lacode"];
 		// fiscal_years.forEach(function(year){
 		// 	la_object[year.slice(0,4)]=local_auth[year];
 		// });
 		la_object["2013"] = local_auth['2013_14'];
 		la_object["country"] ='scotland';
 		jsonArray.push(la_object);
 	});

 	walesData = Wales.find({});

 	walesData.forEach(function(local_auth){
 		var la_object= {};
 		la_object['la_name'] = local_auth["Laname"];
 		la_object['id'] = local_auth["Lacode"];
 		// fiscal_years.forEach(function(year){
 		// 	la_object[year.slice(0,4)]=local_auth[year];
 		// });
 		la_object["2013"] = local_auth['2013'];
 		la_object["country"] ='wales';
 		jsonArray.push(la_object);
 	});

 	var ni_object = {};
 	ni_object['la_name'] = 'Northern Ireland'
 	ni_object['id'] = 'NI';
 	ni_object["2013"] = 1500;
 	ni_object["country"] = 'n_ireland';
 	jsonArray.push(ni_object);

	return jsonArray;
}

bubbleCentroids = function(){
	function callback() {

	} 
	$.getJSON('/geodata/topo_lad.json').done(
		function(topodata){
			var centroids = {};
			var features = topojson.feature(topodata,topodata.objects.lad).features;
			var projection = d3.geo.mercator();
			var path = d3.geo.path().projection(projection);
			for (var i = 0; i < features.length; i++) {
		    	var feat = features[i];
		    	// calculate the centroid (which is in pixels) and then invert back to lat/long
		    	var centroid = projection.invert(path.centroid(feat));
		    	// output: id, long, lat
		    	centroids[feat.properties.LAD13CD] = {'name':feat.properties.LAD13NM,'lat':centroid[1], 'long':centroid[0]};
			}
			console.log(JSON.stringify(centroids));
	});
}