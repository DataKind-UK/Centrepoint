Template.home.rendered = () ->
	w = new WOW().init()

	# TODO: End after home destroyed

	# make sure div stays full width/height on resize
	# global vars
	winWidth = $(window).width()
	winHeight = $(window).height()

	# set initial div height / width
	$("#intro").css
	  width: winWidth
	  height: winHeight

	$(window).resize ->
	  $("#intro").css
	    width: $(window).width()
	    height: $(window).height()

	#Skroll doesn't work so well on mobile imo
	unless Utils.isMobile
		options =
			forceHeight: false
			smoothScrolling: false

		skrollr.init(options).refresh()

	Session.set('year', '2013')
	Session.set('age_range', '16-24')
	jdata = bubbleDataFiscal() #bubbleDataGenerator()
	
	render_vis = (data, centroids) -> 
        chart = new BubbleChart(data, '16-24', '2013', centroids, true)
        chart.start()
        chart.display_by_geo()

    $.getJSON('/geodata/la_centroids.json').done(    
    	(centroids) ->
      		render_vis(jdata, centroids)
  	)


Template.home.destroyed = () ->
	#For Skrollr
	$('body').attr('style','')