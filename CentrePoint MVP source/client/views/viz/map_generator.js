map = null;

mapGenerator = function(dataSelect){
    var fieldQuery = {"ONS Code":1, "_id":0}
    fieldQuery[dataSelect] = 1
    var p1eData = P1E.find({},{"fields": fieldQuery}).fetch();
    var p1eByCode = _.object(_.pluck(p1eData, 'ONS Code'), _.pluck(p1eData, dataSelect));

    var topoLayer;
    if(map != null){map.remove();}
    map = new L.map('map', {
      doubleClickZoom: false,
      zoomControl: false
    }).setView([53.9585965,-1.0805916], 6);
    map.addControl( L.control.zoom({position: 'topleft'}));
    //L.tileLayer.provider('Stamen.TonerBackground').addTo(map);
    var infobox = L.control();

  function getColor(d) {
      return d > 100 ? '#D14414' :
             d > 50  ? '#DC724E' :
             d > 20  ? '#E8A189' :
             d > 5   ? '#F3D0C4' :
             d > -1  ? '#FBF1EE':
                        '#7d7d7d';
  }

  function style(feature) {
    return {
        //fillColor: '#'+Math.floor(Math.random()*16777215).toString(16)
        fillColor: getColor(p1eByCode[feature.properties.LAD13CD]),
        weight: 1,
        opacity: 1,
        color: 'grey',
        //dashArray: '3',
        fillOpacity: 0.7
    };
  }

  function highlightFeature(e) {
    var layer = e.target;
    var props =layer.feature.properties;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    infobox.update(props);

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    
    var html_props =  '<b>' + props.LAD13NM + '</b><br /> ONS Code: ' 
      + props.LAD13CD + '<br /> Cases:' +p1eByCode[props.LAD13CD];

    tooltip = L.tooltip({
        target: layer,
        map: map,
        // mouseOffset: L.point(0, 24),
        html: html_props,
        padding: '4px 8px'
    });

  }

  function resetHighlight(e) {
    topoLayer.resetStyle(e.target);
    infobox.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        dblclick: zoomToFeature
    });
  }


  $.getJSON('/geodata/topo_lad.json')
    .done(addTopoData);
  
  function addTopoData(topoData){  
  	topoLayer = new L.TopoJSON(topoData, {
      	style: style,
      	onEachFeature: onEachFeature
  	});

  	//topoLayer.addData(topoData);

  	topoLayer.addTo(map);
    map.invalidateSize();

	//topoLayer.setStyle(style);
  }

	infobox.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'infobox'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	infobox.update = function (props) {
	    this._div.innerHTML = '<h4>Local Authourity</h4>' +  (props ?
	        '<b>' + props.LAD13NM + '</b><br /> ONS Code: ' + props.LAD13CD 
	        + '<br /> Cases:' +p1eByCode[props.LAD13CD]
          : ' Select or hover over a local authourity');
	};

	infobox.addTo(map);

	var selectorbox = L.control({position: 'topright'});

	selectorbox.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'infobox');
	    div.innerHTML += Blaze.toHTML(Template.mapselector);
	    return div;
	};

	selectorbox.addTo(map);


	var legend = L.control({position: 'topright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'infobox legend'),
	        grades = [0, 5, 20, 50, 100],
	        labels = [];

	    // loop through our density intervals and generate a label with a colored square for each interval
	    for (var i = 0; i < grades.length; i++) {
	        div.innerHTML += 
	            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
	            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	    }

	    return div;
	};

	legend.addTo(map);
  resize(map);
}