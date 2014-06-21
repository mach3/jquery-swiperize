
# jQuery-Swiperize

Enable "swipe*" events at the element.

## Usage

	var $body = $("body");

	// initialize
	$body.swiperize()
	.on({
		swipeleft: function(){ ... },
		swiperight: function(){ ... }
	});

	// destruct
	$body.unswiperize();
	