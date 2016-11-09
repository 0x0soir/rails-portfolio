'use strict';
/*global $:false */

var controllers = {
    utils: {
        getArgs: function($element) {
            try {
                return eval("(" + $element.attr("js-controller-args") + ")") || {};
            } catch(ex) {
                return {};
            }
        }
    },
    get : function(selector) {
        return $(selector).data("js-controller");
    }
};

var bindJSControllers = function() {
    $("[js-controller]").each(function() {
        var $element = $(this);
        if (!$element.data('js-controller-loaded')) {
            var handler = $(this).attr('js-controller');
            var options = controllers.utils.getArgs($element);
            var api = new controllers[handler]($element, options);
            $element.data('js-controller-loaded', true);
            $element.data('js-controller', api);
            console.log("Loaded controller '" + handler + "'");
        } else {
            console.log("! Controller '" + handler + "' is already loaded");
        }
    });
};

/*
 * Container
 * A controller for entire pages. Used for example to deal with full page
 * fade in and out transitions
 */
controllers.container = function($element, options) {
    var api = {};
    var defaults = {};
    var settings = $.extend({}, defaults, options);

    $(window).on("load", function(){
        $element.addClass("loaded");
    });

    // We fade the container out when navigation away from the page. We need to
    // allow for mailto and rel links though so we hack around those
    var unloadCallback = function(event) {
        $element.addClass("unloading");
    }
    $('a[href^="mailto:"],a[href^="tel:"]').hover(
        function(event){
            $(window).off("beforeunload");
        },
        function(event) {
            $(window).on("beforeunload", unloadCallback);
        });
    $(window).on("beforeunload", unloadCallback);

    return api;
}

controllers.menu = function($element, options) {
    var api = {};
    var defaults = {
    };
    var settings = $.extend({}, defaults, options);

    var $body = $("body");
    var $page = $(".page");
    var $content = $(".content");

    var $menuItems = $element.find("[js-menu-item]");
    var openCls = "menu--open";
    var visible = false;

    api.open = function() {
        visible = true;
        $body.addClass(openCls);
    };

    api.close = function() {
        visible = false;
        $body.removeClass(openCls);
    };

    api.toggle = function() {
        if (visible) {
            api.close();
        } else {
            api.open();
        }
    }

    // Close the menu before redirecting
    $menuItems.click(function(){
        var that = this;
        api.close();
        setTimeout(function(){
            window.location = $(that).find("a").attr("href");
        }, 300);
        return false;
    });

    // Swiping open/close
    delete Hammer.defaults.cssProps.userSelect;
    var bodySwipe = new Hammer($body[0]);
    bodySwipe.on('swiperight', function(event){
        api.close();
    });
    bodySwipe.on('swipeleft', function(event){
        api.open();
    });

    // Click page close
    $content.on("click", function(event){
        api.close();
    });

    // Close menu on escape
    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            api.close();
        }
    });

    return api;
};

controllers.header = function($element, options) {
    var api = {};
    var defaults = {};
    var settings = $.extend({}, defaults, options);

    var $menuTrigger = $("[js-menu-trigger]");

    $menuTrigger.on("click", function(){
        controllers.get("[js-controller='menu']").toggle();
    });

    return api;
};

controllers.footer = function($element, options) {
    var api = {};
    var defaults = {};
    var settings = $.extend({}, defaults, options);

    var $backToTop = $("[js-footer-top]");

    $backToTop.click(function(){
        console.log("Click");
    });

    return api;
};

