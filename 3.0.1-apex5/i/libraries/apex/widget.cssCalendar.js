/**
 * @fileOverview
 * The {@link apex.widget}.cssCalendar is used for the CSS Calendar widget of Oracle Application Express.
 **/

(function( widget, util, server, $ ) {

/**
 * @param {String} pSelector  jQuery selector to identify APEX regions(s) for this widget.
 * @param {Object} [pOptions]
 *
 * @function cssCalendar
 * @memberOf apex.widget
 * */
 
widget.cssCalendar = function( pRegionId, pOptions, pLocale ) {

    // Default our options and store them with the "global" prefix, because it's
    // used by the different functions as closure
    var gOptions, gRegion$, gCalendar$, gLocale$, gAllDay, gHoverOver, gDialog$, gCalStorage, gLastView;
        
    _init();

    function _init() {
    
        gOptions = $.extend({
                enableDragAndDrop: false,
                pageItems:         ""
            }, pOptions );
        gRegion$   = $( '#' + util.escapeCSS( pRegionId ), apex.gPageContext$ );
        gCalendar$ = $( "#" + util.escapeCSS( pRegionId + "_calendar" ), apex.gPageContext$);
        
        gLocale$     = $.fullCalendar.defaults;
        // get defaults values
        gOptions = $.extend( gOptions, gLocale$);
        
        // if there is no region container, add one on the fly. It's necessary for our refresh mechanism
        if( gRegion$.length === 0 ) {
            gRegion$ = gCalendar$.wrap( '<div id="' + pRegionId + '"></div>' );
        }

        // make changes of time format if user has chosen to do so
        gOptions.timeFormat = {
            month: '',
            list:'',
            agenda:''
          };
        // user will choose own settings 12 or 24
        if(gOptions.timeFormatType === '12') {
            gOptions.axisFormat = 'h(:mm)a';
            gOptions.timeFormat = {
                month: '',
                list: 'h:mm a',
                agenda:''
            };
        } else if(gOptions.timeFormatType === '24') {
            gOptions.axisFormat = 'H:mm';
            gOptions.timeFormat = {
                month: '',
                list: 'H:mm',
                agenda:'',
            };
        }
        // firstday of the week , ,timeformat, dateformat have been overwritten so that we can pull data from calendar attributes
        // check if we need all-day slot
        gAllDay = false;
        if ( gOptions.apexWebLink  || gOptions.googleId ) {
            gAllDay = true;
        }
        // make some updates from the defaults values
        gOptions.columnFormat = {
                                    month: 'dddd',    // Mon
                                    week: 'ddd M/D', // Mon 9/7
                                    day: 'dddd'      // Monday
                                };

        //make sure if no drag&drop, it is tottaly disabled
        if (gOptions.enableDragAndDrop){
            // adjust the resize depending on drag and drop and end column
            if ( gOptions.enableResizing ) {
                gOptions.eventStartEditable = true;
                gOptions.eventDurationEditable = true;
                gOptions.editable = true;
            } else {
                gOptions.editable = true;
                gOptions.eventStartEditable = true;
                gOptions.eventDurationEditable = false;
            }           
        } else {
            gOptions.eventStartEditable = false;
            gOptions.eventDurationEditable = false;
            gOptions.editable = false;
        }                                

        // The session storage to keep track of the calendar view, date changes
        gCalStorage = apex.storage.getScopedSessionStorage(  { 
                                            prefix: "ORA_WWV_apex.Calendar", 
                                            useAppId: true, 
                                            usePageId: true, 
                                            regionId : pRegionId } );
        //if the item already exists, make sure we know where the user was (view and date)
        gLastView = gCalStorage.getItem("lastview");

        //if item lastview exists then try to parse it
        var currentDate = moment();   //the date we want calendar to start from  
        if ( gLastView ) {
            try {
                gLastView = $.parseJSON(gLastView);
                // is this a good json object ? then check if it has the correct moment objects
                if (gLastView !== null) {
                    if( moment(gLastView.viewStartDate).isValid() ) {
                        currentDate = gLastView.viewStartDate;
                    }
                }
            } catch ( ex ) {
                currentDate = moment();     //make sure the start date is today
                gLastView   = null;         //make sure this is set to null
            }
        } 

        if (!gOptions.isMobile )
        {
            gCalendar$.fullCalendar({
                theme: true,
                header:                 JSON.parse(gOptions.calendarHeader),
                monthNames:             gOptions.monthNames, 
                monthNamesShort:        gOptions.monthNamesShort, 
                dayNames:               gOptions.dayNames, 
                dayNamesShort:          gOptions.dayNamesShort, 
                buttonText:             gOptions.buttonText,
                timeFormat:             gOptions.timeFormat,
                columnFormat:           gOptions.columnFormat,
                titleFormat:            gOptions.titleFormat,
                axisFormat:             gOptions.axisFormat,
                firstDay:               gOptions.firstDayOfWeek,
                isRTL:                  gOptions.isRTL,
                editable:               gOptions.editable,
                eventStartEditable:     gOptions.eventStartEditable,
                eventDurationEditable:  gOptions.eventDurationEditable,
                nextDayThreshold:       '00:00:00',
                weekends:               gOptions.weekEnds,
                eventLimit:             parseInt(gOptions.eventLimit),
                defaultTimedEventDuration: '01:00:00',
                aspectRatio:            2.6,
                scrollTime:             lPadTime(gOptions.startingHour),
                minHour:                gOptions.minHour,
                maxHour:                gOptions.maxHour,
                allDaySlot:             gAllDay,
                allDayDefault:          gAllDay,
                googleCalendarApiKey:   gOptions.googleApiKey,
                defaultDate:            currentDate,
                eventSources: [ 
                               {
                                    events:           _getEvents,
                                    editable:         gOptions.editable,
                                    startEditable:    gOptions.eventStartEditable,
                                    durationEditable: gOptions.eventDurationEditable
                               },
                               {
                                    googleCalendarId: gOptions.googleId,
                                    className:        'fc-apex-events-gcal'
                                },
                               {
                                    events:          _getWebserviceEvents,
                                    editable:        false,
                                    className:       'fc-apex-events-webservice'
                                }
                              ],
                eventResize:     _eventResize,
                eventDrop:       _eventDrop,
                dayClick:        _dayClick,
                eventClick:      _eventClick,
                eventMouseover:  _eventMouseOver,
                eventMouseout:   _eventMouseOut,
                windowResize:    _windowResize,
                slotEventOverlap: false,
                defaultEventMinutes: 60,
                selectable:      true,
                selectHelper:    true,
                fixedWeekCount:  false,
                select:          _calSelect,
                viewRender:      function(view, element ) {
                    //next, prev, or views changes are all captured here
                    gCalStorage.setItem( "lastview", JSON.stringify( {viewType: view.name, viewStartDate: view.intervalStart} ) );
                },
                eventRender:     function(event, element) {
                    if ( gOptions.escapeOutput ) {
                        element.find('span.fc-title').html(element.find('span.fc-title').text());
                        element.find('div.fc-title').html(element.find('div.fc-title').text());
                        element.find('div.fc-eventlist-title').html(element.find('div.fc-eventlist-title').text());
                        element.find('span.fc-apex-tooltip-desc').html(element.find('span.fc-apex-tooltip-desc').text());
                        element.find('div.fc-eventlist-desc').html(element.find('div.fc-eventlist-desc').text());
                    }
                    /* 
                    once decided to send email from month view, this will be icon for that 
                    if (gOptions.sendInvitation) { 
                      element.find(".fc-title").after($('<a class="a-CC-shareLink" href="#"><span class=\"a-Icon icon-region-native-calendar u-pullRight\"></span></a>'));
                    }
                    */
                },                
                eventAfterAllRender: function(view) {
                    //$.find('span.fc-title').html($.find('span.fc-title').text());
                    //$.find('table.fc-agenda-days')[0].summary = view.title;              
                }
                /*
                    // code to wrap anchor around button  and data for keyboard access
                    $.each($.find('span.fc-button'),function() {
                        if ($(this).parent()[0].tagName != 'A') {
                            $(this).wrap('<a href="#" alt="" role="button"></a>');
                        }
                    });
                    $.each($.find('div.fc-event-inner'),function() {
                        if ($(this).parent()[0].tagName != 'A') {
                            $(this).wrap('<a href="#" alt=""></a>');
                        }
                    });
                     
                    $('a[role="button"]').on('focus', function(e) {
                        $(this).children().css('border','2px solid #E2C86F');    
                    });
                    $('a[role="button"]').on('blur', function(e) {
                        $(this).children().css('border','');    
                    });
                    // code to call the click event when enter key is pressed
                    $('a[role="button"]').on("keyup",function(e) {
                        if(e.keyCode == 13 || e.keyCode == 32) { 
                            $(this.children).trigger('click');
                        }
                    });
                    
                    $('a.fc-event').on('focus', function(e) {
                        $(this).css('border','2px solid #E2C86F');    
                    });
                    $('a.fc-event').on('blur', function(e) {
                        $(this).css('border','');    
                    });
                      
                    if (view.name === 'agendaWeek' || view.name === 'agendaDay') {
                        // code to add scope attribute to the table header 
                        $.each($.find('th[class*="fc-col"]'),function() {
                            if ($(this).prop('scope') == "") {
                                $(this).prop("scope","col");
                            }
                        });
                        //Scope = col for the time display of the calendar
                        $.each($.find('th.fc-agenda-axis.ui-widget-header'),function() {
                            if ($(this).prop('scope') == "") {
                                $(this).prop("scope","row");
                            }
                        });
                    
                    }
                    if ( view.name === 'month' ) {
                        // code to add scope attribute to the table header 
                        $.each($.find('th.fc-day-header'),function() {
                            if ($(this).prop('scope') == "") {
                                $(this).prop("scope","col");
                            }
                        });

                        $.find('table.fc-border-separate')[0].summary = view.title;
                            $.each($.find('td.fc-day:not(.fc-other-month)'), function() {
                            $(this).css( 'cursor', 'pointer' );
                        });

                    } else if ( view.name === 'agendaWeek' ) {
                        //Scope = col for the time display of the calendar
                        $.each($.find('table.fc-agenda-slots'),function() {
                            if ($(this).prop('summary') == "") {
                                $(this).prop("summary",view.title);
                            }
                        });

                        $.find('table.fc-agenda-days')[0].summary = view.title;
                        $.each($.find('table.fc-agenda-slots td.ui-widget-content'), function() {
                            $(this).css( 'cursor', 'pointer' );
                        });
                        $.each($.find('table.fc-agenda-allday div.fc-day-content'), function() {
                            $(this).css( 'cursor', 'pointer' );
                        });
                        $.each($.find('div.fc-event-inner'), function() {
                            if ($(this).parent()[0] != 'a') {
                                $(this).wrap('<a href="#" style="text-decoration:none;"></a>');
                            } 
                        });

                        $('div.fc-event.fc-event-vert.fc-event-start.fc-event-end a').on('focus', function(e) {
                            $(this).parent().css('border','2px solid #E2C86F');    
                        });
                        $('div.fc-event.fc-event-vert.fc-event-start.fc-event-end a').on('blur', function(e) {
                            $(this).parent().css('border','');    
                        });

                    } else if ( view.name === 'agendaDay') {
                        //Scope = col for the time display of the calendar
                        $.each($.find('table.fc-agenda-slots'),function() {
                            if ($(this).prop('summary') == "") {
                                $(this).prop("summary",view.title);
                            }
                        });
                       
                        $.find('table.fc-agenda-days')[0].summary = view.title;
                        $.each($.find('table.fc-agenda-slots td.ui-widget-content'), function() {
                            $(this).css( 'cursor', 'normal' );
                        });
                        $.each($.find('table.fc-agenda-allday div.fc-day-content'), function() {
                            $(this).css( 'cursor', 'normal' );
                        });

                        $.each($.find('div.fc-event-inner'), function() {
                            if ($(this).parent()[0] != 'a') {
                                $(this).wrap('<a href="#" style="text-decoration:none;"></a>');
                            } 
                        });

                        $('div.fc-event.fc-event-vert.fc-event-start.fc-event-end a').on('focus', function(e) {
                            e.preventDefault();
                            $(this).parent().css('border','2px solid #E2C86F');    
                        });
                        $('div.fc-event.fc-event-vert.fc-event-start.fc-event-end a').on('blur', function(e) {
                            e.preventDefault();
                            $(this).parent().css('border','');   
                        });
                    }

                 } */
            });
        } else {
            server.plugin( gOptions.ajaxIdentifier,
                {
                    x01:       "MON_SAME", /* action */
                    x02:       gOptions.startDate, /* start date */
                    x03:       gOptions.endDate,   /* end date */
                    x09:       gOptions.curDate,  /* current date or Today's date */
                    pageItems: gOptions.pageItems
                }, {dataType     : "html",
                    refreshObject: gRegion$,
                    success:       function( pData ) {
                                       //pCallback( pData );
                                       apex.jQuery(gRegion$, apex.gPageContext$).html( pData ).trigger("create");
                                   },
                    error:         function( pjqXHR, pTextStatus, pErrorThrown) {
                                      window.alert( pErrorThrown );                                   
                                   }
            });        
        
        }


        /* Bind event handler to the apexrefresh event for the main region element. Dynamic actions can then
         * refresh the chart via the 'Refresh' action.
         */
        gRegion$.on( "apexrefresh", function() {
            _refresh();
        });
        
        gCalendar$.on( "apexafterclosedialog", function() {
              // refresh your calendar region, do you have a refresh method, if so...
              _refresh();
        });

       
        gDialog$ = $( "div.fc-apex-dialog-invitation" ).dialog({
                autoOpen: false,
                height:   450,
                width:    650,
                modal:     true,
                buttons: {
                    "Send Email": sendingEmail,
                    Cancel: function() {
                        gDialog$.dialog( "close" );
                    }
                },
                close: function() {
                    //form[ 0 ].reset();
                    //allFields.removeClass( "ui-state-error" );
                }
            });

        var form = gDialog$.find( "form" ).on( "submit", function( event ) {
              event.preventDefault();
              sendingEmail();
            });
            
        // make sure the user goes back to his previous view
        if (gLastView !== null) {
            if( moment(gLastView.viewStartDate).isValid() ) {
                if( gLastView.viewType === 'month'     || gLastView.viewType === 'agendaWeek' || 
                    gLastView.viewType === 'agendaDay' || gLastView.viewType === 'list' ) {
                    gCalendar$.fullCalendar('changeView', gLastView.viewType);
                }
            }
        }

    } // _init
    

    function sendingEmail(pEvent){
        var lEvent = $(this).data('event');
        widget.cssCalendar.sendEmail('S', lEvent);
        gDialog$.dialog( "close" );
    }
    function lPadTime( pTime ) {
            return ( pTime <= 9 ? "0" + pTime +":00:00" : "" + pTime +":00:00");
    }

    // Called by the APEX refresh event to refetch events
    function _refresh() {
        gCalendar$.fullCalendar( 'refetchEvents' );
    } // _refresh


    // Return a date object in the format YYYYMMDDHH24MISS
    function _convertDateToString( pDate ) {
        function lPad( pValue ) {
            return ( pValue <= 9 ? "0" + pValue : "" + pValue );
        } // lPad

        if ( $.type( pDate ) === "date" ) {
            return pDate.getFullYear() + lPad( pDate.getMonth() + 1 ) + lPad( pDate.getDate() ) + lPad( pDate.getHours() ) + lPad( pDate.getMinutes() ) + lPad( pDate.getSeconds() );
        } else {
            return pDate;
        }
    } // _convertDateToString


    function _addDelta ( pDate, pDayDelta, pMinuteDelta, pAllDay ) {
        var lDate;

        if ( $.type( pDate ) === "date" ) {
            lDate = new Date( pDate ); // create a real copy of pDate, otherwise we would indirectly manipulate pDate

            if ( pDayDelta !== 0 ) {
                lDate.setTime( lDate.getTime() + ( pDayDelta * 24 * 60 * 60 * 1000 ));
            }
            if ( pMinuteDelta !== 0 ) {
                lDate.setTime( lDate.getTime() + ( pMinuteDelta * 60 * 1000 ));
            }
            // Reset time portion of date if we are just interested in the date
            if ( pAllDay ) {
                lDate = new Date( lDate.getFullYear(), lDate.getMonth(), lDate.getDate(), 0, 0, 0, 0 );
            }
        }
        return lDate;
    } // _addDelta


    // Populates the FullCalendar with new events by issuing an AJAX request to the server
    function _getEvents( pStart, pEnd, pTimezone, pCallback) {
        // make ajax call, to get events objects
        server.plugin( gOptions.ajaxIdentifier,
            {
                x01:       "GET", /* action */
                x02:       _convertDateToString( pStart.toDate() ), /* start date */
                x03:       _convertDateToString( pEnd.toDate() ),   /* end date */
                pageItems: gOptions.pageItems
            }, {
                refreshObject: gRegion$,
                success:       function( pData ) {
                                   // Call the FullCalendar with the events the AJAX called returned
                                   pCallback( pData );
                               }
            });
    } // _getEvents
    
    
    // Populates the Fullcalendar with new events from apex webservice if used
    function _getWebserviceEvents( pStart, pEnd, pTimezone, pCallback) {
        if ( gOptions.apexWebLink ) {
            $.ajax({
                url: gOptions.apexWebLink,
                dataType: 'json',
                jsonp: false,                
                success: function(data) {
                    pCallback(data["items"]);
                }
            });
        } else {
           pCallback({});
        }
    }
    
    // To make the css calendar responsive
    // Followup wth Marc and Shakeeb
    // add number of days PMANIRAHO**!!
    function _windowResize( view ){
        var lWidth  =  $(window).width();
        if( view.name === 'month' ) {
            if( $(window).width() < 700 ) {
               gCalendar$.fullCalendar('changeView', 'list' );
               gCalendar$.fullCalendar('option', 'aspectRatio', 1.0);               
            }
        } else if( view.name === 'list' ) {
            if( lWidth > 700 ) {
               gCalendar$.fullCalendar('changeView', 'month' );
            }
        }
        
    }


    // Issues an AJAX call to update the event on the server in case a user dragged or resized it
    function _changeEvent( pEvent, pDurationDelta, pRevertFunction) {
        
        server.plugin( gOptions.ajaxIdentifier,
            {
                x01:       "CHANGE",
                x02:       pEvent.start.format('YYYYMMDDHHmmss'),
                x03:       ((pEvent.end !== null)? pEvent.end.format('YYYYMMDDHHmmss'): null ),
                x04:       pEvent.id,
                x05:       pEvent.checksum,
                pageItems: gOptions.pageItems
            }, {refreshObject: gRegion$,
                error: function( pjqXHR, pTextStatus, pErrorThrown) {
                    window.alert( pErrorThrown );
                    //window.alert( 'Error ! your changes failed' );
                    // Revert drag and drop or resize operation if an error occurred on the backend
                    pRevertFunction();
                }
            });

    } // _changeEvent


    // Issues an AJAX call to update the event on the server in case a user has drag and dropped an event to a different date
    function _eventDrop( pEvent, pDurationDelta, pRevertFunction) {
        _changeEvent( pEvent, pDurationDelta, pRevertFunction);
    } // _eventDrop


    // Issues an AJAX call to update the event on the server in case a user changed the end date of an event
    function _eventResize( pEvent, pDurationDelta, pRevertFunction) {
        _changeEvent( pEvent, pDurationDelta, pRevertFunction);
    } // _eventResize


    function _dayClick( pDate, pAllDay, pJsEvent, pView ){
    /* with select event handled, dont need to implement this */
    } // _dayClick
    
    function _eventClick( pEvent, pJsEvent, pView ) {
        var eDisplay = '<span class="fc-apex-dialog-title">'+ pEvent.title +'</span>';
                        eDisplay = eDisplay + '<span class="fc-apex-dialog-date">'+
                                               (pEvent.allDay ? pEvent.start.format('lll') : pEvent.start.format('ll') )+
                                               '</span>';
                        if ( pEvent.end ) {
                            eDisplay = eDisplay + '<span class="fc-apex-dialog-date">'+
                                               ( pEvent.allDay ? pEvent.end.format('lll') : pEvent.end.format('ll') ) +
                                               '</span>';
                        }
                        if ( pEvent.description ) {
                            eDisplay = eDisplay + '<span class="fc-apex-dialog-desc">'+ htmlEscape(pEvent.description) +'</span>';
                        }
                            
        if(pJsEvent.target.className == 'a-Icon icon-region-native-calendar u-pullRight') {
            $('div.fc-apex-dialog-details').html(eDisplay);
            gDialog$.data('event', pEvent)
                    .dialog( "open" );
            return false;
        }
        if(pEvent.url) {
            apex.navigation.redirect(pEvent.url);
            }
        return false;
    } // _eventClick
    
    function htmlEscape(s) {
        return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#039;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '<br />');
    }
    
    function _eventMouseOver ( pEvent, pJsEvent, pView ) {
        var dateDisplay;
        if ( gOptions.mouseHoverOver ) {
            if(pEvent.end) {
                if(pEvent.allDay) {
                    dateDisplay = $.fullCalendar.formatRange(pEvent.start, pEvent.end, 'll');
                } else {
                    dateDisplay = $.fullCalendar.formatRange(pEvent.start, pEvent.end, 'lll');
                }
            }else {
                if(pEvent.allDay) {
                    dateDisplay = pEvent.start.format('ll');
                } else {
                    dateDisplay = pEvent.start.format('lll');
                }
            }
            var tooltip = '<div class="fc-apex-tooltip"> '+ 
                          '<span class="fc-apex-tooltip-title">'+ pEvent.title +'</span>';
                            if ( pEvent.description ) {
                                tooltip = tooltip + '<span class="fc-apex-tooltip-desc">'+ htmlEscape(pEvent.description) +'</span>';
                            }
                            tooltip = tooltip + '<span class="fc-apex-tooltip-date">'+dateDisplay+'</span>';
                            tooltip = tooltip + '</div>';

            gCalendar$.append(tooltip);
//            $('.fc-apex-tooltip').css("position", "fixed");
            $(this).mouseover(function(e) {
                $(this).css('z-index', 10000);
                $('.fc-apex-tooltip').fadeIn('500');
                $('.fc-apex-tooltip').fadeTo('10', 1.9);
            }).mousemove(function(e) {
                var tooltip$ = $('.fc-apex-tooltip');
                // Make sure that the tooltip is positioned no greater than the width of the page minus the tool tip width!
                // A simple clamp in other words.
                var suggestedLeft = e.clientX + 10;
                var realLeft = Math.min($(window).width() - tooltip$.width() - 40, suggestedLeft);
                tooltip$.css('left', realLeft);

                // The top calculation  little different than the clamp used in the left-- if were to clamp it here, the tooltip would overshadow
                // the text being hovered!
                // Instead we need to invert the position of the tooltip (place it above the hovered text instead of below)
                // so that it can still fit on the page and not obscure the hovered text.
                var suggestedTop = e.clientY + 10,
                    realTop = suggestedTop;
                if (suggestedTop + tooltip$.height() > $(window).height()) {
                    realTop = e.clientY - tooltip$.height() - 30;
                }
                tooltip$.css('top', realTop);

            });            
        }
    }
    
    function _eventMouseOut( pEvent, pJsEvent, pView ) {
        $(this).css('z-index', 8);
        $('.fc-apex-tooltip').remove();
    }
    
    function _calSelect(pStart, pEnd, allDay) {
        var cLink;
        var view  = gCalendar$.fullCalendar('getView');
        //for month view, use exclusive date and time, other views inclusive
        if (view.name === 'month') {
            pEnd.subtract(1, 'minutes');
        }
        if ( gOptions.createLink ) {
            cLink = gOptions.createLink;
            cLink = cLink.replace('~APEX_NEW_START_DATE~',pStart.format(gOptions.appDateFormat));
            cLink = cLink.replace('~APEX_NEW_END_DATE~',pEnd.format(gOptions.appDateFormat));
            apex.navigation.redirect(cLink); 
        }

        /* this is necessary once we have dialogs, because we wont leave the current page */
        gCalendar$.fullCalendar('unselect');
        gCalendar$.fullCalendar('rerenderEvent');
        _eventMouseOut;
    } // _calSelect
    
    
    widget.cssCalendar.download = function(pFormat) {

        var view  = gCalendar$.fullCalendar('getView');
        var lUrl = server.pluginUrl( gOptions.ajaxIdentifier,
            {
                x01:       "DOWNLOAD",
                x02:       _convertDateToString( view.start.toDate()),
                x03:       _convertDateToString( view.end.toDate()),              
                x06:       view.name,
                x07:       view.title,
                x10:       pFormat,
                pageItems: gOptions.pageItems
            }, {
                error: function( pjqXHR, pTextStatus, pErrorThrown) {
                    window.alert( 'Error : '+pErrorThrown );
                }
        });
        var lWindows = open(lUrl);
        lWindows.focus();
    };
    
    //widget.cssCalendar.sendEmail('S', pEvent, pTo, pFrom, pSubj);
    // pass a json format and use Christian package to read the json file
    widget.cssCalendar.sendEmail = function(pType, pEvent) {
        var lUrl, view;
        if (pType === 'S') {
            //lUrl = server.pluginUrl( gOptions.ajaxIdentifier,
           /* server.plugin( gOptions.ajaxIdentifier,
                {
                    x01:       "SEND",
                    x02:       pEvent.start.format('YYYYMMDDHHmmss'),
                    // x03:       ((pEvent.end !== null)? pEvent.end.format('YYYYMMDDHHmmss'): null ),
                    x04:       pEvent.id,
                    x05:       pEvent.checksum,
                    x06:       pEvent.url,
                    x07:       pEvent.title,
                    x08:       pEvent.description,
                    x10:       pType,
                    pageItems: gOptions.pageItems
                }, {
                refreshObject: gRegion$,
                success:    function( pData ) {
                            // Call the FullCalendar with the events the AJAX called returned
                            //pCallback( pData );
                            },
                error: function( pjqXHR, pTextStatus, pErrorThrown) {
                        window.alert( 'Error : '+pErrorThrown );
                }
            });
            */
            server.plugin( gOptions.ajaxIdentifier, 
                {
                    x01:       "SEND", /* action */
                    x02:       pEvent.start.format('YYYYMMDDHHmmss'),
                    x02:       pEvent.start.format('YYYYMMDDHHmmss'),
                    pageItems: gOptions.pageItems
                }, {dataType     : "html",
                    refreshObject: gRegion$,
                    error:         function( pjqXHR, pTextStatus, pErrorThrown) {
                                      window.alert( pErrorThrown );                                   
                }
            });         
        }
        else {
            view  = gCalendar$.fullCalendar('getView');
            //lUrl = server.pluginUrl( gOptions.ajaxIdentifier,
                server.pluginUrl( gOptions.ajaxIdentifier,
                {
                    x01:       "SEND",
                    x02:       _convertDateToString( view.start.toDate()),
                    x03:       _convertDateToString( view.end.toDate()),              
                    x06:       view.name,
                    x07:       view.title,
                    x09:       pType,
                    pageItems: gOptions.pageItems
                }, {
                    error: function( pjqXHR, pTextStatus, pErrorThrown) {
                        window.alert( 'Error : '+pErrorThrown );
                    }
            });
        }
        //var lWindows = open(lUrl);
        //lWindows.focus();
    };    
    
  /* function to show the day specific calendar event on Tap */
    widget.cssCalendar.mobileDayTap = function(pRegionId, pThis) {
        var lDate     = apex.jQuery( pThis ).data( "date" );
        var lDetails$ = apex.jQuery( "#calendar_day_details_" + pRegionId , apex.gPageContext$ );
        apex.jQuery( ".m-Calendar-day" ).removeClass( "is-active" );
        apex.jQuery( pThis ).addClass( "is-active" );
        apex.widget.cssCalendar.getDayData( pRegionId, lDate, {
                     clear: function() {
                            lDetails$.empty();
                     },
                     success: function( pData ) {
                            lDetails$.html( pData );
                     }
        });
    };

    /* function to load the current date's data after the calendar loads */
    widget.cssCalendar.mobileMonthLoad = function(pRegionId, pDate) {
        var lDetails$ = apex.jQuery( "#calendar_day_details_" + pRegionId, apex.gPageContext$ );
        var lMatch = 'td[data-date=' + pDate + ']';
        gOptions.curDate = pDate;
        apex.widget.cssCalendar.getDayData( pRegionId ,pDate, {
             clear: function() { lDetails$.empty();},
             success: function( pData ) {lDetails$.html( pData );}
        });
    };
    
    /* function to get the data of the date which is tapped or clicked */
    widget.cssCalendar.getDayData = function(pRegionId, pDate) {
            gOptions.curDate = pDate;
            server.plugin( gOptions.ajaxIdentifier,
                {
                    x01:       "GETDATA", /* action */
                    x09:       pDate,
                    x10:       pRegionId,
                    pageItems: gOptions.pageItems
                }, {dataType     : "html",
                    refreshObject: gRegion$,
                    success:       function( pData ) {
                                       apex.jQuery('#calendar_day_details_' + pRegionId , apex.gPageContext$).html( pData ).trigger("create");
                                   },
                    error:         function( pjqXHR, pTextStatus, pErrorThrown) {
                                      window.alert( pErrorThrown );                                   
                                   }
            });

    }; //getDayData
    
    /* main function to display the mobile calendar */
    widget.cssCalendar.getMobileCalendar = function( pTypeAction, pStart, pEnd, pCurrent, pCallback) {
            gOptions.startDate = pStart;
            gOptions.endDate = pEnd;
            gOptions.curDate = pCurrent;
            server.plugin( gOptions.ajaxIdentifier,
                {
                    x01:       pTypeAction, /* action */
                    x02:       gOptions.startDate, /* start date */
                    x03:       gOptions.endDate,   /* end date */
                    x09:       gOptions.curDate,   /* end date */
                    pageItems: gOptions.pageItems
                }, {dataType     : "html",
                    refreshObject: gRegion$,
                    success:       function( pData ) {
                                       //pCallback( pData );
                                       apex.jQuery(gRegion$, apex.gPageContext$).html( pData ).trigger("create");
                                   },
                    error:         function( pjqXHR, pTextStatus, pErrorThrown) {
                                      window.alert( pErrorThrown );                                   
                                   }
            });

    }; //getMobileCalendar


    pWidth = function(pDivId) {
        return apex.jQuery(pDivId).parent().width();
    }

    tDivs = function(pContainer, pDivId) {
        return apex.jQuery(pContainer + ' div[id=\"' + pDivId + '\"]').length;
    }

    lPos = function(pContainer, pDivId) {
        return apex.jQuery(pContainer + ' div[id=\"' + pDivId + '\"]:first').parent().position().left;
    }

    positionObjects = function(pContainer, pDivId,pInitPos,pWidth) {
        var lPos = pInitPos;
        apex.jQuery( pContainer + 'div[id=\"' + pDivId + '\"]').each(function( index ) {
          apex.jQuery(this).width(pWidth);
          apex.jQuery(this).css('left',lPos);
          lPos = lPos + pWidth;
        });
    }

    setHeight = function() {
        var lScroller = apex.jQuery('div[id="cal_scroll_div"]'),
            lViewHeight = Math.round(apex.jQuery('div[id="cal_main"]').width() / 1.35);
        var headHeight, allDayHeight, bodyHeight,lHeight,lBody; 
        lBody = apex.jQuery('table[id="cal_main_table"]').find('tbody')
        if (apex.jQuery(lBody).length == 1 ) {
            headHeight = apex.jQuery(lBody).position().top;
            allDayHeight = apex.jQuery(lScroller).position().top;
            bodyHeight = Math.min(lViewHeight - headHeight,apex.jQuery('div[id="cal_days"]').height() + allDayHeight + 1 );// when no scrollbars. +1 for bottom border
            lHeight = ((bodyHeight - allDayHeight - 1)) < 500 ? 500 : bodyHeight - allDayHeight - 1;
            lScroller.height(lHeight);
            apex.jQuery('div[id="cal_div_filler"]').height(lHeight+50);
        }
    }
    

    setWidth = function() {
        var lDwidth = apex.jQuery('td.m-Calendar-Day.priority1:first').width();
        var lHourwidth = apex.jQuery('th.m-Calendar-HourTitle:first').width(),lScrollDiv,lSWidth,lIWidth;
        lScrollDiv = apex.jQuery('div[id="cal_scroll_div"]');
        if ( apex.jQuery(lScrollDiv).length == 1) {
            lSWidth = apex.jQuery(lScrollDiv).get(0).clientWidth;
            lIWidth = apex.jQuery(lScrollDiv).width();
            if (!(lIWidth - lSWidth)) {
                apex.jQuery('td.m-Calendar-DivFiller').hide();
                apex.jQuery('th.m-Calendar-DivFiller').hide();
            } else {
                apex.jQuery('td.m-Calendar-DivFiller').show();
                apex.jQuery('th.m-Calendar-DivFiller').show();
            }
            apex.jQuery('th.m-Calendar-DayOfWeek').each(function(index) {
                apex.jQuery(this).width(lDwidth);
            });
            apex.jQuery('td.m-Calendar-AllDay').each(function(index) {
                apex.jQuery(this).width(lDwidth);
            });

            apex.jQuery('th.m-Calendar-AlldayTitle').each(function(index) {
                apex.jQuery(this).width(lHourwidth+1);
            });
            //setting the filler width
            apex.jQuery('th.m-Calendar-HeadFiller').width(lHourwidth+Math.round(lHourwidth/3));
            apex.jQuery('th.m-Calendar-DayOfWeek:first').css('left',apex.jQuery('td.m-Calendar-Day.priority1:first').position().left);
        }        
    }
    
    widget.cssCalendar.orientationchange = function(pCaltype,pEvent) {
        if ( pEvent.orientation === 'landscape') { 
            if (apex.jQuery(window).width() <= 480) { //devices with width similar to iPhone 
                if ( pCaltype === 'WEK') 
                    apex.widget.cssCalendar.getMobileCalendar('WKS_SAME',gOptions.startDate,gOptions.endDate,gOptions.curDate,'');
             }
        } else {
            if (apex.jQuery(window).width() <= 480 && ( pCaltype == 'WEK' || pCaltype == 'WKS')) 
                apex.widget.cssCalendar.getMobileCalendar('LST_SAME',gOptions.startDate,gOptions.endDate,gOptions.curDate,'');
        }
    }
    
    widget.cssCalendar.arrangeObjects = function(pContainer, pCount) {
            var index = 1, lWidth, lParentwidth ;
            setHeight();
            setWidth();
            for (var i=1; i <= pCount ; i++ ) {
                lParentwidth = pWidth(pContainer + 'div[id=day' + i + ']');
                lWidth = Math.round((lParentwidth - Math.round(lParentwidth / 20)) / tDivs(pContainer,'day'+i)) ;
                positionObjects(pContainer, 'day' + i,lPos(pContainer,'day'+i),lWidth);
            }
    };    
}; // cssCalendar

})( apex.widget, apex.util, apex.server, apex.jQuery );