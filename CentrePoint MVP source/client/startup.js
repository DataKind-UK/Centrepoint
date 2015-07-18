Meteor.startup(function(){
    L.TopoJSON = L.GeoJSON.extend({  
            addData: function(jsonData) {    
        if (jsonData.type === "Topology") {
          for (key in jsonData.objects) {
            geojson = topojson.feature(jsonData, jsonData.objects[key]);
            L.GeoJSON.prototype.addData.call(this, geojson);
          }
        }    
        else {
          L.GeoJSON.prototype.addData.call(this, jsonData);
        }
      }  
    });

    Meteor.subscribe("DataTypes");

    //localauth_data = $.getJSON('geodata/lad.json'); 
})