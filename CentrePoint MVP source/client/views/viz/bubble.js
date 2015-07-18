__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

function addCommas(nStr)
{
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}


BubbleChart = function (data, ageRange, year, centroids, home_mode) {
  this.year = "" + year;
  this.bubble_centroids = centroids;
  this.hide_details = __bind(this.hide_details, this);
  this.show_details = __bind(this.show_details, this);
  this.hide_years = __bind(this.hide_years, this);
  this.display_years = __bind(this.display_years, this);
  this.move_towards_year = __bind(this.move_towards_year, this);
  this.display_by_year = __bind(this.display_by_year, this);
  this.move_towards_center = __bind(this.move_towards_center, this);
  this.display_group_all = __bind(this.display_group_all, this);
  this.start = __bind(this.start, this);
  this.create_vis = __bind(this.create_vis, this);
  this.create_nodes = __bind(this.create_nodes, this);
  var max_amount;
  this.data = data;
  this.width = 500;
  this.height = 500;
  this.tooltip = CustomTooltip("bubble_tooltip", 240);
  this.center = {
    x: this.width / 2,
    y: this.height / 2
  };
  this.year_centers = {
    "2012": {
      x: this.width / 3,
      y: this.height / 2
    },
    "2013": {
      x: this.width / 2,
      y: this.height / 2
    },
    "2014": {
      x: 2 * this.width / 3,
      y: this.height / 2
    }
  };
  this.layout_gravity = -0.01;
  this.damper = 0.1;
  this.vis = null;
  this.nodes = [];
  this.force = null;
  this.circles = null;
  var east = 2.5;
  var west = -8.0;
  var north = 59.5;
  var south = 49.0;
  this.geoY = d3.scale.linear().domain([south, north]).range([this.height-25,25]);
  this.geoX = d3.scale.linear().domain([west, east]).range([50, this.width-100]);
  this.fill_color = function(value, country){ 
    if(value > 0){
      if(country == "england"){
        return '#d1633f';
      } else if(country == "scotland"){
        return '#0092d0';
      } else if (country == "wales"){
        return '#a54398';
      } else if (country == "n_ireland"){
        return '#54b847';
      }
    } else {
      if(home_mode === true){
        return '#ffffff';
      } else {
        return '#696969';
      }
    }
    //return '#'+Math.floor(Math.random()*16777215).toString(16)
  };//'green'};//d3.scale.ordinal().domain(["low", "medium", "high"]).range(["#d84b2a", "#beccae", "#7aa25c"]);
  max_amount = d3.max(this.data, function(d) {
    // return parseInt(d[ageRange+' all']);
    return parseInt(d['2013']);
  });
  this.max_amount = max_amount;
  this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([2, 25]);
  this.size_x_scale = d3.scale.linear().domain([0, max_amount]).range([150, this.width-100]);
  this.create_nodes(ageRange);
  this.create_vis();
}

BubbleChart.prototype.create_nodes = function(ageRange) {
  this.data.forEach((function(_this) {
    return function(d) {
      var node;
      var this_geoX, this_geoY;
      //var this_radius = _this.radius_scale(parseInt(d[ageRange+' all']));
      var this_radius = _this.radius_scale(parseInt(d[_this.year]));
      
      if(_this.bubble_centroids[d.id] != undefined){
        this_geoX = _this.geoX(_this.bubble_centroids[d.id]['long']);
        this_geoY = _this.geoY(_this.bubble_centroids[d.id]['lat']);
        console.log(d.id + " " + _this.bubble_centroids[d.id]['lat'] + " " + _this.bubble_centroids[d.id]['long']);
        console.log(d.id + " " + this_geoX + " " + this_geoY);
      } else {
        console.log('undefined LA code' + d.id);
        this_geoX =10;
        this_geoY =10;
      }


      node = {
        id: d.id,
        radius: this_radius,
        value: d[_this.year],
        name: d.la_name,
        country: d.country,
        // org: d.organization,
        // group: d.group,
        // year: d.start_year,
        geoX:this_geoX,
        geoY:this_geoY,
        x: 0,
        y: Math.random() * 800
      };
      //console.log(node.la_name + ": "+node.radius +": "+d[ageRange+' all']);
      return _this.nodes.push(node);
    };
  })(this));
  return this.nodes.sort(function(a, b) {
    return b.value - a.value;
  });
};

