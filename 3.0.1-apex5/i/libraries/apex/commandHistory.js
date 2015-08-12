/*global apex*/
/*!
 Command History - Undo/Redo facility using command pattern and a history list.
 Copyright (c) 2013, 2015, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @fileOverview
 * The apex.commandHistory is a singleton object for executing commands which perform some action and can
 * later be undone and then redone. The command objects are responsible for maintaining the
 * state necessary to undo the action and also redo it. Command objects are passed to the
 * commandHistory.execute method. The execute method calls the commands execute method
 * to performs some action and then saves the command in its internal history list.
 * The commandHistory.undo method is used to later undo a command. Any command that has been
 * undone can be redone by calling commandHistory.redo.
 *
 * A command object must have these methods
 * - execute() this method is called to initially take some action. It is possible for a command
 * to record something that has already happened for example a command can be created in response
 * to an event. In this case the command stores the state needed for undo but the execute method
 * does nothing.
 * - undo() this method is called to undo the action that has been executed or redone
 * - redo() this method is called to redo the action that has been undone
 * - label() this method returns a string that describes the action that the command does for
 * example "Delete record"
 *
 * The clear, execute, undo, and redo methods will trigger the "commandHistoryChange" event on the
 * document whenever there is a change in the state of undo and redo being possible or if the
 * undo/redo labels change. This event can be used to enable/disable undo and redo buttons.
 *
 * @todo should the command execute, undo, redo method return false to indicate a failure and if so
 * what does the history do.
 * What if operations are asynchronous?
 */

(function ( ns, debug, $ ) {
    "use strict";

    var makeCommandHistory = function () {
        // holds commands to undo or redo
        var history = [];
        // where we are in the undo/redo stack
        var present = -1;
        // error handler
        var errorHandler = null;

        /**
         * @class command
         * All commands have an interface like this
         */
        var baseCommandPrototype = {
            execute: function () {
            },
            undo: function () {
            },
            redo: function () {
                return this.execute();
            },
            label: function () {
                return "";
            }
        };

        function checkUndo() {
            if ( present < 0 ) {
                throw "Command history nothing to undo";
            }
        }

        function checkRedo() {
            if ( present >= history.length - 1 ) {
                throw "Command history nothing to redo";
            }
        }

        return {

            /**
             * Removes all commands from the commandHistory. This can be useful after data has been committed if
             * you don't want to allow undo past the commit point or if the "document" or app instance data being
             * edited changes.
             * @memberOf apex.commandHistory
             */
            clear: function () {
                history = [];
                present = -1;
                $(document).trigger( "commandHistoryChange" );
            },

            /**
             * Execute the given command and add it to the command history.
             * @memberOf apex.commandHistory
             * @param {command} command to execute. The execute method of the command object is called.
             */
            execute: function ( command ) {
                try {
                    debug.info("Execute command: " + command.label() );
                    command.execute();
                } catch ( ex ) {
                    debug.error("Exception during execute command.", ex  );
                    if ( errorHandler ) {
                        errorHandler( "execute", command, ex );
                    }
                    return; // the command failed so it is not added to the history
                }
                present += 1;
                if ( present < history.length ) {
                    history.length = present;
                }
                history.push( command );
                // changed from no undo possible to can undo or can no longer redo or labels changed
                $(document).trigger( "commandHistoryChange" );
            },

            /**
             * Undo the last command executed or redone.
             * @memberOf apex.commandHistory
             * @throws {string} error message if there is nothing to undo
             */
            undo: function () {
                checkUndo();
                try {
                    debug.info("Undo command: " + history[present].label() );
                    history[present].undo();
                } catch ( ex ) {
                    debug.error("Exception during undo command.", ex );
                    if ( errorHandler ) {
                        errorHandler( "undo", history[present], ex );
                    }
                    // the command failed so it cannot be redone or undone again - truncate the history here
                    history.length = present;
                    // fall through
                }
                present -= 1;
                // changed to nothing to undo or now can redo or labels changed
                $(document).trigger( "commandHistoryChange" );
            },

            /**
             * Redo the last command undone.
             * @memberOf apex.commandHistory
             * @throws {string} error message if there is nothing to redo
             */
            redo: function () {
                checkRedo();
                present += 1;
                try {
                    debug.info("Redo command: " + history[present].label() );
                    history[present].redo();
                } catch ( ex ) {
                    debug.error("Exception during redo command.", ex );
                    if ( errorHandler ) {
                        errorHandler( "redo", history[present], ex );
                    }
                    // the command failed so it cannot be undone or redone again - truncate the history here
                    history.length = present;
                    present -= 1;
                }
                // changed to no more to redo or labels changed
                $(document).trigger( "commandHistoryChange" );
            },

            /**
             * Determine if there is a command to undo.
             * @memberOf apex.commandHistory
             * @returns {boolean} true if calling undo is acceptable - there is something to undo.
             */
            canUndo: function () {
                return present >= 0;
            },

            /**
             * Determine if there is a command to redo.
             * @memberOf apex.commandHistory
             * @returns {boolean} true if calling redo is acceptable - there is something to redo.
             */
            canRedo: function () {
                return present < history.length - 1;
            },

            /**
             * Return the label of the next command to undo.
             * @memberOf apex.commandHistory
             * @throws {string} error message if there is nothing to undo
             * @returns {string} the label from the command that will be undone if undo is called
             */
            undoLabel: function () {
                checkUndo();
                return history[present].label();
            },

            /**
             * Return the label of the next command to redo.
             * @memberOf apex.commandHistory
             * @throws {string} error message if there is nothing to redo
             * @returns {string} the label from the command that will be redone if redo is called
             */
            redoLabel: function () {
                checkRedo();
                return history[present + 1].label();
            },

            /**
             * Set a global error handler function to be called if there is an exception during
             * execute, undo, or redo. The function is called with the operation ("execute", "undo", "redo")
             * the command object, and the exception.
             *
             * @param fn the function to call when there is an exception
             */
            setErrorHandler: function( fn ) {
                errorHandler = fn;
            },

            /**
             * Get the global error handler function to be called if there is an exception during
             * execute, undo, or redo.
             *
             * @return errorHandler function
             */
            getErrorHandler: function() {
                return errorHandler;
            },

            /**
             * This is a maker function that returns an instance of a base command object
             * that can be used as a prototype for other commands. The undo and execute
             * methods do nothing. The redo method calls execute and label returns empty string.
             * @return {command} an object that implements the command interface
             */
            baseCommand: function () {
                return Object.create( baseCommandPrototype );
            }

        };
    };

    ns.commandHistory = makeCommandHistory();
    /**
     * In rare cases where a single page needs to maintain two distinct undo/redo command histories
     * use newCommandHistory to create a separate history stack.
     */
    ns.commandHistory.newCommandHistory = makeCommandHistory;

})( apex, apex.debug, apex.jQuery );
