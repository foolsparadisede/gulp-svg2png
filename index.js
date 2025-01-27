/*
 * gulp-svg2png
 *
 * Copyright(c) 2014 - present / André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 */
/**
 * @author André König <andre.koenig@posteo.de>
 *
 */
'use strict';
var path = require("path");
var gutil = require("gulp-util");
var map_limit = require('map-stream-limit');
var map = require('map-stream');
var svg2png = require('svg2png');
var index_1 = require("./lib/index");
var PLUGIN_NAME = require('./package.json').name;
var Command = /** @class */ (function () {
    function Command(options, verbose) {
        if (options === void 0) { options = {}; }
        if (verbose === void 0) { verbose = true; }
        this.options = options;
        this.verbose = verbose;
    }
    /**
    * Wrapper around gutil logger.
    * Logs if logging is enabled.
    *
    * @param {string} message The log message
    *
    */
    Command.prototype.log = function (message) {
        if (this.verbose) {
            gutil.log(message);
        }
    };
    /**
    * Just a global error function.
    *
    * @param {string} message The error message
    *
    */
    Command.prototype.error = function (message) {
        throw new gutil.PluginError(PLUGIN_NAME, message);
    };
    /**
    * Renames the SVG file to a PNG file (extension)
    *
    * @param {string} filename The file name of the SVG
    *
    * @return {string} The file name with the PNG file extension.
    *
    */
    Command.prototype.rename = function (filename) {
        return filename.replace(path.extname(filename), '.png');
    };
    Command.prototype.execute = function (source, cb) {
        var _this = this;
        if (!source.isBuffer()) {
            return this.error('Streams are not supported by the underlying svg2png library.');
        }
        if (!index_1.SVG.is(source.contents)) {
            return this.error('Source is not a SVG file.');
        }
        svg2png(source, this.options)
            .then(function (contents) {
            cb(null, new gutil.File({
                base: source.base,
                path: _this.rename(source.path),
                contents: contents
            }));
        })["catch"](function (err) {
            return cb(_this.error("Error while converting the image: " + err.message));
        });
    };
    return Command;
}());
module.exports = function (options, verbose, concurrency) {
    if (options === void 0) { options = {}; }
    if (verbose === void 0) { verbose = true; }
    if (concurrency === void 0) { concurrency = null; }
    var cmd = new Command(options, verbose);
    if (concurrency) {
        return map_limit(cmd.execute.bind(cmd), concurrency);
    }
    else {
        return map(cmd.execute.bind(cmd));
    }
};
