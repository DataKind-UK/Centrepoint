sankeyDataGenerator = function(){
	var age_range = Session.get('age_range');
	var year = Session.get('year');
  	var local_auth = Session.get('local_auth');

    var foiData = FOI.findOne({"Local Authority":local_auth,"Year":year,"Age group":age_range});
    
    var jsonObject = {
			"nodes": [
			{"name":"Presented"},
			{"name":"Assessed"},
			{"name":"Offered advice and assistance to accommodation"},
			{"name":"Eligible unintentionally homeless and in priority need"},
			{"name":"Eligible homeless and in priority need but intentionally so"},
			{"name":"Eligible homeless but not in priority need"},
			{"name":"Eligible but not homeless"},
			{"name":"Ineligible"},
			{"name":"Total decisions"}
			] ,
			"links": []
		};


	jsonObject["links"].push({"source":"Presented","target":"Assessed","value":foiData[" Assessed"]})
	jsonObject["links"].push({"source":"Presented","target":"Offered advice and assistance to accommodation","value":foiData["Offered advice and assistance to accommodation"]})
	jsonObject["links"].push({"source":"Assessed","target":"Eligible unintentionally homeless and in priority need","value":foiData["Eligible unintentionally homeless and in priority need"]})
	jsonObject["links"].push({"source":"Assessed","target":"Eligible homeless and in priority need but intentionally so","value":foiData["Eligible homeless and in priority need but intentionally so"]})
	jsonObject["links"].push({"source":"Assessed","target":"Eligible homeless but not in priority need","value":foiData["Eligible homeless but not in priority need"]})
	jsonObject["links"].push({"source":"Assessed","target":"Eligible but not homeless","value":foiData["Eligible but not homeless"]})
	jsonObject["links"].push({"source":"Assessed","target":"Ineligible","value":foiData["Ineligible "]})
	jsonObject["links"].push({"source":"Eligible unintentionally homeless and in priority need","target":"Total decisions","value":foiData["Eligible unintentionally homeless and in priority need"]})
	jsonObject["links"].push({"source":"Eligible homeless and in priority need but intentionally so","target":"Total decisions","value":foiData["Eligible homeless and in priority need but intentionally so"]})
	jsonObject["links"].push({"source":"Eligible homeless but not in priority need","target":"Total decisions","value":foiData["Eligible homeless but not in priority need"]})
	jsonObject["links"].push({"source":"Eligible but not homeless","target":"Total decisions","value":foiData["Eligible but not homeless"]})
	jsonObject["links"].push({"source":"Ineligible","target":"Total decisions","value":foiData["Ineligible "]})

	console.log(jsonObject);
	return jsonObject
}