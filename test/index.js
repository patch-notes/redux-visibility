import { createStore } from 'redux';
import { storeVisibility, clearVisibility, setVisibility } from '../src/index';
import { expect } from 'chai';

describe('Distributed state', () => {
//  beforeEach(() => {
//    store = createStore(store => store, {}, storeVisibility());
//  });

  describe('basic functionality', () => {
    it('should create the store', () => {
      const store = createStore(store => store, {}, storeVisibility());
    })

    it('should return all the state if no observer is specified', () => {
      const store = createStore(store => store, {test: 1}, storeVisibility());
      expect(store.getState()).to.be.deep.equal({test: 1})
    });

    it('should set visibility for one observer', () => {
      const state = setVisibility({test: 1}, 'observer');
      expect(state).to.be.deep.equal({test: 1, _visibility: ['observer']});
    });

    it('should set visibility for more than one observer', () => {
      let state = setVisibility({test: 1}, 'observer');
      state = setVisibility(state, 'anotherObserver');
      expect(state).to.be.deep.equal({
        test: 1,
        _visibility: ['observer', 'anotherObserver']
      });
    });
  });

  describe('complex states', () => {
    let state, store;
    beforeEach(() => {
      state = setVisibility({test: 1}, 'observer');
      state = setVisibility(state, 'otherObserver')
      state.invisible = {nobodySeesThis: 1};
      state.key = setVisibility({otherTest: 2, array: [1,2,3]}, 'otherObserver');
      state.key.subkey = {nobodySeesThisEither: 3};
      state.otherObserver = setVisibility({lastTest: 4}, 'otherObserver');

      store = createStore(store => store, state, storeVisibility());
    });

    it('should recursively filter out the visibility keys from the store', () => {
      expect(store.getState()).to.be.deep.equal({
        test: 1,
        invisible: { nobodySeesThis: 1 },
        key: {
          otherTest: 2,
          array: [ 1, 2, 3 ],
          subkey: { nobodySeesThisEither: 3 }
        },
        otherObserver: { lastTest: 4 }
      });
    });

    it('should show only visible nodes if an observer is specified', () => {
      expect(store.getState('observer')).to.be.deep.equal({
        test: 1
      });

      expect(store.getState('otherObserver')).to.be.deep.equal({
        test: 1,
        key: {
          otherTest: 2,
          array: [ 1, 2, 3 ],
        },
        otherObserver: { lastTest: 4 }
      });
    });
  });
});
