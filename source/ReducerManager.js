import { combineReducers, createStore } from "redux";
import {connect as parentConnect} from 'react-redux'

const ACTION_ESC_INIT = "ESC-INIT";

const lastActions = {};

const createReducer = asyncReducers => {
    return combineReducers({
        ...asyncReducers
    });
};


let reducers = {};

const initializeStore = (defaultReducers) => {
    if(store) {
        return store;
    }
    reducers = {
        ...reducers,
        ...defaultReducers,
        identity: (state, action) => {
            return state || {};
        }
    };
    return createStore(
        createReducer(reducers),
        {},
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
};

const store = initializeStore({});

const injectReducer = (key, reducer) => {
    reducers[key] = reducer;
    if(store == null) {
        return;
    }
    store.replaceReducer(createReducer(reducers));
    store.dispatch({
        type: ACTION_ESC_INIT
    });
    return store;
};

const enabledReducers = {};

const ReducerManager = (defaultReducerActions = {}, defaultState = {}) => {
    const manager = {
        store,
        reducerActions: defaultReducerActions,
        addReducerAction: (actionName, reducer) => {
            manager.reducerActions[actionName] = reducer;
        },
        setReducerEnabled: (reducerAction, enabled) => {
            const currentValue = enabledReducers[reducerAction] || 0;
            enabledReducers[reducerAction] = Math.max(currentValue + (enabled ? 1 : -1), 0);
            /*    if(enabled) {
                    store.dispatch({
                        type: reducerAction,
                        value: lastActions[reducerAction]
                    })
                }*/
        },
        dispatchUI: (actionName, actionValue) => {
            if (enabledReducers[actionName] > 0) {
                manager.dispatchUIDirect(actionName, actionValue);
            }
        },
        dispatchUIDirect: (actionName, actionValue) => {
            store.dispatch({
                type: actionName,
                value: actionValue
            })
        },
        createReducer: () => {
            return (state, action) => {
                const reducer = manager.reducerActions[action.type];
                if (state && reducer) {
                    return reducer(state, action);
                }
                return state || defaultState;
            };
        },
        connectManager: (stateName,
                  component,
                  reducerActions = [],
                  mapStateToProps,
                  mapDispatchToProps) => {

            if (!mapStateToProps) {
                mapStateToProps = (state) => {
                    return {
                        ...state[stateName]
                    }
                }
            }

            if (!mapDispatchToProps) {
                mapDispatchToProps = (dispatch) => {
                    return {};
                }
            }

            component.prototype.UNSAFE_componentWillMount = () => {
                reducerActions.forEach((e) => {
                    manager.setReducerEnabled(e, true);
                })
            };
            component.prototype.componentWillUnmount = () => {
                reducerActions.forEach((e) => {
                    manager.setReducerEnabled(e, false);
                })
            };

            return parentConnect(mapStateToProps, mapDispatchToProps)(component);
        }
    };

    return manager;
};

export { store, ReducerManager, initializeStore, injectReducer };
