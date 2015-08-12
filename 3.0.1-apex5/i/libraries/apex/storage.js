/*global apex,Modernizr*/
/*!
 Storage
 Copyright (c) 2012, 2014, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @fileOverview
 * The {@link apex}.storage namespace is used to store storage related functions of Oracle Application Express.
 **/

/**
 * @namespace
 **/
apex.storage = {};

(function( storage, $, undefined ) {
    "use strict";

    /**
     * @ignore
     **/
    storage.getCookieVal = function ( pOffset ) {
        var lEndPos = document.cookie.indexOf ( ";", pOffset );
        if ( lEndPos === -1 ) {
            lEndPos = document.cookie.length;
        }
        // todo unescape is deprecated?
        return unescape( document.cookie.substring( pOffset, lEndPos ) );
    };

    /**
     * Returns the value of cookie name (pName).
     *
     * @param {String} pName
     *
     * @function getCookie
     * @memberOf apex.storage
     * */
    storage.getCookie = function ( pName ) {
        var lArg = pName + "=",
            lArgLength = lArg.length,
            lCookieLength = document.cookie.length,
            i = 0;
        while ( i < lCookieLength ) {
            var j = i + lArgLength;
            if ( document.cookie.substring( i, j ) === lArg ) {
                return storage.getCookieVal( j );
            }
            i = document.cookie.indexOf( " ", i ) + 1;
            if ( i === 0 ) {
                break;
            }
        }
        return null;
    };

    /**
     * Sets a cookie (pName) to a specified value (pValue).
     *
     * @param {String} pName
     * @param {String} pValue
     *
     * @function setCookie
     * @memberOf apex.storage
     * */
    storage.setCookie = function ( pName, pValue ) {
        var argv    = arguments,
            argc    = arguments.length,
            expires = ( argc > 2 ) ? argv[ 2 ]  : null,
            path    = ( argc > 3 ) ? argv[ 3 ]  : null,
            domain  = ( argc > 4 ) ? argv[ 4 ]  : null,
            secure  = ( argc > 5 ) ? true       : false;

        // todo unescape is deprecated?
        document.cookie = pName + "=" + escape ( pValue ) +
            ( ( expires === null ) ? "" : ( "; expires=" + expires.toGMTString() ) ) +
            ( ( path    === null ) ? "" : ( "; path=" + path ) ) +
            ( ( domain  === null ) ? "" : ( "; domain=" + domain ) ) +
            ( ( secure  === true || window.location.protocol === "https:" ) ? "; secure" : "" );
    };

    /**
     * Returns true if the browser supports the local storage API and false otherwise.
     *
     * @function hasLocalStorageSupport
     * @memberOf apex.storage
     */
    storage.hasLocalStorageSupport = (function() {
        var localStorageSupport = null,
            test = "$test$";

        return function() {
            if ( localStorageSupport !== null ) {
                return localStorageSupport;
            }
            // if modernizr is present and has done the work use its answer
            if ( window.Modernizr && window.Modernizr.hasOwnProperty( "localstorage" )) {
                localStorageSupport = Modernizr.localstorage;
            } else {
                // use the same method that Modernizr uses for detection
                // see Modernizr source for why it is not as simple as if ( window.localStorage )
                try {
                    localStorage.setItem( test, test );
                    localStorage.removeItem( test );
                    localStorageSupport = true;
                } catch(e) {
                    localStorageSupport = false;
                }
            }
            return localStorageSupport;
        };
    })();

    /**
     * Returns true if the browser supports the session storage API and false otherwise.
     *
     * @function hasSessionStorageSupport
     * @memberOf apex.storage
     */
    storage.hasSessionStorageSupport = (function() {
        var sessionStorageSupport = null,
            test = "$test$";

        return function() {
            if ( sessionStorageSupport !== null ) {
                return sessionStorageSupport;
            }
            // if modernizr is present and has done the work use its answer
            if ( window.Modernizr && window.Modernizr.hasOwnProperty( "sessionstorage" )) {
                sessionStorageSupport = Modernizr.localstorage;
            } else {
                // use the same method that Modernizr uses for detection
                // see Modernizr source for why it is not as simple as if ( window.localStorage )
                try {
                    sessionStorage.setItem( test, test );
                    sessionStorage.removeItem( test );
                    sessionStorageSupport = true;
                } catch(e) {
                    sessionStorageSupport = false;
                }
            }
            return sessionStorageSupport;
        };
    })();

    function makeDomStorage( check, store, options ) {
        var that;
        if ( check() ) {
            that = Object.create( storagePrototype );
            that.prefix = makeKeyPrefix( options );
            that._store = store;
            that._re = new RegExp( "^" + that.prefix );
            that.length = countKeys( that._store, that._re );
        } else {
            that = Object.create( noopStoragePrototype );
            that.prefix = makeKeyPrefix( options );
        }
        return that;
    }

    function makeKeyPrefix( options ) {
        var prefix = ( options.prefix || "" ) + ".";

        if ( options.useAppId === undefined || options.AppId === null ) {
            options.useAppId = true;
        }
        if ( options.useAppId ) {
            prefix += $( "#pFlowId" ).val() + ".";
        }
        if ( options.usePageId ) {
            prefix += $( "#pFlowStepId" ).val() + ".";
        }
        if ( options.regionId ) {
            prefix += options.regionId + ".";
        }
        return prefix;
    }

    function countKeys( store, re ) {
        var i,
            count = 0;
        for ( i = 0; i < store.length; i++ ) {
            if ( re.test( store.key( i ) ) ) {
                count += 1;
            }
        }
        return count;
    }

    var storagePrototype = {
        prefix: "",
        length: 0,
        key: function( index ) {
            var i, k,
                scopeIndex = 0;

            if ( index < this._store.length ) {
                for ( i = 0; i < this._store.length; i++ ) {
                    k = this._store.key( i );
                    if ( this._re.test( k ) ) {
                        if ( index === scopeIndex ) {
                            return k;
                        }
                        scopeIndex += 1;
                    }
                }
            }
            return null;
        },
        getItem: function( key ) {
            return this._store.getItem( this.prefix + key );
        },
        setItem: function( key,  data ) {
            var old = this.getItem( key );
            this._store.setItem( this.prefix + key, data );
            // if there was no item before then one was added so increment length
            if ( old === null ) {
                this.length += 1;
            }
        },
        removeItem: function( key ) {
            var old = this.getItem( key );
            this._store.removeItem( this.prefix + key );
            // if there was an item it was removed so decrement length
            if ( old !== null ) {
                this.length -= 1;
            }
        },
        clear: function() {
            var i, k;

            for ( i = 0; i < this._store.length; i++ ) {
                k = this._store.key( i );
                if ( this._re.test( k ) ) {
                    this._store.removeItem( k );
                }
            }
            this.length = 0;
        },
        sync: function() {
            this.length = countKeys( this._store, this._re );
        }
    };

    var noopStoragePrototype = {
        prefix: "",
        length: 0,
        key: function( index ) {
            return null;
        },
        getItem: function( key ) {
            return null;
        },
        setItem: function( key,  data ) { },
        removeItem: function( key ) { },
        clear: function() { }
    };

    /**
     * getScopedSessionStorage
     * Returns a thin wrapper around the sessionStorage object that scopes all keys to a
     * prefix defined by the options parameter. If sessionStorage is not supported the returned
     * object can be used but has no effect. So it is not necessary include conditions involving
     * hasSessionStorageSupport.
     *
     * @param options an object used to define the DOM storage key prefix used by the returned sessionStorage wrapper object.
     * Options supports these optional properties:
     *  prefix: <string> a static prefix string to add to all keys
     *  useAppId: <bool> if true the application id will be included in the key (default is true)
     *  usePageId: <bool> if true the application id will be included in the key
     *  regionId: <string> an additional string to identify a region or other part of a page
     *
     * @return sessionStorage wrapper object
     *  {
     *      prefix: "",
     *      length: 0,
     *      key: function( index ) { },
     *      getItem: function( key ) { },
     *      setItem: function( key,  data ) { },
     *      removeItem: function( key ) { },
     *      clear: function() { },
     *      sync: function() { } // use to ensure the length property is correct if keys may have been added or removed
     *                           // by means external to this object
     *  }
     *
     * @example
     * var myStorage = apex.storage.getScopedSessionStorage( { prefix: "Acme", useAppId: true } );
     * ...
     * myStorage.setItem( "setting1", "on" ); // actual entry something like: "Acme.1872.setting1" = "on"
     * ...
     * setting = myStorage.getItem( "setting1" ); // returns "on"
     *
     * @function getScopedSessionStorage
     * @memberOf apex.storage
     */
    storage.getScopedSessionStorage = function( options ) {
        return makeDomStorage( storage.hasSessionStorageSupport, window.sessionStorage, options );
    };

    /**
     * getScopedLocalStorage
     * Returns a thin wrapper around the localStorage object that scopes all keys to a
     * prefix defined by the options parameter. If localStorage is not supported the returned
     * object can be used but has no effect. So it is not necessary include conditions involving
     * hasLocalStorageSupport.
     *
     * @param options an object used to define the DOM storage key prefix used by the returned localStorage wrapper object.
     * Options supports these optional properties:
     *  prefix: <string> a static prefix string to add to all keys
     *  useAppId: <bool> if true the application id will be included in the key (default is true)
     *  usePageId: <bool> if true the application id will be included in the key
     *  regionId: <string> an additional string to identify a region or other part of a page
     *
     * @return localStorage wrapper object
     *  {
     *      prefix: "",
     *      length: 0,
     *      key: function( index ) { },
     *      getItem: function( key ) { },
     *      setItem: function( key,  data ) { },
     *      removeItem: function( key ) { },
     *      clear: function() { },
     *      sync: function() { } // use to ensure the length property is correct if keys may have been added or removed
     *                           // by means external to this object
     *  }
     *
     * @example
     * var myStorage = apex.storage.getScopedLocalStorage( { prefix: "Acme", useAppId: true } );
     * ...
     * myStorage.setItem( "setting1", "on" ); // actual entry something like: "Acme.1872.setting1" = "on"
     * ...
     * setting = myStorage.getItem( "setting1" ); // returns "on"
     *
     * @function getScopedLocalStorage
     * @memberOf apex.storage
     */
    storage.getScopedLocalStorage = function( options ) {
        return makeDomStorage( storage.hasLocalStorageSupport, window.localStorage, options );
    };

})(apex.storage, apex.jQuery);
