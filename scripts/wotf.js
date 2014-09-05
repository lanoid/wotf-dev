// Apologies if this files seems a bit etch-a-sketch, this is a work in progress.

var wotf = {
	// partials directory
	partials : 'partials/',
	// events object (for getting later)
	evts : {},
	// store an offset for dragging
	offsetDrag : 0,
	// cache image paths into the browser
	imgCache : {},
	// cache page data
	jsonCache : {},
	// are we dragging?
	dragging : false,
	// home panel timeout
	homePanels : '',
	// event panel timeout
	eventPanels : '',
	// clicks
	clicks : 0,
	// Set things up
	init : function() {
		$(document).ready(function(){
			wotf.events();
			wotf.snap('.scroller','.col');
			wotf.clock($('.clock'));

			wotf.panelLoader($('#home1'));
			wotf.panelLoader($('#event1'));
		});
	},
	// Get all the events that can be bound, bound (recallable if stuff changes)
	events : function() {
		// Event bindings
		$(wotf.evts).on('scroll:snap', wotf.snapHandler);
		$(wotf.evts).on('tap:double', function() {
			// alert('!');
		});
		$(wotf.evts).on('dash:close', function() {
			$('.dash-holder, .dash-handle').removeClass('open');
		});

		$(wotf.evts).on('channels:open', function() {
			$('section.channels').addClass('open');
			wotf.scroll($('section.channels').position().left,1000);
		});

		$(wotf.evts).on('dashboard:open', function(e,d) {
			$('.dash-panel:not('+d+')').removeClass('open');
			$('.dash-panel').filter(d).addClass('open');
			if($('.dash-panel.movies').hasClass('open')){
				$('.dash-holder, .dash-handle').addClass('customise');
			} else {
				$('.dash-holder, .dash-handle').removeClass('customise');
			}
		});

		$(wotf.evts).on('vplanr:open', function() {
			$('.dash-holder, .dash-handle').removeClass('open');
			$('.dash-holder.vplanr').addClass('open');
		});

		$(wotf.evts).on('vplanr:close', function() {
			$('.dash-holder.vplanr').removeClass('open');
		});
		
		$(wotf.evts).on('panel:pause', function(e,timer) {
			clearInterval(wotf[timer]);
		});

		$(wotf.evts).on('panel:play', function(e,$nav) {
			wotf.autoPanel($($nav));
		});

		// Event Triggers
		$('.dash-grid .movies').on('click', function(e) {
			$(wotf.evts).trigger($(this).data('event'), $(this).data('target'));
		});

		$('.dash-panel .back').on('click', function(e) {
			$(wotf.evts).trigger($(this).data('event'), $(this).data('target'));
		});

		$('.favourite-channels .bbc-one').on('click', function() {
			$(wotf.evts).trigger('dash:close');
			$(wotf.evts).trigger('channels:open');
		});

		$('.icon-panel .vplanr, .first .add').on('click', function() {
			$(wotf.evts).trigger('vplanr:open');
		});

		$(wotf.evts).on('dash:open', function(e,d) {
			$('.dash-holder'+d.holder+', .dash-handle').addClass('open');
			$('.dash-panel:not('+d.panel+')').removeClass('open');
			$('.dash-panel').filter(d.panel).addClass('open');
		});

		$('.vplanr .dash').on('click', function() {
			$(wotf.evts).trigger('vplanr:close');
			$(wotf.evts).trigger('dash:open',{holder : $(this).data('holder'), panel : $(this).data('panel')});
		});

		// Fucntion Handlers
		$('.logged-in nav .profile').on('click', wotf.handlePanel);
		$('.expand').on('click', wotf.revealMessage);
		$('.dash-handle').on('click', wotf.handlePanel);
		$('.dash-handler').on('click', wotf.handlePanel);
		$('.help-handle').on('click', wotf.handlePanel);
		$('.help-handler').on('click', wotf.handlePanel);
		$('.menu').on('click', wotf.handlePanel);
		$('.movie .point').on('click', wotf.handlePanel);
		$('.logged-in .product-list .point').on('click', wotf.productReveal);
		$('.product-list .view a').on('click', wotf.productReveal);
		$('.connecting .point').on('click', wotf.revealOther);
		$('.nokia-tablet .point').on('click', wotf.togglePanels);
		$('.icon-panel .connectivity').on('click', wotf.twoClick);
		$('video').on('click', wotf.videoHandler);

		// Function Calls
		wotf.dblClick($('section.home'));
		wotf.tabs($('.profile-aspects'));
		
		

		// Small funciton bindings
		$('.day.active').on('click', function() {
			$('.calendar .timeframe.month').toggleClass('open');
			$('.calendar .timeframe.day').toggleClass('open');
		});

		$('.channel-selector .drag').on('click', function(e){
			var $handle = $(e.currentTarget),
				$parent = $handle.parents('.channel-selector');

			$parent.toggleClass('open');
		});

		$('section.channels .close').on('click', function() {
			$(this).parent().removeClass('open');
		});

		$('.toggle').on('click', function() {
			$(this).toggleClass('on');
		})

		$('.add.wagamama').on('click', function() {
			$('.calendar .confirm').addClass('open');
			$('.calendar .confirm .close').on('click', function() {
				$('.calendar .confirm').removeClass('open');
			});
		});

		$('.logged-out .profile').on('click', function(e) {
			var $el = $(this),
				$target = $($el.data('target'));
			$target.toggleClass('open');
		});
		$('.fingerprint').on('click', function(e) {
			e.preventDefault();

			$('.dash-holder, .dash-handle').removeClass('open');

			$.get('partials/logged-in-header.html',function(data) {
				$('body > header').replaceWith(data);
				wotf.init();
			});

			$.get('partials/logged-in-dash.html',function(data) {
				$('.dash-frame').replaceWith(data);
				wotf.init();
				setTimeout(function(){wotf.init()},200);
			});

			$.get('partials/logged-in-content.html',function(data) {
				$('body').addClass('logged-in').removeClass('logged-out');
				$('#content').replaceWith(data);
				wotf.init();
			});
		});
	},
	dblClick : function($target) {
		$target.on('click', function(e) {
			// console.log(wotf.clicks);
			e.stopPropagation();

			if($(this).hasClass('tapped') && wotf.clicks === 1){
				$(wotf.evts).trigger('tap:double');
			}

			$(this).addClass('tapped');
			wotf.clicks++;

			setTimeout(function(){
				// console.log('too late');
				wotf.clicks = 0;
				$(this).removeClass('tapped');
			}, 800);
		});
	},

	videoHandler: function(){
		var video = $(this)[0];
		if(video.paused){
			video.play();
		} else {
			video.pause();
		}
	},
	// enable scroll snap on the given wrapper and children
	snap : function(scrollWrap, childSnap) {
		$(scrollWrap).scrollsnap({
			direction : 'x',
			snaps : childSnap,
			proximity : 300,
			latency: 250,
			duration: 100,
			easing : 'easeInCirc',
			onSnap : function(e) {
				$(wotf.evts).trigger('scroll:snap', e);
			}
		});
	},
	// Do things when snapping has happened.
	snapHandler : function(e, data) {
		var $data = $(data);

		// if($data.hasClass('video')){
		// 	var video = $data.find('video')[0];
		// 	video.muted = true;
		// 	video.loop = true;
		// 	video.play();
		// } else {
		// 	$('video').each(function() {
		// 		$(this)[0].pause();
		// 	});
		// }
	},
	// Load panels based on their element
	panelLoader : function($el) {
		if($el.length === 0){
			return false;
		}
		var source = $($el.data('template')).html(),
			template = Handlebars.compile(source),
			$nav = $('<ul class="panel-nav" />');

		$.getJSON($el.data('url'), function(data) {
			var pageData = data[0];

			$el.css('background-image','url('+pageData.src+')');
			$el.removeClass('black white').addClass(pageData.color);
			$el.append(template(pageData));
			$el.find('.expand').on('click', wotf.revealMessage);

			if($el.find('video').length === 1){
				$el.find('video')[0].play();
			}

			$.each(data,function(i,v) {
				$nav.append('<li data-id="' + v.id + '"><span>' + v.h1 + '</span></li>');

				if($el.attr('id') === v.id){
					$nav.find('[data-id=' + v.id + ']').addClass('current');
				}

				// CACHE ALL THE THINGS!
				wotf.jsonCache[v.id] = v;
				var img = new Image();
					img.src = v.src;
				wotf.imgCache[v.id] = img;
			});

			if(data.length > 1){
				$el.find('.content').before($nav);
			}

			wotf.panelNav($nav);
			wotf.autoPanel($nav);
		});
	},
	// Bind functionality to panel navigation
	panelNav : function($el) {
		$el.find('li').on('click', function(e) {
			e.stopPropagation();
			var $this = $(this);

			$this.siblings('li').removeClass('current');
			$this.addClass('current');
			wotf.panelSwitcher($this.parents('section'), wotf.jsonCache[$this.data('id')]);
		});
	},
	// Parse panel data on navigation though template (backgrounds are transitioned)
	panelSwitcher : function($el,data){
		var source = $($el.data('template')).html(),
			template = Handlebars.compile(source);

		$el.css('background-image','url('+data.src+')');
		$el.removeClass('black white').addClass(data.color);
		$el.find('.content').remove();
		$el.append(template(data));
		$el.find('.expand').on('click', wotf.revealMessage);

		if(data.eventTemplate) {
			$el.find('.content').html($(data.eventTemplate).html());
		}

		$('.events .point').on('click', function() {
			$('.events .overlay').toggleClass('open');
			if($('.events .overlay').hasClass('open')){
				window.clearTimeout(wotf.eventPanels);
			}
		});
	},
	autoPanel : function($nav) {
		wotf[$nav.parents('section').data('timer')] = setInterval(function() {
			var $navItems = $nav.find('li'),
				$next = $navItems.filter('.current').next(),
				$first = $navItems.filter(':first');
			if($next.length === 0){
				$first.click();
			} else {
				$next.click();
			}
		}, 8000);
	},
	// Reveal or animate the targeted element
	clickReveal : function(e) {
		var $el = $(e.currentTarget),
			$target = $($el.data('target')),
			targetEl = $target[0],
			transition = $target.data('transition'),
			closed = $target.data('closed'),
			open = $target.data('open'),
			units = $target.data('units');

		$target.on('transitionend webkitTransitionEnd', function(){
			var offset = parseInt(targetEl.style[transition],10);

			if(offset === closed){
				$el.removeClass('open');
				$target.removeClass('open');
			}
			if(offset === open){
				$el.addClass('open');
				$target.addClass('open');
			}
		});

		if(!$target.hasClass('open')){
			targetEl.style[transition] = open + units;
		} else {
			targetEl.style[transition] = closed + units;
		}
	},
	// Could possibly deprecate in favour of an extended clickReveal
	revealMessage : function(e) {
		e.preventDefault();
		var $el = $(e.currentTarget),
			$message = $el.find('.message'),
			width = $message.data('max-width'),
			$section = $el.parents('section'),
			timer = $section.data('timer'),
			$nav = $section.find('.panel-nav');

		$message[0].setAttribute('style', 'width:'+width+';');

		if($el.hasClass('open')){
			$(wotf.evts).trigger('panel:play', $nav);
			$el.removeClass('open');
			$message[0].setAttribute('style', 'width:0vw;');
		} else {
			$(wotf.evts).trigger('panel:pause',timer);
			$message[0].setAttribute('style', 'width:'+width+';');
			$el.addClass('open');
		}
	},
	// Set up clock object and start it counting
	clock : function($el) {
		var $bigHand = $el.find('.big-hand'),
			$mediumHand = $el.find('.medium-hand'),
			$hours = $el.find('.hours'),
			$minutes = $el.find('.minutes'),
			$ampm = $el.find('.period');
		wotf.clockTime($bigHand,$mediumHand,$hours,$minutes,$ampm);
		setInterval(function() {
			wotf.clockTime($bigHand,$mediumHand,$hours,$minutes,$ampm);
		}, 60000);
	},
	// Give the clock its current time
	clockTime : function($bigHand,$mediumHand,$hours,$minutes,$ampm) {
		var dt = new Date(),
			m = dt.getMinutes(),
			h = dt.getHours(),
			mDeg = m * 6,
			hDeg = h * 30,
			ampm = (h >= 12) ? 'PM' : 'AM';
		$bigHand.css({
			'-webkit-transform':'rotate('+hDeg+'deg)',
			'-moz-transform':'rotate('+hDeg+'deg)',
			'-o-transform':'rotate('+hDeg+'deg)',
			'-ms-transform':'rotate('+hDeg+'deg)',
			'transform':'rotate('+hDeg+'deg)'
		});
		$mediumHand.css({
			'-webkit-transform':'rotate('+mDeg+'deg)',
			'-moz-transform':'rotate('+mDeg+'deg)',
			'-o-transform':'rotate('+mDeg+'deg)',
			'-ms-transform':'rotate('+mDeg+'deg)',
			'transform':'rotate('+mDeg+'deg)'
		});
		$hours.text(h);
		$minutes.text((m < 10 ? '0':'') + m);
		$ampm.text(ampm);
	},
	// Slide and reveal a product panel
	productReveal : function(e) {
		var $trigger = $(e.currentTarget),
			url = $trigger.data('url'),
			section = $trigger.parents('section'),
			$product = $('section.product');

		if($product.hasClass('open')){
			$product.removeClass('open');
		} else if($product.length > 0){
			$product.addClass('open');
		} else {
			$.get(url, function(data) {
				section.after(data);

				var $product = $('section.product');

				wotf.scroll($product.position().left,1000);

				$product.addClass('open');

				wotf.tabs($('.product .reviews'));
			});
		}
	},
	// scroll to a given left offset at a given speed
	scroll : function(left,speed){
		$scroller = $('.scroller');
		$scroller.animate({
			scrollLeft : left + $scroller.scrollLeft()
		}, speed);
	},
	// change a target elements state to open
	revealOther : function(e) {
		var $el = $(e.currentTarget),
			$target = $($el.data('target'));

		if($target.hasClass('open')){
			$target.removeClass('open');
		} else {
			$target.addClass('open');
		}
	},
	// open a panel with the associated handle at the same time, allow other handlers to do the same
	handlePanel : function(e) {
		var $handle = $(e.currentTarget),
			$panel = $($handle.data('target')),
			$close = $($handle.data('close'));
		if($handle.hasClass('animate')){
			$($handle.data('animate')).removeClass('inactive').toggleClass('open');
		}
		if($handle.hasClass('handler')){
			$handle = $($handle.data('handle'));
		}
		$handle.removeClass('inactive').toggleClass('open');
		$panel.removeClass('inactive').toggleClass('open');
		$close.removeClass('open').toggleClass('inactive');
	},
	// switch classes on an alternate panel
	togglePanels : function(e) {
		var $el = $(e.currentTarget),
			$first = $($el.data('first')),
			$second = $($el.data('second'));
		if($second.hasClass('open')){
			$second.removeClass('open');
			$first.addClass('open');
		} else {
			$first.removeClass('open');
			$second.addClass('open');
		}
	},
	tabs : function(tabs) {
		var $tabs = tabs.find('.tabs > li').not('.inactive'),
			$panels = tabs.find('.panels > li'),
			$paging = tabs.find('button');

		$tabs.on('click', function(e){
			var target = $(this).data('target');

			$tabs.filter(target).addClass('current');
			$tabs.not(target).removeClass('current');

			$panels.filter(target).addClass('current');
			$panels.not(target).removeClass('current');
		});

		$paging.on('click', function(e){
			$tabs.toggleClass('current');
			$panels.toggleClass('current');
		});
	},
	twoClick : function(e) {
		if($(this).hasClass('ready')){
			$(wotf.evts).trigger($(this).data('event'), $(this).data('target'));
		}
		$(this).toggleClass('ready');
	}
};

wotf.init();
