"use strict";

function createEmitter() {
  return Object.create({}, {
    callbacks: {
      value: {},
      writable: true,
    },
    /**
     * @param {string} type
     * @param {Function} callback
     * @return {number}
     */
    on: {
      value: function (type, callback) {
        if (!this.callbacks.hasOwnProperty(type)) {
          this.callbacks[type] = [];
        }
        this.callbacks[type].push(callback);
        return this.callbacks[type].length - 1;
      },
    },
    /**
     * @param {string=} opt_type
     * @param {number=} opt_id
     */
    off: {
      value: function (opt_type, opt_id) {
        switch (arguments.length) {
          case 0:
            this.callbacks = {};
            return;
          case 1:
            this.callbacks[opt_type] = [];
            return;
          case 2:
            if (!this.callbacks.hasOwnProperty(opt_type)) {
              return;
            }
            if (this.callbacks[opt_type][opt_id]) {
              this.callbacks[opt_type][opt_id] = null;
            }
            return;
        }
      },
    },
    /**
     * @param {string} type
     */
    trigger: {
      value: function (type) {
        if (!this.callbacks.hasOwnProperty(type)) {
          return;
        }
        this.callbacks[type].forEach(function (callback) {
          if (typeof callback === "function") {
            callback();
          }
        });
      },
    },
  });
}

module.exports = {
  createEmitter: createEmitter,
};
