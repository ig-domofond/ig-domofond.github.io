$(document).ready(function () {
    var $developmentShow = $('.js-more-developments');
    var filterOptions = {
        deadline: null,
        room: null,
        finish: null,
        minprice: null,
        maxprice: null
    };
    var myMap;
    var schema = $('.b-pik-development-tiles .m-tile-gutter');
    var myCollection;
    var historiesBlockScroll = $('.js-scroll-pane#historiesMenu').jScrollPane({
        contentWidth: 100
    }).data('jsp');;
    var numberTraczaction = 0;

 $('.js-tab-control').on('click', function () {
     var $this = $(this);
     var parent = $this.closest('.tab-content');
     var active = parent.siblings('.e-tabs').find('.active');
     var lengtTabs = parent.find('.tab-pane').length;

     if ($this.hasClass('left')) {
         if (active.index() === 0) {
             parent.siblings('.e-tabs').find('.e-tab').eq(lengtTabs - 1).find('a').tab('show');
         } else {
             active.prev().find('a').tab('show');
         }
        }

        if ($this.hasClass('right')) {
            if (active.index() === lengtTabs - 1){
                parent.siblings('.e-tabs').find('.e-tab').eq(0).find('a').tab('show');
            } else {
                active.next().find('a').tab('show');
            }
        }
    });

    $("#deadline").selectmenu({
        select: function (event, ui) {
            filterOptions.deadline = ui.item.value;
            isFiltered()
        }
    });

    $("#room").selectmenu({
        select: function (event, ui) {
            filterOptions.room = ui.item.value;
            isFiltered()
        }
    });

    $("#finish").on('change', function (e) {
        if (e.target.checked) {
            filterOptions.finish = e.target.value;
        } else {
            filterOptions.finish = '';
        }
        isFiltered();
    });

    $("#slider-range").slider({
        range: true,
        min: 2,
        max: 37,
        step: 0.5,
        values: [0, 37],
        slide: function (event, ui) {
            $("#amount").val(ui.values[0] + " - " + ui.values[1] + " млн ₽");
        },
        stop: function (event, ui) {
            filterOptions.minprice = ui.values[0];
            filterOptions.maxprice = ui.values[1];
            isFiltered();
        }
    });

    $("#amount").val($("#slider-range").slider("values", 0) +
        " - " + $("#slider-range").slider("values", 1) + " млн ₽");

    function isFiltered() {
        var options = filterOptions;
        var $extraDevelopments = $('.js-extra-developments');

        if ($extraDevelopments.length) {
            $extraDevelopments.closest('.col-xs-11').append($extraDevelopments.find('.m-tile-gutter'));
            $extraDevelopments.remove();
            $developmentShow.addClass('hide');
        }

        [].forEach.call(schema, function (item) {
            item = $(item);

            var deadline = item.data('deadline');
            var room = item.data('room');
            var finish = item.data('finish');
            var maxprice = item.data('maxprice') / 1000000;
            var minprice = item.data('minprice') / 1000000;

            if ((options.deadline && deadline !== (options.deadline * 1)) || (options.room && String(room).indexOf(options.room) === -1) || (options.finish && String(finish).indexOf(options.finish) === -1) || (options.maxprice && maxprice > Number(options.maxprice)) || (options.minprice && minprice < Number(options.minprice) && options.minprice && maxprice < Number(options.minprice))) {
                item.addClass('hide');
            } else {
                item.removeClass('hide');
            }
        });
        
        addPlacemark();
    };
   
    ymaps.ready(function () {
       myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 10,

        });
        myCollection = new ymaps.GeoObjectCollection();
        addPlacemark();
        myMap.geoObjects.add(myCollection);

      var myMapOffices = new ymaps.Map("map-offises", {
            center: [55.76, 37.64],
            zoom: 9,

        });

        var myCollectionOffices = new ymaps.GeoObjectCollection();
        
        [].forEach.call($('.e-pik-offices .b-pik-office'), function (item) {
            item = $(item);

                if(!item.data('lat') || !item.data('lon')) {
                    return;
                }

                item.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    myPlacemarkOffices.balloon.open();
                });

                var MyBalloonOfficeLayout = ymaps.templateLayoutFactory.createClass(
                    '<div class="map-balloon-of">' +
                    '$[[options.contentLayout minWidth=100 maxWidth=100 maxHeight=30]]' +
                    '</div>');

                if (item.data('price')) {
                    var MyBalloonOfficeContentLayout = ymaps.templateLayoutFactory.createClass(
                        '<span class="map-balloon-of__title">' +
                        item.find('strong')[0].innerHTML +
                        '</span>' +
                        '<span class="map-balloon-of__price">' +
                        'от ' + item.data('price') + ' ₽' +
                        '</span>'
                    );
                } else if (item.find('strong')[0].innerHTML) {
                        var MyBalloonOfficeContentLayout = ymaps.templateLayoutFactory.createClass(
                            '<span class="map-balloon-of__title">' +
                            item.find('strong')[0].innerHTML +
                            '</span>'
                        );
                }

            var myPlacemarkOffices = window.myPlacemark = new ymaps.Placemark([Number(item.data('lat')), Number(item.data('lon'))],
                {}, {
                    hideIconOnBalloonOpen: false,
                    balloonOffset: [5, 0],
                    iconLayout: 'default#image',
                    iconImageHref: (item.find('strong')[0].innerHTML === 'Главный офис в Москве') ? 'Content/images/map-icon-gl.png' : 'Content/images/map-icon.gif',
                    iconImageSize: [26, 26],
                    iconImageOffset: [-12, 0],
                    balloonShadow: false,
                    balloonLayout: MyBalloonOfficeLayout && MyBalloonOfficeLayout,
                    balloonContentLayout: MyBalloonOfficeLayout && MyBalloonOfficeContentLayout,
                    balloonPanelMaxMapArea: 0,
                });

            myPlacemarkOffices.events.add('mouseenter', function () {
                officesBlockScroll.scrollToY(item.position().top);
                item.addClass('active').siblings().removeClass('active');
                myPlacemarkOffices.balloon.open();
            });

            myPlacemarkOffices.events.add('click', function (e) {
                e.preventDefault();
            });

            myPlacemarkOffices.events.add('mouseleave', function (e) {
                myPlacemarkOffices.balloon.close();
            });

            myCollectionOffices.add(myPlacemarkOffices);
        });

        myMapOffices.geoObjects.add(myCollectionOffices);
    });

    $('a[data-toggle="tab"]#historyTab').on('shown.bs.tab', function (e) {
        historiesBlockScroll.reinitialise();
    });

    $('.e-about-histories__menu-item a').on('shown.bs.tab', function (e) {
        var $this = $(this);
        var parent = $this.closest('.e-about-histories__menu-item');

        parent.siblings().removeClass('prevActive');
        parent.prev().addClass('prevActive');
    });

    function addPlacemark() {
        myCollection.removeAll();
        [].forEach.call(schema, function (item) {
            item = $(item);

            if (item.hasClass('hide')) {
                return;
            }
            var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="map-content">' +
                '<div class="map-content__close">&times;</div>' +
                '$[[options.contentLayout minWidth=480 maxWidth=480 maxHeight=190]]' +
                '</div>', {
                    build: function () {
                        this.constructor.superclass.build.call(this);

                        this._$element = $('.map-content', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.map-content__close')
                            .on('click', $.proxy(this.onCloseClick, this));
                    },

                    clear: function () {
                        this._$element.find('.close')
                            .off('click');

                        this.constructor.superclass.clear.call(this);
                    },

                    onSublayoutSizeChange: function () {
                        MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if (!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();

                        this.events.fire('shapechange');
                    },

                    applyElementOffset: function () {
                        this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2),
                            top: -(this._$element[0].offsetHeight + this._$element.find('.map-content__close')[0].offsetHeight)
                        });
                    },

                    onCloseClick: function (e) {
                        e.preventDefault();

                        this.events.fire('userclose');
                    },

                    getShape: function () {
                        if (!this._isElement(this._$element)) {
                            return MyBalloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + this._$element.find('.map-content__close')[0].offsetHeight
                            ]
                        ]));
                    },

                    _isElement: function (element) {
                        return element && element[0] && element.find('.map-content__close')[0];
                    }
                });
            MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                $(".map-content" + "[data-id=" + "'" + item.data('id') + "'" + "]")[0].innerHTML
            );

            var myPlacemark = window.myPlacemark = new ymaps.Placemark([Number(item.data('lat')), Number(item.data('lon'))],
                {}, {
                    balloonShadow: false,
                    balloonLayout: MyBalloonLayout,
                    balloonContentLayout: MyBalloonContentLayout,
                    balloonPanelMaxMapArea: 0,
                    hideIconOnBalloonOpen: false,
                    balloonOffset: [-11, 15],
                    iconLayout: 'default#image',
                    iconImageHref: 'Content/images/map-icon.gif',
                    iconImageSize: [26, 26],
                    iconImageOffset: [-12, 0]
                });
                myCollection.add(myPlacemark);
        });
    }

    $('.js-video-youtube').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var modal = $('#pikYTVideoModal');

        modal.find('#pikYTVideoIframe').attr('src', $this.data('video'));

        modal.modal('show');
    });

    var officesBlockScroll = $('.js-scroll-pane#offices').jScrollPane({
        contentWidth: 100
    }).data('jsp');

    $('#carousel-example-generic').on('slid.bs.carousel', function (e) {
        var $this = $(e.target);
        var index = $this.find('.carousel-indicators .active').index();
        var buttonLeft = $this.find('.left.carousel-control');

        if (index === 0) {
            buttonLeft.removeClass('active');
        } else {
            buttonLeft.addClass('active');
        }
    });

    $('.e-tabs-sch-nav-tab').on('shown.bs.tab', function (e) {
        if (!window.globalMap){
            $('body').css('overflow', 'hidden');
            $('.js-big-map').addClass('isFixed');
            $('.b-floating-menu').addClass('m-visible m-sticky');
            window.globalMap = true;
        } else {
            $('body').css('overflow', '');
            $('.js-big-map').removeClass('isFixed');
            $('.b-floating-menu').removeClass('m-visible m-sticky');

            window.globalMap = false;
        }
    });

    $('.js-criteo-block').on('click', function (e) {
        var $this = $(e.target);

        if ($this.closest('.js-criteo').length === 0) {
            return;
        }

        window.criteo_q.push(

            { event: "setAccount", account: 27978 },
            { event: "setSiteType", type: "d" },
            {
                event: "trackTransaction", id: numberTraczaction++, deduplication: 0, item: [
                    { id: $this.closest('.m-tile-gutter').data('criteo'), price: $this.closest('.m-tile-gutter').data('minprice'), quantity: 1 }
                ]
            });
    });

    window.criteo_q = window.criteo_q || [];

    var criteoItems = $('.js-criteo-block .m-tile-gutter').map(function (i, el) {
        el = $(el);
        return el.data('criteo');
    });

    window.criteo_q.push(

        { event: "setAccount", account: 27978 },

        { event: "setSiteType", type: "d" },

        { event: "viewList", item: criteoItems }

    );
});