BubbleChart.prototype.create_vis = function() {
  var that;
  this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
  this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
    return d.id;
  });
  that = this;
  this.circles.enter().append("circle").attr("r", 0).attr("fill", (function(_this) {
    return function(d) {
      return _this.fill_color(d.value, d.country);
    };
  })(this)).attr("stroke-width", 1).attr("opacity", 0.75).attr("stroke", (function(_this) {
    return function(d) {
      return d3.rgb(_this.fill_color(d.value, d.country)).darker();
    };
  })(this))
  .attr("id", function(d) {
    return "bubble_" + d.id;
  }).on("mouseover", function(d, i) {
    return that.show_details(d, i, this);
  }).on("mouseout", function(d, i) {
    return that.hide_details(d, i, this);
  }).on("click", function(d, i) {
    console.log('bubble clicked');
    Router.go('bubble');
  });
  return this.circles.transition().duration(2000).attr("r", function(d) {
    return d.radius;
  });
};

BubbleChart.prototype.updateData =  function() {
  
}


BubbleChart.prototype.charge = function(d) {
  return -Math.pow(d.radius, 2.0) / 6;
};

BubbleChart.prototype.start = function() {
  return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
};

BubbleChart.prototype.display_group_all = function() {
  this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
    return function(e) {
      return _this.circles.each(_this.move_towards_center(e.alpha)).attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    };
  })(this));
  this.force.start();
  return this.hide_years();
};

BubbleChart.prototype.move_towards_center = function(alpha) {
  return (function(_this) {
    return function(d) {
      d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
      return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
    };
  })(this);
};

BubbleChart.prototype.move_by_size = function(alpha) {
  return (function(_this) {
    return function(d) {
      var x_by_size = _this.size_x_scale(d.value);
      d.x = d.x + (x_by_size - d.x) * (_this.damper + 0.02) * alpha*2;
      return d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha*2;
    };
  })(this);
};

BubbleChart.prototype.move_to_geo = function(alpha) {
  return (function(_this) {
    return function(d) {
      d.x = d.x + (d.geoX - d.x) * (_this.damper*1.5 + 0.02) * alpha*2;
      return d.y = d.y + (d.geoY - d.y) * (_this.damper*1.5 + 0.02) * alpha*2;
    };
  })(this);
};

BubbleChart.prototype.display_by_geo = function() {
  this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
    return function(e) {
      return _this.circles.each(_this.move_to_geo(e.alpha)).attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    };
  })(this));
  this.force.start();
  return 1;//this.display_size_label();
};


BubbleChart.prototype.display_by_size = function() {
  this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
    return function(e) {
      return _this.circles.each(_this.move_by_size(e.alpha)).attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    };
  })(this));
  this.force.start();
  return 1;//this.display_size_label();
};

BubbleChart.prototype.display_by_year = function() {
  this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", (function(_this) {
    return function(e) {
      return _this.circles.each(_this.move_towards_year(e.alpha)).attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    };
  })(this));
  this.force.start();
  return this.display_years();
};

BubbleChart.prototype.move_towards_year = function(alpha) {
  return (function(_this) {
    return function(d) {
      var target;
      target = _this.year_centers[d.year];
      d.x = d.x + (target.x - d.x) * (_this.damper*2 + 0.02) * alpha;
      return d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha;
    };
  })(this);
};

BubbleChart.prototype.display_size_label = function() {
  var years, years_data, years_x;
  var midpoint = (this.max_amount/2).toString()
  sizes_x = {};
  sizes_x[midpoint] =  this.width / 2;
  sizes_data = d3.keys(sizes_x);
  sizes = this.vis.selectAll(".sizes").data(sizes_data);
  return sizes.enter().append("text").attr("class", "sizes").attr("x", (function(_this) {
    return function(d) {
      return sizes_x[d];
    };
  })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
    return d;
  });
};