controllers.slider = function($element, options) {
    var api = {};
    var defaults = {
        transitionSpeed: 1000,
        autoplay: false,
        autoplaySpeed: 4000,
        autoplayPause: true // Pause on hover
    };
    var settings = $.extend({}, defaults, options);

    var $windowContainer = $element.find("[js-slider-window]");
    var $slidesContainer = $element.find("[js-slider-slides]");
    var $slides = $element.find("[js-slider-slide]");
    var $slidesImage = $element.find("[js-slider-image]");
    var $pagerItems = $element.find("[js-slider-page]");

    var pagerItemActiveClass = "slider__pager__page--active";

    var windowWidth = 0,
        slidesWidth = 0,
        current = 0,
        total = 0;

    var enableLoading = function() {
        $windowContainer.addClass("loading");
        $slidesContainer.css({
            "opacity": 0
        });
    };

    var disableLoading = function() {
        $windowContainer.removeClass("loading");
        $slidesContainer.css({
            "opacity": 1
        });
    };

    // Recalculate the size of the panes and container
    var recalculateWidths = function(){
        windowWidth = $windowContainer.width();
        $slides.each(function(i, el){
            slidesWidth += windowWidth;
            total += 1;
        });
    };

    // Apply resizing calculations to panes, images and container
    var resizeSlides = function() {
        $slides.css("width", windowWidth);
        $slidesImage.css("width", windowWidth);
        $slidesContainer.css("width", slidesWidth);
    };

    // Make sure not to overflow when dealing with the index
    var cleanIndex = function(index) {
        if (index < 1 ) {
            index = 1;
        } else if (index > total) {
            index = total;
        }
        return index;
    }

    // Try to update the pager position
    var updatePager = function(index) {
        index = cleanIndex(index);
        $pagerItems.removeClass(pagerItemActiveClass)
        $($pagerItems.get(index - 1)).addClass(pagerItemActiveClass);
    }

    var goTo = function(index, animate) {
        index = cleanIndex(index);
        animate = typeof animate !== 'undefined' ? animate : true;
        var offset = (-1 * ((index * windowWidth) - windowWidth));
        if (animate) {
            $slidesContainer.animate({
                "margin-left": offset
            }, settings["speed"]);
        } else {
            $slidesContainer.css("margin-left", offset);
        }
        current = index;
        updatePager(index);
    };

    api.next = function() {
        if (current + 1 <= total) {
            goTo(current + 1);
        } else {
            console.log("You are at the end.");
        }
    };

    api.previous = function() {
        if (current - 1 >= 1) {
            goTo(current - 1);
        } else {
            console.log("You are at the start.");
        }
    };

    // Autoplay
    if (settings.autoplay) {
        var start = function() {
            return setInterval(function () {
                if (current + 1 > total) {
                    current = -1;
                }
                api.next();
            }, settings.autoplaySpeed);
        }
        var timer = start();
        if (settings.autoplayPause) {
            $windowContainer.hover(
                function(){
                    clearInterval(timer);
                },
                function(){
                    timer = start();
                })
        }
    }

    // On click of pager, move to appropriate slider
    $pagerItems.click(function(){
        goTo($(this).index() + 1);
        return false;
    });

    // Swipe left and right
    var gallerySwipe = new Hammer($windowContainer[0]);
    gallerySwipe.on('swipeleft', function(event){
        api.next();
    });
    gallerySwipe.on('swiperight', function(event){
        api.previous();
    });

    // Resize on window resize
    var timeout;
    var width = $(window).width();
    $(window).on('load resize', function(ev){
        if (ev.type === "load" || width !== $(window).width()) {
            width = $(window).width(); // Update the saved width
            enableLoading();
            if(timeout){
                clearTimeout(timeout);
            }

            timeout = setTimeout(function() {
                recalculateWidths();
                resizeSlides();
                if (ev.type === "load") {
                    goTo(1, false);
                } else {
                    goTo(current, false);
                }
                disableLoading();
            }, 250);
        }
    });

    return api;
};

