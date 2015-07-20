$(document).ready(function() {

	/*
		1. Activate field placeholders
		2. More info boxes
	*/
	
	
	//1. Activate field placeholders
	$('#maincontentcol').on('click','input',function() {
		if($(this).val()==$(this).attr('placeholder')) {
			$(this).val('').css({color:'#333'});
		}
	});
	
	$('').live('click',function() {
		if($(this).val()==$(this).attr('placeholder')) {
			$(this).val('').css({color:'#333'});
		}
	});
	
	
	
	//2. More info boxes
	$('#container').append('<div id="ib_overlay"><div id="ib_loading"></div></div><div id="infobox"><div id="ib_content"></div></div>');
	
	//Cache
	$ib = [];
	$ib['overlay'] = $('#ib_overlay');
	$ib['infobox'] = $('#infobox');
	$ib['loading'] = $('#ib_loading');
	$ib['content'] = $('#ib_content');
	$ib['close'] = $('#ib_close');

	//Create loading spinner
	spinOpts = {
		lines:	10,
		length:	4,
		width:	5,
		radius:	35,
		color:	'#FFF',
		speed:	1.2,
		trail:	60,
		shadow:	true 
	};
	spin = new Spinner(spinOpts);
	spin.spin($ib['loading'][0]);
	
	calculateInfoBoxSize();
	$ib['overlay'].live('click',closeInfoBox);
	$ib['close'].live('click',closeInfoBox);
	
	
	//Lightbox open
	$('#maincontentcol button.more_info').live('click',function() {
		
		$ib['loading'].show();
		$ib['overlay'].fadeTo(500,0.8);
		$ib['content'].hide();
		
		$ib['infobox'].fadeIn(500);
		
		metric = $(this).data('id');
		type = $(this).data('type');
		
		$.ajax({
			url: 'http://england.shelter.org.uk/professional_resources/housing_databank/data_more_info/',
			context: $("#lightbox"),
			cache: false,
			data: {
				metric: metric,
				type:type
			},
			success: openInfoBox
		});
	});
	
	function calculateInfoBoxSize() {
	
		$ib['overlay'].css('height',$(window).height());
		
		$ib['loading'].css({
			top: $(window).height()/2,
			left: $(window).width()/2
		});
		
		$ib['infobox'].css({
			width: 0,
			height: 0,
			top: $(window).height()/2,
			left: $(window).width()/2
		});
	}
	
	function openInfoBox(content) {
		$ib['content'].html("<div style='width:500px'><button id='ib_close'>Close</button>"+content+"</div>");
		
		$ib['infobox'].animate({
			height:$ib['content'].height()+50,
			width:$ib['content'].width()+50,
			left:($(window).width()/2)-(($ib['content'].width()+50)/2),
			top:($(window).height()/2)-(($ib['content'].height()+50)/2)
		},500, function() {	
			$ib['content'].fadeIn(500);
			$ib['loading'].hide();
		});
	}
	
	function closeInfoBox() {
		$ib['infobox'].fadeOut(300,function() {
			$ib['overlay'].fadeOut(300,calculateInfoBoxSize);
		});
	}

	
});

















