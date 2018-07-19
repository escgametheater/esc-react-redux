import {ReducerManager, initializeStore, injectReducer} from "./ReducerManager";
import React from "react";


const CONNECTED_ACTION = "connected";
const DISCONNECTED_ACTION = "disconnected";

class MockConnectedComponent extends React.Component {
    render() {
        return (<div></div>)
    }
}
class MockDiconnectedComponent extends React.Component {
    render() {
        return (<div></div>)
    }
}
const STATE_NAME = "namespace";

it('dispatchUI - Should only fire actions to redux if components are connected', () => {

    const store = initializeStore({});
    const reducerManager = createReducerManager();
    injectReducer(STATE_NAME, reducerManager.createReducer());
    const connected = reducerManager.connectManager(STATE_NAME, MockConnectedComponent, [CONNECTED_ACTION]);
    const disconnected = reducerManager.connectManager(STATE_NAME, MockDiconnectedComponent, [DISCONNECTED_ACTION]);

    connected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    connected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    reducerManager.dispatchUI(CONNECTED_ACTION, true);
    reducerManager.dispatchUI(DISCONNECTED_ACTION, true);
    disconnected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    connected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUI(CONNECTED_ACTION, true);
    reducerManager.dispatchUI(DISCONNECTED_ACTION, true);
    disconnected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUI(CONNECTED_ACTION, true);
    reducerManager.dispatchUI(DISCONNECTED_ACTION, true);
    connected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUI(CONNECTED_ACTION, true);
    reducerManager.dispatchUI(DISCONNECTED_ACTION, true);

    expect(store.getState()[STATE_NAME].connected).toEqual(3);
    expect(store.getState()[STATE_NAME].disconnected).toEqual(1);
});


it('dispatchUIDirect - Should always fire actions', () => {

    const store = initializeStore({});
    const reducerManager = createReducerManager();
    injectReducer(STATE_NAME, reducerManager.createReducer());
    const connected = reducerManager.connectManager(STATE_NAME, MockConnectedComponent, [CONNECTED_ACTION]);
    const disconnected = reducerManager.connectManager(STATE_NAME, MockDiconnectedComponent, [DISCONNECTED_ACTION]);

    connected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    connected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    reducerManager.dispatchUIDirect(CONNECTED_ACTION, true);
    reducerManager.dispatchUIDirect(DISCONNECTED_ACTION, true);
    disconnected.WrappedComponent.prototype.UNSAFE_componentWillMount();
    connected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUIDirect(CONNECTED_ACTION, true);
    reducerManager.dispatchUIDirect(DISCONNECTED_ACTION, true);
    disconnected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUIDirect(CONNECTED_ACTION, true);
    reducerManager.dispatchUIDirect(DISCONNECTED_ACTION, true);
    connected.WrappedComponent.prototype.componentWillUnmount();
    reducerManager.dispatchUIDirect(CONNECTED_ACTION, true);
    reducerManager.dispatchUIDirect(DISCONNECTED_ACTION, true);

    expect(store.getState()[STATE_NAME].connected).toEqual(4);
    expect(store.getState()[STATE_NAME].disconnected).toEqual(4);
});

it('addReducerAction - adding reducers one by one works', () => {

    const store = initializeStore({});
    const reducerManager = createEmptyReducerManager();
    reducerManager.addReducerAction(CONNECTED_ACTION, connectedReducerFunction);
    injectReducer(STATE_NAME, reducerManager.createReducer());
    reducerManager.dispatchUIDirect(CONNECTED_ACTION, true);

    expect(store.getState()[STATE_NAME].connected).toEqual(1);
});
it('injectReducer - stays alive if store is not initialized yet', () => {
    const reducerManager = createEmptyReducerManager();
    injectReducer(STATE_NAME, reducerManager.createReducer());
});

const createEmptyReducerManager = () => {
    return new ReducerManager({});
};


const createReducerManager = () => {
    return new ReducerManager({
        [CONNECTED_ACTION]: connectedReducerFunction,
        [DISCONNECTED_ACTION]: disconnectedReducerFunction
    });
};

const connectedReducerFunction = (state, action) => {
    return {
        ...state,
        connected: state.connected ? state.connected + 1 : 1
    }
};

const disconnectedReducerFunction = (state, action) => {
    return {
        ...state,
        disconnected: state.disconnected ? state.disconnected + 1 : 1
    }
};