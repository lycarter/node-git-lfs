'use strict';

/**
 * Abstract Authenticator, should use subclass
 */
class Authenticator {

    /**
     * Register authenticator
     *
     * @param {String} name, name of the authenticator
     * @param {Authenticator} authenticator, class of the Authenticator
     */
    static registerAuthenticator(name, authenticator){
        this.authenticators[name] = authenticator;
    }

    /**
     * Get registered authenticator by name
     * @param {String} name
     * @param {Object} options, optional
     * @returns {Authenticator} instance of authenticator
     */
    static getAuthenticator(name, options) {
        return new this.authenticators[name](options);
    }

    /**
     * Check request has read access or not
     * @param {String} user
     * @param {String} repo
     * @param {String} authorization, Authorization header
     * @returns {Promise<Boolean>}
     */
    canRead(user, repo, authorization) {

    }

    /**
     * Check request has read access or not
     * @param {String} user
     * @param {String} repo
     * @param {String} authorization, Authorization header
     * @returns {Promise<Boolean>}
     */
    canWrite(user, repo, authorization) {

    }

}

Authenticator.authenticators = {};

module.exports = Authenticator;

Authenticator.registerAuthenticator('none', require('./none'));