controllers.overlay = function($element, options) {
    var api = {};
    var defaults = {
        speed: "200",
        openCls: "overlay--open",
        openTriggerSelector: "[js-overlay-open]",
        closeTriggerSelector: "[js-overlay-close]"
    };
    var settings = $.extend( {}, defaults, options);

    api.enabled = true;
    api.visible = false;

    var $body = $("body");
    var $open = $body.find(settings['openTriggerSelector']);
    var $close = $body.find(settings['closeTriggerSelector']);

    // Show/Hide the overlay
    // Note: We use a slightly strange approach to showing the
    // element as we want the fadeIn effect but the overlay element is kept
    // off screen as opposed to display:none as we need to be able to use its
    // width and height when it isn't in use (which isn't possible when
    // it is display:none)
    api.open = function(animate) {
        console.log("open");
        if (!api.visible && api.enabled) {
            animate = typeof animate !== 'undefined' ? animate : true;
            var css = {
                left: 0,
                display: "none",
                visibility: "visible"
            }
            $element.css(css)
            if (animate) {
                $element.fadeIn();
            } else {
                $element.show();
            }
            $body.addClass(settings.openCls);
        }
        api.visible = true;
    };

    api.close = function(animate) {
        if (api.visible && api.enabled) {
            animate = typeof animate !== 'undefined' ? animate : true;
            var css = {
                left: "-100%",
                display: "block",
                visibility: "hidden"
            }
            if (animate) {
                $element.fadeOut(function(){
                    $element.css(css);
                });
            } else {
                $element.hide().css(css);
            }
            $body.removeClass(settings.openCls);
        }
        api.visible = false;
    };

    $close.on('click', api.close);
    $open.on('click', api.open);

    return api;
}

controllers.contact = function($element, options) {
    var api = {};
    var defaults = {};
    var settings = $.extend( {}, defaults, options);

    var $form = $element.find("[js-contact-form]");
    var $submit = $element.find("[js-contact-submit]");

    var $formWrapper = $element.find("[js-contact-form-wrapper]");
    var $successWrapper = $element.find("[js-contact-success-wrapper]");

    $form.validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            message: {
                required: true,
            }
        },
        messages: {
            email: {
                required: "Please enter your email address above",
                email: "Please enter valid email address above"
            },
            message: {
                required: "Please enter your message above"
            }
        },
        // Wrap the error manually
        // <div class="form__row">
        //     ...
        //     <div class="form__errors">
        //          <div class="form__row__error">
        //              <label class="error">...
        //          </div>
        //     </div>
        errorPlacement: function(error, element) {
            var $wrapper = $("<div/>", { class: "form__row__errors" }).append(error);
            $(element)
                .parents('.form__row')
                .append($wrapper);
        },
        submitHandler: function(form) {
            $submit.prop('disabled', true);

            var data = {
                email: $form.find("input[name='email']").val(),
                message: $form.find("textarea[name='message']").val(),
                csrfmiddlewaretoken: $form.find("input[name='csrfmiddlewaretoken']").val()
            }
            var url = $form.attr("action");
            $.ajax({
                url: url,
                data: data,
                type: "POST",
                success: function(json) {
                    $formWrapper.hide();
                    $successWrapper.show();
                },
                error: function(xhr, textStatus, err) {
                    console.log("Error");
                    console.log(xhr);
                    console.log(textStatus);
                    console.log(err);
                },
                complete: function(xhr, textStatus) {
                    $submit.prop('disabled', false);
                }
            });
        },
    });

    return api;
}

controllers.scroll = function($element, options) {
    var api = {};
    var defaults = {
        delay: 600,
    };
    var settings = $.extend( {}, defaults, options);

    $("[js-scroll]").on("click", function(){
        var selector = $(this).attr("js-scroll");
        $('html, body').animate({
            scrollTop: $(selector).offset().top
        }, settings.delay);
        return false;
    });
}

$(function() {
    bindJSControllers();
});

controllers.select = function($element, options) {
    var api = {};
    var defaults = {
        delay: 600,
    };
    var settings = $.extend( {}, defaults, options);

    var $current = $("[js-select-current]");
    var $dropdown = $("[js-select-dropdown]");
    var $items = $("[js-select-item]");
    var openClass = "select--open";

    api.open = function() {
        $dropdown.show();
        $element.addClass(openClass);
    };

    api.close = function() {
        $dropdown.hide();
        $element.removeClass(openClass);
    };

    api.toggle = function () {
        if ($dropdown.is(":visible")) {
            api.close();
        } else {
            api.open();
        }
    }

    $current.click(function(){
        api.toggle();
    });

    return api;
}
