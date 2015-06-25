/*
*   @type javascript
*   @name repository.js
*   @copy Copyright 2015 Harry Phillips
*/

/*global define: true */

define(function () {
    'use strict';

    // shared
    var box = {},
        instance;

    // repository class
    function Repository() {}

    // add an object to the repo under key
    Repository.prototype.add = function (key, object) {
        // already exists
        if (box[key]) {
            throw new Error(
                "Couldn't add '" + key + "' to the repository, " +
                    " key already exists. Delete the key first."
            );
        }

        box[key] = object;
    };

    // get an object from the repo
    Repository.prototype.get = function (key) {
        return box[key];
    };

    // delete an object from the repo
    Repository.prototype.del = function (key) {
        delete box[key];
    };
    
    // list all repo objects
    Repository.prototype.all = function () {
        return box;
    };

    return Repository;
});