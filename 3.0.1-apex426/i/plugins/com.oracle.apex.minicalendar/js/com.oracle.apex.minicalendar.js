(function( util, server, $, undefined ) {

com_oracle_apex_mini_calendar = function( pRegionId, pOptions ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions,
        gRegion,
        gCalendar,
        gCalendarBody,
        gCalendarTitle,
        gCalendarMonth,
        gCalendarHeaderRow,
        gEventsContainer,
        gEventsContainerTooltip,
        gEventsContainerArrow,
        gMonthSelector,
        gDays = [
            {
                name: 'Sunday',
                short: 'Sun',
                id: 'SUN'
            },
            {
                name: 'Monday',
                short: 'Mon',
                id: 'MON'
            },
            {
                name: 'Tuesday',
                short: 'Tue',
                id: 'TUE',
            },
            {
                name: 'Wednesday',
                short: 'Wed',
                id: 'WED'
            },
            {
                name: 'Thursday',
                short: 'Thu',
                id: 'THU'
            },
            {
                name: 'Friday',
                short: 'Fri',
                id: 'FRI'
            },
            {
                name: 'Saturday',
                short: 'Sat',
                id: 'SAT'
            }
        ],
        gMonths = [
            {
                name: 'January',
                short: 'Jan'
            },
            {
                name: 'February',
                short: 'Feb'
            },
            {
                name: 'March',
                short: 'Mar'
            },
            {
                name: 'April',
                short: 'Apr'
            },
            {
                name: 'May',
                short: 'May'
            },
            {
                name: 'June',
                short: 'Jun'
            },
            {
                name: 'July',
                short: 'Jul'
            },
            {
                name: 'August',
                short: 'Aug'
            },
            {
                name: 'September',
                short: 'Sep'
            },
            {
                name: 'October',
                short: 'Oct'
            },
            {
                name: 'November',
                short: 'Nov'
            },
            {
                name: 'December',
                short: 'Dec'
            }
        ],
        gActiveDate,
        gData = [];

    _init( pRegionId, pOptions );

    function _create(tag) {
        return $(document.createElement(tag));
    }

    function _addDays(date, amount) {
        date = new Date(date.getTime());
        date.setDate(date.getDate() + amount);
        return date;
    }

    function _addMonths(date, amount) {
        date = new Date(date.getTime());
        date.setMonth(date.getMonth() + amount);
        return date;
    }

    function _truncateDate(date) {
        date = new Date(date.getTime());
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    function _truncateMonth(date) {
        date = new Date(date.getTime());
        date.setDate(1);
        return date;
    }

    function _previousMonth() {
        var m = gCalendar.data('month');
        var y = gCalendar.data('year');
        m--;
        if (m < 0) {
            m = 11;
            y--;
        }
        gCalendar.data('month', m);
        gCalendar.data('year', y);
    }

    function _nextMonth() {
        var m = gCalendar.data('month');
        var y = gCalendar.data('year');
        m++;
        if (m > 11) {
            m = 0;
            y++;
        }
        gCalendar.data('month', m);
        gCalendar.data('year', y);
    }

    function _styleMonthSelector() {
        $('.a-MiniCalendar-monthSelector-month', gMonthSelector).each(function(){
            var e = $(this);
            e.removeClass('a-MiniCalendar-monthSelector-month--active');
            if (e.data('month') == gCalendar.data('month') && gMonthSelector.data('year') == gCalendar.data('year')) {
                e.addClass('a-MiniCalendar-monthSelector-month--active');
            }
        });
        $('.a-MiniCalendar-monthSelector-year', gMonthSelector).text(gMonthSelector.data('year'));
    }

    function _init( pRegionId, pOptions ) {
        gOptions = pOptions;
        gOptions.viewMode = gOptions.viewMode || 'month';

        gRegion = $('#' + util.escapeCSS(pRegionId), apex.gPageContext$);
        gCalendar = $('.a-MiniCalendar', gRegion)
            .empty()
            .addClass('a-MiniCalendar--theme-' + gOptions.colorScheme)
            .addClass('a-MiniCalendar--' + gOptions.viewMode)
            .append(
                gCalendarMonth = _create('h3')
                    .addClass('a-MiniCalendar-monthTitle')
            )
            .append(
                _create('table')
                    .addClass('a-MiniCalendar-month')
                    .append(
                        _create('thead')
                            .append(
                                gCalendarHeaderRow = _create('tr')
                            )
                    )
                    .append(
                        gCalendarBody = _create('tbody')
                    )
            )
        var days = gDays;

        for (var i = days.length - 1; i >= 0; i--) {
            days[i].headerId = pRegionId + '_HEAD_' + days[i].id;
            gCalendarHeaderRow.prepend(
                _create('th')
                    .addClass('a-MiniCalendar-dayOfWeek')
                    .attr({
                        scope: 'col',
                        id: days[i].headerId,
                        title: days[i].name
                    })
                    .text(days[i].short)
            );
        };
        if (gOptions.viewMode == 'month') {
            gCalendarHeaderRow
                .prepend(
                    _create('th')
                        .addClass('a-MiniCalendar-buttonColumn')
                )
                .append(
                    _create('th')
                        .addClass('a-MiniCalendar-buttonColumn')
                );
        }

        gEventsContainer = _create('div')
            .addClass('a-MiniCalendar-eventWrapper');
        gCalendar.append(gEventsContainer);

        gEventsContainerTooltip = _create('div')
            .addClass('a-MiniCalendar-eventWrapper a-MiniCalendar-eventWrapper--tooltip')
            .hide();
        gCalendar.append(gEventsContainerTooltip);

        gEventsContainerArrow = _create('div')
            .addClass('a-MiniCalendar-eventWrapperArrow')
            .hide();
        gCalendar.append(gEventsContainerArrow);

        if (gOptions.focusDate == 'FIRST') {
            gOptions.focusDate = null;
        }
        gActiveDate = _truncateDate(gOptions.focusDate ? _parseDate(gOptions.focusDate) : new Date());
        gCalendar.data('year', gActiveDate.getFullYear());
        gCalendar.data('month', gActiveDate.getMonth());

        if (gOptions.viewMode == 'month') {
            gMonthSelector = _create('div')
                .addClass('a-MiniCalendar-monthSelector')
                .append(
                    _create('div')
                        .addClass('a-MiniCalendar-monthSelector-header')
                        .append(
                            _create('a')
                                .addClass('a-MiniCalendar-monthSelector-year-control')
                                .html('&#9668;')
                                .attr('href', '#')
                                .click(function(e) {
                                    e.preventDefault();
                                    var s = gMonthSelector;
                                    s.data('year', s.data('year') - 1);
                                    $('.a-MiniCalendar-monthSelector-year', s).text(s.data('year'));
                                    _styleMonthSelector();
                                })
                        )
                        .append(
                            _create('div')
                                .addClass('a-MiniCalendar-monthSelector-year')
                                .text(gCalendar.data('year'))
                        )
                        .append(
                            _create('a')
                                .addClass('a-MiniCalendar-monthSelector-year-control')
                                .html('&#9658;')
                                .attr('href', '#')
                                .click(function(e) {
                                    e.preventDefault();
                                    var s = $(this).closest('.a-MiniCalendar-monthSelector');
                                    s.data('year', s.data('year') + 1);
                                    $('.a-MiniCalendar-monthSelector-year', s).text(s.data('year'));
                                    _styleMonthSelector();
                                })
                                /*.append(
                                    _create('a')
                                        .addClass('a-MiniCalendar-monthSelector-year-control-button')
                                        .html('&#9658;')
                                        .attr('href', '#')
                                        .click(function(e) {
                                            e.preventDefault();
                                            var s = $(this).closest('.a-MiniCalendar-monthSelector');
                                            s.data('year', s.data('year') + 1);
                                            $('.a-MiniCalendar-monthSelector-year', s).text(s.data('year'));
                                            _styleMonthSelector();
                                        })
                                )*/
                        )
                        
                );

            gMonthSelector.data('year', gActiveDate.getFullYear());
            gMonthSelector.data('month', gActiveDate.getMonth());

            var row;
            for (var i = 0; i < 4; i++) {
                row = _create('div')
                    .addClass('a-MiniCalendar-monthSelector-row')
                for (var j = 0; j < 3; j++) {
                    row.append(
                        _create('a')
                            .addClass('a-MiniCalendar-monthSelector-month')
                            .data('month', i * 3 + j)
                            .attr('href', '#')
                            .click(function(e) {
                                e.preventDefault();
                                gCalendar.data('month', $(this).data('month'));
                                gCalendar.data('year', gMonthSelector.data('year'));
                                _renderMonth();
                                gMonthSelector.hide();
                            })
                            .text(gMonths[i * 3 + j].short.toUpperCase())
                    )
                }
                gMonthSelector.append(row);
            }

            gCalendar.append(gMonthSelector);
            gMonthSelector.hide();
        }

        (gOptions.viewMode == 'month' ? _renderMonth : _renderYear)(gActiveDate);

        if (gOptions.showDateDetails) {
            _renderDateDetails(gActiveDate, gEventsContainer);
        } 
        

        /* Bind event handler to the apexrefresh event for the main region element.
         * Dynamic actions can then refresh the chart via the 'Refresh' action.
         *
         * We immediately trigger the event it to load the initial chart data.
         */
        gRegion
            .on( "apexrefresh", _refresh )
            .trigger( "apexrefresh" );
    } // _init

    // Renders the chart with the data provided in pData
    function _draw( pData ) {
        // Data point template:
        // {
        //   "date": "2014-10-30",
        //     OR
        //   "startDate": "2014-10-30",
        //   "endDate": "2014-10-30",
        //   
        //   "name": "My Event",
        //   "description"*: "This event is very important!",
        //   "heat"**: 95
        // }
        // * Optional
        // ** Alternative to name, must be in single "date" mode
        
        gData = pData.data;
        if (!gOptions.focusDate) {
            gOptions.focusDate = new Date(gData[0].date || gData[0].startDate);
            gActiveDate = _parseDate(gOptions.focusDate);
            gCalendar.data('year', gActiveDate.getFullYear());
            gCalendar.data('month', gActiveDate.getMonth());
        }
        (gOptions.viewMode == 'month' ? _renderMonth : _renderYear)(gActiveDate);

        if (gOptions.showDateDetails) {
            _renderDateDetails(gActiveDate, gEventsContainer);
        }
        /*gCalendar.prepend(_monthCalendar(7,2014));
        gCalendar.prepend(_monthCalendar(8,2014));
        gCalendar.prepend(_monthCalendar(9,2014));
        gCalendar.removeClass('a-MiniCalendar--month');
        gCalendar.addClass('a-MiniCalendar--year');
        _renderYear(2014);

        gEventsContainer = _create('div')
            .addClass('a-MiniCalendar-eventWrapper');
        gCalendar.append(gEventsContainer);

        gEventsContainerTooltip = _create('div')
            .addClass('a-MiniCalendar-eventWrapper a-MiniCalendar-eventWrapper--tooltip')
            .hide();
        gCalendar.append(gEventsContainerTooltip);

        gEventsContainerArrow = _create('div')
            .addClass('a-MiniCalendar-eventWrapperArrow')
            .hide();
        gCalendar.append(gEventsContainerArrow);*/
    } // _draw

    function _renderMonth(date) {

        if (typeof date == 'undefined') {
            date = new Date(gCalendar.data('year') + '-' + (gCalendar.data('month') + 1) + '-1');
        }

        var today = _truncateDate(new Date());
        var monthStart = _truncateMonth(date);
        var calendarStart = _addDays(monthStart, - monthStart.getDay());
        var monthEnd = _addDays(_addMonths(monthStart, 1), - 1);
        var calendarEnd = _addDays(monthEnd, 6 - monthEnd.getDay());

        /*gCalendar.empty()
            .append(
                gCalendarMonth = _create('h3')
                    .addClass('a-MiniCalendar-monthTitle')
                    .append(
                        _create('a')
                            .attr('href', '#')
                            .text(gMonths[monthStart.getMonth()].name + ' ' + monthStart.getFullYear())
                            .click(function(e){
                                e.preventDefault();
                                gMonthSelector.data('year', gCalendar.data('year'));
                                gMonthSelector.data('month', gCalendar.data('month'));
                                gMonthSelector
                                    .show()
                                    .position({
                                        my : 'left top',
                                        at : 'left bottom+5',
                                        of : gCalendarMonth,
                                        within: $(window),
                                        collision: 'fit'
                                    })
                                    .css({
                                        position : 'absolute'
                                    });
                                _styleMonthSelector();
                            })
                    )
            )
            .append(
                _bindCellEvents(_monthCalendar(date.getMonth(), date.getFullYear()))
            );*/
        
        gCalendar.empty()
            .append(
                _create('div').addClass('a-MiniCalendar-header')
                    .append(
                        _create('div').addClass('a-MiniCalendar-navBar')
                            .append(
                                _create('button').addClass('a-MiniCalendar-button a-MiniCalendar-button--icon a-MiniCalendar-button--prev')
                                    .attr('type', 'button')
                                    .click(function(e) {
                                        var month = gCalendar.data('month');
                                        var yearOffset = (month--) == 0 ? -1 : 0;
                                        (month == -1) && (month = 11); 
                                        gCalendar.data('month', month);
                                        gCalendar.data('year', gCalendar.data('year') + yearOffset);
                                        _renderMonth();
                                    })
                            )
                            .append(
                                gCalendarMonth = _create('span').addClass('a-MiniCalendar-title')
                                    .text(gMonths[monthStart.getMonth()].name + ' ' + monthStart.getFullYear())
                            )
                            .append(
                                _create('button').addClass('a-MiniCalendar-button a-MiniCalendar-button--today')
                                    .attr('type', 'button')
                                    .text('Today')
                                    .click(function(e) {
                                        gActiveDate = today;
                                        gCalendar.data('month', today.getMonth());
                                        gCalendar.data('year', today.getFullYear());
                                        _renderMonth(today);
                                    })
                            )
                            .append(
                                _create('button').addClass('a-MiniCalendar-button a-MiniCalendar-button--icon a-MiniCalendar-button--next')
                                    .attr('type', 'button')
                                    .click(function(e) {
                                        var month = gCalendar.data('month');
                                        var yearOffset = (month++) == 11 ? 1 : 0;
                                        (month == 12) && (month = 0); 
                                        gCalendar.data('month', month);
                                        gCalendar.data('year', gCalendar.data('year') + yearOffset);
                                        _renderMonth();
                                    })
                            )
                    )
            )
            .append(
                _create('div').addClass('a-MiniCalendar-wrapper')
                    .append(_bindCellEvents(_monthCalendar(date.getMonth(), date.getFullYear())))
            );
        
        gEventsContainer = _create('div')
            .addClass('a-MiniCalendar-eventWrapper');
        gCalendar.append(gEventsContainer);

        gEventsContainerTooltip = _create('div')
            .addClass('a-MiniCalendar-eventWrapper a-MiniCalendar-eventWrapper--tooltip')
            .hide();
        gCalendar.append(gEventsContainerTooltip);

        gEventsContainerArrow = _create('div')
            .addClass('a-MiniCalendar-eventWrapperArrow')
            .hide();
        gCalendar.append(gEventsContainerArrow);

        if (gOptions.showDateDetails) {
            _renderDateDetails(gActiveDate, gEventsContainer);
        }

        gMonthSelector = _create('div')
            .addClass('a-MiniCalendar-monthSelector')
            .append(
                _create('div')
                    .addClass('a-MiniCalendar-monthSelector-header')
                    .append(
                        _create('a')
                            .addClass('a-MiniCalendar-monthSelector-year-control')
                            .html('&#9668;')
                            .attr('href', '#')
                            .click(function(e) {
                                e.preventDefault();
                                var s = gMonthSelector;
                                s.data('year', s.data('year') - 1);
                                $('.a-MiniCalendar-monthSelector-year', s).text(s.data('year'));
                                _styleMonthSelector();
                            })
                    )
                    .append(
                        _create('div')
                            .addClass('a-MiniCalendar-monthSelector-year')
                            .text(gCalendar.data('year'))
                    )
                    .append(
                        _create('a')
                            .addClass('a-MiniCalendar-monthSelector-year-control')
                            .html('&#9658;')
                            .attr('href', '#')
                            .click(function(e) {
                                e.preventDefault();
                                var s = $(this).closest('.a-MiniCalendar-monthSelector');
                                s.data('year', s.data('year') + 1);
                                $('.a-MiniCalendar-monthSelector-year', s).text(s.data('year'));
                                _styleMonthSelector();
                            })
                    )
                    
            );

            gMonthSelector.data('year', gActiveDate.getFullYear());
            gMonthSelector.data('month', gActiveDate.getMonth());

            var row;
            for (var i = 0; i < 4; i++) {
                row = _create('div')
                    .addClass('a-MiniCalendar-monthSelector-row')
                for (var j = 0; j < 3; j++) {
                    row.append(
                        _create('a')
                            .addClass('a-MiniCalendar-monthSelector-month')
                            .data('month', i * 3 + j)
                            .attr('href', '#')
                            .click(function(e) {
                                e.preventDefault();
                                gCalendar.data('month', $(this).data('month'));
                                gCalendar.data('year', gMonthSelector.data('year'));
                                _renderMonth();
                                gMonthSelector.hide();
                            })
                            .text(gMonths[i * 3 + j].short.toUpperCase())
                    )
                }
                gMonthSelector.append(row);
            }

            gCalendar.append(gMonthSelector);
            gMonthSelector.hide();
    }

    function _bindCellEvents(calendar) {
        $(calendar).find('td.a-MiniCalendar-day')
            .filter(function(i, e){
                return !!($(e).data('events'));
            })
            .click(function(e) {
                gActiveDate = $(this).data('date');
                $('.a-MiniCalendar-day.is-active', calendar).removeClass('is-active');
                $(this).addClass('is-active');
                if (gOptions.showDateDetails) {
                    _renderDateDetails(gActiveDate, gEventsContainer);
                }
            })
            .hover(function(e) {
                if (gOptions.showTooltips) {
                    if(_renderDateDetails($(this).data('date'), gEventsContainerTooltip)) {
                        gEventsContainerTooltip
                            .show()
                            .position({
                                my: 'center bottom',
                                at: 'center top-7',
                                of: $(this),
                                within: $(window),
                                collision: 'none'
                            })
                            .css({
                                position: 'absolute'
                            });
                        gEventsContainerArrow
                            .show()
                            .position({
                                my: 'center bottom',
                                at: 'center top-8',
                                of: $(this),
                                within: $(window),
                                collision: 'none'
                            })
                            .css({
                                position: 'absolute'
                            });
                    }
                }
            }, function(e) {
                gEventsContainerTooltip.hide();
                gEventsContainerArrow.hide();
            });
        return calendar;
    }

    function _renderYear(date) {
        if (typeof date == 'undefined') {
            date = new Date(gCalendar.data('year') + '-' + (gCalendar.data('month') + 1) + '-1');
        }

        var y = date.getFullYear();
        gCalendar.empty()
            .append(
                _create('div')
                    .addClass('a-MiniCalendar-year')
                    .text(y)
            );
        for (var i = 0; i < gMonths.length; i++) {
            gCalendar.append(
                _create('div')
                    .addClass('a-MiniCalendar-monthContainer')
                        .append(
                            _create('h3')
                                .addClass('a-MiniCalendar-monthTitle')
                                .text(gMonths[i].name)
                        )
                        .append(
                            _bindCellEvents(_monthCalendar(i, y))
                        )
            );
        }
        gEventsContainer = _create('div')
            .addClass('a-MiniCalendar-eventWrapper');
        gCalendar.append(gEventsContainer);

        gEventsContainerTooltip = _create('div')
            .addClass('a-MiniCalendar-eventWrapper a-MiniCalendar-eventWrapper--tooltip')
            .hide();
        gCalendar.append(gEventsContainerTooltip);

        gEventsContainerArrow = _create('div')
            .addClass('a-MiniCalendar-eventWrapperArrow')
            .hide();
        gCalendar.append(gEventsContainerArrow);
    }

    function _monthCalendar(m, y) {
        var calendar = _create('table')
            .addClass('a-MiniCalendar-month');
        var calendarHeaders = _create('thead')
            .appendTo(calendar);
        calendarHeaders = _create('tr')
            .appendTo(calendarHeaders);
        var calendarBody = _create('tbody')
            .appendTo(calendar);
        var days = gDays;
        for (var i = days.length - 1; i >= 0; i--) {
            days[i].headerId = pRegionId + '_HEAD_' + days[i].id;
            calendarHeaders.prepend(
                _create('th')
                    .addClass('a-MiniCalendar-dayOfWeek')
                    .attr({
                        scope: 'col',
                        id: days[i].headerId,
                        title: days[i].name
                    })
                    .text(days[i].short)
            );
        };

        var today = _truncateDate(new Date());
        var monthStart = new Date();
        monthStart.setFullYear(y);
        monthStart.setMonth(m);
        monthStart.setDate(1);
        monthStart = _truncateDate(monthStart);
        var calendarStart = _addDays(monthStart, - monthStart.getDay());
        var monthEnd = _addDays(_addMonths(monthStart, 1), - 1);
        var calendarEnd = _addDays(monthEnd, 6 - monthEnd.getDay());

        var currentDate = calendarStart;
        var currentWeekRow;
        var currentDateCell;
        var currentEvents;
        var prevMonthCell;
        var nextMonthCell;
        var weeks = 0;
        do {
            calendarBody.append(
                currentWeekRow = _create('tr')
            );
            weeks++;
            for (var i = 0; i < 7; i++) {
                currentWeekRow.append(
                    currentDateCell = _create('td')
                );
                currentDateCell
                    .addClass('a-MiniCalendar-day')
                    .attr('headers', gDays[currentDate.getDay()].headerId)
                    .data('date', currentDate)
                    .append(
                        _create('div')
                            .addClass('a-MiniCalendar-date')
                            .text(currentDate.getDate())
                    );
                if (currentDate.getMonth() != monthStart.getMonth()) {
                    currentDateCell.addClass('is-null');
                } else {
                    if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
                        currentDateCell.addClass('is-weekend');
                    }
                    if (currentDate.valueOf() == gActiveDate.valueOf()) {
                        currentDateCell.addClass('is-active');
                    }
                    if (currentDate.valueOf() == today.valueOf()) {
                        currentDateCell.addClass('is-today');
                    }
                    // If there's an event on this day
                    currentEvents = _eventsOf(currentDate);
                    if (currentEvents) {
                        currentDateCell.addClass('has-events');
                        currentDateCell.data('events', currentEvents);
                    }
                }
                currentDate = _addDays(currentDate, 1);
            };
        } while (currentDate <= calendarEnd);

        return calendar;
    }

    function _eventsOf(date) {
        date = _truncateDate(date);
        var currentStartDate;
        var currentEndDate;
        var events = [];
        for (var i = gData.length - 1; i >= 0; i--) {
            currentStartDate = _parseDate(gData[i].date || gData[i].startDate);
            currentEndDate = _parseDate(gData[i].endDate || gData[i].date);
            if (date >= currentStartDate && date <= currentEndDate) {
                events.push(gData[i]);
            }
        };

        if (events.length == 0) {
            return false;
        } 
        return events;
    }

    function _parseDate(s) {
        var r = new Date(s);
        r.setFullYear(r.getUTCFullYear());
        r.setMonth(r.getUTCMonth());
        r.setDate(r.getUTCDate());
        return _truncateDate(r);
    }

    function _renderDateDetails(date, container) {
        var events = _eventsOf(date);
        container.empty();
        if (!events) {
            container
                .append(
                    _create('div')
                        .addClass('a-MiniCalendar-eventDate')
                        .text(date.toLocaleDateString())
                )
                .append(
                    _create('div')
                        .addClass('a-MiniCalendar-noEventsMessage')
                        .text('No events found.')
                );
            return false;
        } else {
            for (var i = events.length - 1; i >= 0; i--) {
                container.prepend(
                    _create('div')
                        .addClass('a-MiniCalendar-event')
                        .append(
                            _create('div')
                                .addClass('a-MiniCalendar-eventName')
                                .append(
                                    _create('a')
                                        .attr({
                                            href: events[i].link,
                                            target: '_blank' 
                                        })
                                        .text(events[i].name)
                                )
                        )
                        .append(
                            _create('div')
                                .addClass('a-MiniCalendar-eventDescription')
                                .text(events[i].description)
                        )
                );
            };
            container.prepend(
                _create('div')
                    .addClass('a-MiniCalendar-eventDate')
                    .text(date.toLocaleDateString())
            );
        }
        return true;
    }

    // Removes everything inside the chart DIV
    function _clear() {
        
    } // _clear

    function _debug( something) {
        debugger;
    }

    // Called by the APEX refresh event to get new calendar data
    function _refresh() {

            server.plugin( gOptions.ajaxIdentifier,
            {
                pageItems: gOptions.pageItems
            }, {
                refreshObject: gRegion,
                clear:         _clear,
                success:       _draw,
                error:         _debug,
                loadingIndicator:         gCalendar,
                loadingIndicatorPosition: "append"
            });

    } // _refresh

}; // com_oracle_apex_mini_calendar

})( apex.util, apex.server, apex.jQuery );