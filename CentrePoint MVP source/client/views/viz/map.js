//a forced resize is required to reinitialise the map after tiles are loaded
resize = function(map){
  $(function() {
    map.invalidateSize();
    $(window).resize(function() {
      $('#map').css('height', window.innerHeight - 82 - 45);
    });
    $(window).resize(); // trigger resize event
  }).delay(100);
}

Template.map.rendered = function() {
  // if(localauth_data === undefined){
  // 	localauth_data = JSON.parse(Assets.getText('geodata/lad.json')); 	
  // }
  mapGenerator("16-24 Q1 2014");
 }

Template.map.onCreated(function() {
  $(window).resize(function() {
      $('#map').css('height', window.innerHeight - 82 - 45);
    });
    $(window).resize(); // trigger resize event
  });

Template.map.events({
  'click .data-select': function (e) {
    e.preventDefault();
    console.log($(e.target).text().trim());
    mapGenerator($(e.target).text().trim());
    $('#dropdownMenuFieldName').text($(e.target).text().trim());
  },
  'click .pdf-save': function (e) {
    Blaze.saveAsPDF(Template.map, {
      filename: "map.pdf", // optional, default is "document.pdf"
      //data: myData, // optional, render the template with this data context
      x: 0, // optional, left starting position on resulting PDF, default is 4 units
      y: 0, // optional, top starting position on resulting PDF, default is 4 units
      orientation: "landscape", // optional, "landscape" or "portrait" (default)
      unit: "in", // optional, unit for coordinates, one of "pt", "mm" (default), "cm", or "in"
      format: "a4" // optional, see Page Formats, default is "a4"
    });
  }

});