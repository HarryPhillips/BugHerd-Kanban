/*
*   @type javascript
*   @name modal.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

/*
*   TODO
*   + Incorporate a config object to modify how modals react to
*     multiple modals at once.
*     (e.g. Auto-closing a modal on opening
*     of another, moving modals around the screen to show more than
*     one at a time perhaps?)
*
*   + Dynamic modal event handler attachment
*
*   + Modal event fires should be done in one function call
*/

define(
    [
        'config',
        'main/components/util',
        'main/components/events',
        'main/components/status',
        'main/components/http',
        'main/components/node',
        'main/components/viewloader'
    ],
    function (config,
        util, events,
        status, Http,
        Node, ViewLoader) {
        'use strict';
        
        // event logger
        function event_log(modal, event) {
            util.log(
                "context:gui/modals",
                "log",
                "Modal '" + modal.viewName + "' " +
                    "event '" + event + "' fired"
            );
        }
        
        // global/shared variables
        var gui,
            vloader = new ViewLoader(),
            ctrl;
        
        /* ModalController Class
        ---------------------------------------------*/
        function ModalController() {
            // modal objects/arrays
            this.list = {};
            this.openModals = [];
            this.queuedModals = [];
            
            // create logging context
            this.applyContext();
            
            // create events and process queue
            // on close and destruction
            events.subscribe("gui/modal/init", event_log);
            events.subscribe("gui/modal/load", event_log);
            events.subscribe("gui/modal/open", event_log);
            events.subscribe("gui/modal/close", event_log);
            events.subscribe("gui/modal/destruct", event_log);
            events.subscribe("gui/modal/confirm", event_log);
            events.subscribe("gui/modal/proceed", event_log);
            events.subscribe("gui/modal/cancel", event_log);
            
            // queue processing
            events.subscribe(
                "gui/modal/close",
                this.processQueue.bind(this)
            );
            events.subscribe(
                "gui/modal/destruct",
                this.processQueue.bind(this)
            );
        }
        
        // apply gui/modals logging context
        ModalController.prototype.applyContext = function () {
            events.subscribe("gui/loaded", function () {
                util.log(
                    "context:gui/modals",
                    "buffer",
                    "log-buffer: GUI-MODALS"
                );
            });
        };
        
        // add a new modal instance
        ModalController.prototype.addModal = function (modal) {
            this.list[modal.viewName] = modal;
        };
        
        // remove a modal instance
        ModalController.prototype.removeModal = function (modal) {
            delete this.list[modal.viewName || modal];
        };
        
        // adds a modal to the queue
        ModalController.prototype.addToQueue = function (modal) {
            // make sure not already in queue and not open
            if (this.isQueued(modal) || this.isOpen(modal)) {
                return;
            }
            
            // close current and open recent request
            // reopen the current modal when the new one
            // is closed
            if (this.getBehaviour("modalHopping")) {
                var prevModal = this.getModalByName(this.openModals[0]),
                    handler = function () {
                        // open the previously active modal
                        prevModal.open();
                        
                        // unsubscribe from the event
                        // to prevent more than on call
                        modal.off("close", handler);
                    };
                
                // close the active modal
                prevModal.close();
                
                // open the new modal and attach
                // a close handler to reopen the prev modal
                modal.open();
                modal.on("close", handler);
                         
                return;
            }
            
            // default behaviour - queded until current modal
            // has been closed
            this.queuedModals.push(modal.viewName || modal);
        };
        
        // removes a modal from the queue
        ModalController.prototype.removeFromQueue = function (modal) {
            var array = this.queuedModals,
                index = array.indexOf(modal.viewName || modal);
            
            this.queuedModals.splice(index, 1);
        };
        
        // adds a modal to the opened modals array
        ModalController.prototype.addToOpened = function (modal) {
            this.openModals.push(modal.viewName || modal);
        };
        
        // removes a modal from the opened modals array
        ModalController.prototype.removeFromOpened = function (modal) {
            var array = this.openModals,
                index = array.indexOf(modal.viewName || modal);
            
            this.openModals.splice(index, 1);
        };
        
        // begin processing the modal queue
        ModalController.prototype.processQueue = function () {
            var opened = this.openModals,
                queued = this.queuedModals,
                modal = queued[0];
            
            // check if there are no open modals
            // and there is at least one in queue
            if (!opened.length && queued.length) {
                // get modal and init
                modal = this.getModalByName(queued[0]);
                modal.init();
                
                // remove from queue
                this.removeFromQueue(modal);
            }
        };
        
        // checks if a modal is open
        ModalController.prototype.isOpen = function (modal) {
            modal = modal.viewName || modal;
            return this.openModals.indexOf(modal) !== -1;
        };
        
        // checks if a modal is queued
        ModalController.prototype.isQueued = function (modal) {
            modal = modal.viewName || modal;
            return this.queuedModals.indexOf(modal) !== -1;
        };
        
        // returns a modal by view name
        ModalController.prototype.getModalByName = function (name) {
            return this.list[name];
        };
        
        // checks if a modal exists
        ModalController.prototype.exists = function (name) {
            var exists = false,
                modal = this.getModalByName(name);
            
            // check definition
            if (typeof modal !== "undefined" && modal !== null) {
                exists = true;
            }
            
            return exists;
        };
        
        // checks a behaviour setting
        ModalController.prototype.getBehaviour = function (name) {
            return config.gui.modals.behaviour[name];
        };
        
        // modal controller instance
        ctrl = new ModalController();
        
        /* Modal Class
        ---------------------------------------------*/
        function Modal(view, params) {
            // default params
            params = params || {init: true};
            
            // return current instance
            // if already exists
            if (ctrl.exists(view)) {
                var modal = ctrl.getModalByName(view);
                
                // check if call to init
                if (params.init) {
                    modal.init();
                }
                
                return modal;
            }
            
            // store props
            this.viewName = view;
            this.params = params;
            this.inited = false;
            this.loaded = false;
            
            // setup event
            this.createEvents();
            
            // create and hide node
            this.node = new Node("div", "kbs-modal kbs-" + view);
            this.node.hide();
            
            // view element
            this.view = null;
            
            // this should fix the 'this' refs
            // for when our methods are called
            // by external modules
            this.init = this.rInit.bind(this);
            this.open = this.rOpen.bind(this);
            this.close = this.rClose.bind(this);
            this.destroy = this.rDestroy.bind(this);
            
            // set modal event handlers
            this.applyHandlers(params);
            
            // load view and init
            params.init = params.init || true;
            this.load((params.init) ? this.init : function () {});
            
            // add modal to controller
            ctrl.addModal(this);
        }
        
        // setup and create modal events
        Modal.prototype.createEvents = function () {
            var i,
                emptyfn = function () {};
            
            // modal event names
            this.eventName = {
                init: "gui/modal/" + this.viewName + "/init",
                open: "gui/modal/" + this.viewName + "/open",
                close: "gui/modal/" + this.viewName + "/close",
                destruct: "gui/modal/" + this.viewName + "/destruct",
                load: "gui/modal/" + this.viewName + "/load",
                confirm: "gui/modal/" + this.viewName + "/confirm",
                proceed: "gui/modal/" + this.viewName + "/proceed",
                cancel: "gui/modal/" + this.viewName + "/cancel"
            };
            
            // loop through events and create them
            for (i in this.eventName) {
                if (this.eventName.hasOwnProperty(i)) {
                    events.subscribe(this.eventName[i], emptyfn);
                }
            }
        };
        
        // load view into modal
        Modal.prototype.load = function (callback) {
            var self = this,
                view;
            
            // make sure can't load twice!
            this.loaded = true;
            
            vloader.load(
                "modals/" + this.viewName,
                function (mod) {
                    // get new view
                    view = mod.createView([gui, self]);
                    
                    // set view to modal
                    self.view = view;
                    self.title = view.title;
                    
                    // publish
                    events.publish("gui/modal/load", self);
                    events.publish(self.eventName.load, self);
                    
                    // run callback
                    if (util.isFunction(callback)) {
                        callback();
                    }
                }
            );
        };
        
        // attach an event handler to modal
        Modal.prototype.on = function (event, handler) {
            try {
                events.subscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler attachment failed with: " +
                        e.message
                );
            }
        };
        
        // remove an event handler from modal
        Modal.prototype.off = function (event, handler) {
            try {
                events.unsubscribe(
                    this.eventName[event],
                    handler
                );
            } catch (e) {
                util.log(
                    "error",
                    "Modal handler removal failed with: " +
                        e.message
                );
            }
        };
        
        // trigger a modal event with data
        Modal.prototype.trigger = function (event, data) {
            events.publish(this.eventName[event], data);
        };
        
        // init modal
        Modal.prototype.rInit = function () {
            if (this.inited) {
                // skip build and open
                this.open();
                return;
            }
            
            // declarations
            var modal = this.node,
                title = modal.createChild(
                    "h2",
                    "kbs-modal-title"
                ),
                close = modal.createChild(
                    "i",
                    "fa fa-times kbs-modal-closed"
                ),
                content = modal.createChild(
                    "p",
                    "kbs-modal-content"
                );
            
            // set content and append to gui
            title.text(this.title);
            close.on("click", this.close);
            content.addChild(this.view);
            gui.addChild(modal);
            
            // flag inited
            this.inited = true;
            
            // publish
            events.publish("gui/modal/init", this);
            events.publish(this.eventName.init, this);
            
            // open
            this.open();
        };
        
        // handler/listener application for modal
        Modal.prototype.applyHandlers = function () {
            var
                // instance ref
                self = this,
            
                // error handler
                err = function (event) {
                    // warning
                    util.log(
                        "warn",
                        "Modal '" + self.viewName + "' " +
                            "event '" + event + "' " +
                            "ran but didn't have a handler!"
                    );
                },
                
                // modal params
                params = this.params;

            // attach modal event handlers
            this.on("confirm", params.confirm || function () {
                err("confirm");
            });
            
            this.on("cancel", params.cancel || function () {
                err("cancel");
            });

            this.on("proceed", params.proceed || function () {
                err("proceed");
            });
        };
        
        // opens the modal
        Modal.prototype.rOpen = function () {
            // if a modal is already open
            if (ctrl.openModals.length) {
                ctrl.addToQueue(this);
                return;
            }
            
            // make sure we have inited
            if (!this.inited) {
                this.init();
                return;
            }
            
            // add this modal to the open modals array
            ctrl.addToOpened(this);
            
            // show overlay and node
            gui.tree.main.overlay.fadeIn();
            this.node.fadeIn();
            
            // publish
            events.publish("gui/modal/open", this);
            events.publish(this.eventName.open, this);
        };
        
        // closes the modal
        Modal.prototype.rClose = function () {
            // hide overlay and node
            gui.tree.main.overlay.hide();
            this.node.hide();
            
            // remove from controller opened modals
            ctrl.removeFromOpened(this);
            
            // publish
            events.publish("gui/modal/close", this);
            events.publish(this.eventName.close, this);
        };
        
        // destroys a modal instance
        Modal.prototype.rDestroy = function () {
            // check if open
            if (ctrl.isOpen(this)) {
                this.rClose();
            }
            
            // reset inited flag
            this.inited = false;
            
            // remove from ctrl modal array
            ctrl.removeModal(this);
            
            // publish
            events.publish("gui/modal/destruct", this);
            events.publish(this.eventName.destruct, this);
        };
        
        // set gui instance
        Modal.prototype.setInstance = function (instance) {
            gui = instance;
        };
        
        // get controller instance
        Modal.prototype.getController = function () {
            return ctrl;
        };
        
        return Modal;
    }
);
