Template.sankeyselector.localauths = function() {
  return _.uniq(FOI.find({},{fields: {"Local Authority": true}}
  ).fetch().map(function(x) {
    return x["Local Authority"];
  }), true);
}

Template.sankeyselector.events({
  'click .data-select-la': function (e) {
    e.preventDefault();
    console.log($(e.target).text().trim());
    Session.set('local_auth', $(e.target).text().trim());
    generate_sankey(sankeyDataGenerator());
    $('#dropdownLocalAuth').html($(e.target).text().trim()+"<span class='caret'></span>");
  },
  'click .data-select-year': function (e) {
    e.preventDefault();
    console.log($(e.target).text().trim());
    Session.set('year', $(e.target).text().trim());
    generate_sankey(sankeyDataGenerator());
    $('#dropdownYear').html($(e.target).text().trim()+"<span class='caret'></span>");
  },
  'click .data-select-age': function (e) {
    e.preventDefault();
    console.log($(e.target).text().trim());
    Session.set('age_range', $(e.target).text().trim());
    generate_sankey(sankeyDataGenerator());
    $('#dropdownAge').html($(e.target).text().trim()+"<span class='caret'></span>");
  }
});


Template.sankey.rendered = function() {
  if(Session.get('local_auth') === undefined){
    Session.set('local_auth', 'East Staffordshire');
  }
  if(Session.get('year') === undefined){
    Session.set('year', '2012');
  }
  if(Session.get('age_range') === undefined){
    Session.set('age_range', 'All other 18-24');
  }
  var sankey_age = Session.get('age_range');
  var sankey_year = Session.get('year');
  var sankey_localauth = Session.get('local_auth');

  var jsonObject = sankeyDataGenerator();
  generate_sankey(jsonObject);
}