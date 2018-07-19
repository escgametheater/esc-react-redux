import {ReducerManager, injectReducer} from './ReducerManager'

const HANDLER_GROUP_DEFAULT = 'GROUP:ESC';
const BASE_ACTION_EVENT_STATS = 'EventStats';

window.managers = {};

/**
 *
 * @param managerName
 * @param defaultReducerManager
 * @returns {EventManager}
 * @constructor
 */
const EventManager = function (managerName, defaultReducerManager) {
    const stats = {
        events: {},
        groups: {}
    };
    const eventHandlerGroups = [HANDLER_GROUP_DEFAULT];
    const eventHandlerRegistry = {};
    const actionEventStats = managerName + ":" + BASE_ACTION_EVENT_STATS;

    const reducerManager = defaultReducerManager || new ReducerManager();
    reducerManager.addReducerAction(actionEventStats, (state, action) => {
        return {
            ...state,
            eventStats: action.value,
        }
    });

    const manager = {
        managerName: "Manager:" + managerName,
        stats,
        ACTION_EVENT_STATS: actionEventStats,
        eventHandlerGroups,
        eventHandlerRegistry,
        connect: function(component, reducerActions, mapStateToProps, mapDispatchToProps) {
          return reducerManager.connectManager(manager.managerName, component, reducerActions, mapStateToProps, mapDispatchToProps);
        },
        /**
         * Registers a function that will be invoked whenever the desired event is received.
         * The eventHandlerGroupName enables the game manager to remove all handlers from a given group.
         *
         * @param eventName
         * @param eventHandlerGroupName
         * @param handlerFunction
         */
        registerEventHandler: function (eventName, eventHandlerGroupName, handlerFunction) {
            if (eventHandlerGroups.indexOf(eventHandlerGroupName) === -1) {
                eventHandlerGroups.push(eventHandlerGroupName);
            }
            const eventHandlerGroup = eventHandlerRegistry[eventName] || {};
            eventHandlerRegistry[eventName] = eventHandlerGroup;
            const eventHandlers = eventHandlerGroup[eventHandlerGroupName] || [];
            eventHandlerGroup[eventHandlerGroupName] = eventHandlers;
            stats.events[eventName] = {
                ...stats.events[eventName],
                dispatched: 0,
                consumed: 0,
            };
            stats.events[eventName][eventHandlerGroupName] = {
                ...stats.events[eventName][eventHandlerGroupName],
                dispatched: 0,
                consumed: 0
            };
            stats.groups[eventHandlerGroupName] = {
                ...stats.groups[eventHandlerGroupName],
                dispatched: 0,
                consumed: 0
            };

            eventHandlers.push(handlerFunction);

            console.log(managerName + " - Registered eventHandlerGroupName[" + eventHandlerGroupName + "].event[" + eventName + "]")
        },
        /**
         * Dispatches a raw ESC encoded Event to any registered handlers.
         *
         * @param rawEvent A String in eventName:eventBody format
         */
        dispatchRawEvent: function (rawEvent) {
            // TODO - Standardize command shapes coming from the server

            const separator = rawEvent.indexOf(":") === -1 ? " " : ":";
            const eventName = rawEvent.substring(0, rawEvent.indexOf(separator)).trim();
            const eventBody = rawEvent.substring(rawEvent.indexOf(separator) + 1).trim();

            manager.dispatchEvent(eventName, JSON.parse(eventBody));
        },
        /**
         * Dispatches an Event to any registered handlers.
         *
         * @param eventName
         * @param eventBody
         */
        dispatchEvent: function (eventName, eventBody) {
            if (!stats.events.hasOwnProperty(eventName)) {
                stats.events[eventName] = {
                    dispatched: 0,
                    consumed: 0,
                };
            }
            stats.events[eventName].dispatched++;
            const eventHandlerGroup = eventHandlerRegistry[eventName] || [];
            eventHandlerGroups.forEach((eventHandlerGroupName) => {
                const eventHandlers = eventHandlerGroup[eventHandlerGroupName] || [];
                if (eventHandlers.length > 0) {
                    stats.events[eventName][eventHandlerGroupName].dispatched++;
                    stats.groups[eventHandlerGroupName].dispatched++;
                }
                eventHandlers.forEach((eventHandler) => {
                    eventHandler(eventBody);
                    stats.events[eventName].consumed++;
                    stats.events[eventName][eventHandlerGroupName].consumed++;
                    stats.groups[eventHandlerGroupName].consumed++;
                    reducerManager.dispatchUI(manager.ACTION_EVENT_STATS, {...stats});
                });
            });
        }
    };

    Object.assign(manager, reducerManager);
    injectReducer(manager.managerName, manager.createReducer());
    window.managers[managerName] = manager;

    return manager;
};

export {EventManager, HANDLER_GROUP_DEFAULT};
