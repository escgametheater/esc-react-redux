import * as test from '.';

it('index - should have expected exports', () => {
   expect(test).hasOwnProperty('EventManager');
   expect(test).hasOwnProperty('ReducerManager');
   expect(test).hasOwnProperty('InitializeStore');
});