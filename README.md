# ESC React Redux
```
npm install @esc_games/esc-react-redux
```

GitHub: https://github.com/esc-games/esc-react-redux

## Event Manager
EventManager helps route events.

## Reducer Manager
ReducerManager makes it easy to add reducers, and to dispatch actions.

ReducerManager only sends actions to redux if there is a component
 connected and listening to those actions. 

```javascript

const ACTION_NAME_CHANGED = "nameChange";

const reducerManager = new ReducerManager({
    [ACTION_NAME_CHANGED] : (state, action) => {
        return {
            ...state,
            name: action.value
        }
    },
},
{
    name: "Default Name"
});

const EVENT_NAMESPACE = 'Demo';
const DemoManager = new EventManager(EVENT_NAMESPACE, reducerManager);


class DemoComponent extends Component {
    
    render() {
        return {this.props.name};
    }
}

// Connect the component and specify which actions should actually be routed to Redux.  
// We explicitly add actions here so that we can create input sensing functions (eg accelerometer) 
// that *optionally* update the redux state.
export default const ConnectedDemoComponent = DemoManager.connect(DemoComponent, [
    ACTION_NAME_CHANGED
]);
```