BubbleChart.prototype.display_years = function() {
  var years, years_data, years_x;
  years_x = {
    "2012": 160,
    "2013": this.width / 2,
    "2014": this.width - 160
  };
  years_data = d3.keys(years_x);
  years = this.vis.selectAll(".years").data(years_data);
  return years.enter().append("text").attr("class", "years").attr("x", (function(_this) {
    return function(d) {
      return years_x[d];
    };
  })(this)).attr("y", 40).attr("text-anchor", "middle").text(function(d) {
    return d;
  });
};

BubbleChart.prototype.hide_years = function() {
  var years;
  return years = this.vis.selectAll(".years").remove();
};

BubbleChart.prototype.show_details = function(data, i, element) {
  var content;
  d3.select(element).attr("stroke", "black").attr("stroke-width",2).attr("opacity",1).attr("fill", (function(_this) {
    return function(d) {
      return d3.rgb(_this.fill_color(d.value, d.country)).darker();
    };
  })(this));
  content = "<span class=\"name\">Local Authority:</span><span class=\"value\"> " + data.name + "</span><br/>";
  content += "<span class=\"name\">Cases:</span><span class=\"value\"> " + data.value + "</span><br/>";
  //content += "<span class=\"name\">Year:</span><span class=\"value\"> " + data.year + "</span>";
  return this.tooltip.showTooltip(content, d3.event);
};

BubbleChart.prototype.hide_details = function(data, i, element) {
  d3.select(element).attr("stroke-width",1).attr("opacity",0.75).attr("stroke", (function(_this) {
    return function(d) {
      return d3.rgb(_this.fill_color(d.value, d.country)).darker();
    };
  })(this)).attr("fill", (function(_this) {
    return function(d) {
      return _this.fill_color(d.value, d.country);
    };
  })(this));
  return this.tooltip.hideTooltip();
};

Template.bubbleselector.localauths = function() {
  return _.uniq(FOI.find({},{fields: {"Local Authority": true}}
  ).fetch().map(function(x) {
    return x["Local Authority"];
  }), true);
}

Template.bubble.rendered = function(){
  Session.set('year', '2013');
  Session.set('age_range', '16-24');
  var jdata = bubbleDataFiscal();//bubbleDataGenerator();
  
  render_vis = function(data, centroids) {
    chart = new BubbleChart(data, '16-24', '2013', centroids, false);
    chart.start();
    // return chart.display_group_all();
    return chart.display_by_geo();
  };

  $.getJSON('/geodata/la_centroids.json').done(    
    function(centroids){
      render_vis(jdata, centroids);
    }
  )

  $("#slider-date").slider({

    min:2012.0,
    max:2015.0,
    value:2012.25,
    step: 0.25,
    formater: function(value) {
      return '' + Math.floor(value) + ' Q' + ((value%1 * 4) + 1);
    },
    tooltip:'always',
    ticks: [2012, 2013, 2014, 2015],
    ticks_labels: ['2012', '2013', '2014', '2015'],
    ticks_snap_bounds: 30
  }).on(
  );
  //d3.json(bubbleDataGenerator(), render_vis);
}

Template.bubbleselector.events({
  'click #bubbleDisplaySwitch': function (e) {
    if($(e.target).text() === 'Display by Size' ){
      $('#bubbleDisplaySwitch').text('Display by Location');
      chart.display_by_size();
    } else if($(e.target).text() === 'Display by Location' ){
      $('#bubbleDisplaySwitch').text('Display by Size');
      chart.display_group_all();
    }
  },
  'click .data-select-la': function (e) {
    e.preventDefault();
    console.log($(e.target).text().trim());
    Session.set('local_auth', $(e.target).text().trim());
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
    $('#dropdownBubbleAgeRange').html($(e.target).text().trim()+"<span class='caret'></span>");
  }
});