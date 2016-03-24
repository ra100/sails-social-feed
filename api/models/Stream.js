/**
 * Stream.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    messages: {
      collection: 'Message',
      via: 'stream'
    },
    uniqueName: {
      type: 'string',
      required: true,
      unique: true
    },
    owner: {
      model: 'User'
    },
    groups: {
      collection: 'Group',
      via: 'streams'
    },
    feeds: {
      collection: 'Feed',
      via: 'stream'
    },

    /**
     * State - active, sleep, inactive
     * influences default refresh rate for nonsocket feeds
     * active - default refresh
     * sleep - refresh hourly
     * inactive - don't refresh, close socket feeds
     */
    state: {
      type: 'text',
      enum: [
        'active', 'sleep', 'inactive'
      ],
      defaultsTo: 'inactive'
    },

    /**
     * Refresh rate in seconds
     */
    refresh: {
      type: 'integer',
      enum: [
        60, 300, 900, 1800
      ],
      defaultsTo: 300
    },

    /**
     * Default display state for message
     * false hide
     * true show
     */
    display: {
      type: 'boolean',
      defaultsTo: false
    },

    /**
     * Published option
     */
    published: {
      type: 'boolean',
      defaultsTo: false
    },

    /**
     * Schedule when feed is managed
     * can override default refresh, state, display options
     * format:
     *   empty - default settings
     *   {
     *   settings: {state: STATE, refresh: REFRESHRATE, display: DISPLAY},
     *   weekdays: {
     *     monday: {time: [{from: 'hh:mm', to: 'hh:mm', settings: {...}}]}
     *   },
     *   time: [...]
     *   }
     */
    schedule: {
      type: 'json',
      defaultsTo: '{}'
    }
  }
};
