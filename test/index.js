import { createStore } from 'redux';
import { expect } from 'chai';
import { storeVisibility, clearVisibility, setVisibility } from '../src/index';

describe('Distributed state', () => {
  describe('basic functionality', () => {
    it('should set visibility for one observer', () => {
      const state = setVisibility({ test: 1 }, 'observer');
      expect(state).to.be.deep.equal({ test: 1, _visibility: ['observer'] });
    });

    it('should set visibility for more than one observer', () => {
      let state = setVisibility({ test: 1 }, 'observer');
      state = setVisibility(state, 'anotherObserver');
      expect(state).to.be.deep.equal({
        test: 1,
        _visibility: ['observer', 'anotherObserver'],
      });
    });

    it('should clear visibility for one observer', () => {
      const state = setVisibility({ test: 1 }, 'observer');
      expect(clearVisibility(state, 'observer')).to.be.deep.equal({
        test: 1,
      });
    });

    it('should clear visibility for more than one observer', () => {
      let state = setVisibility({ test: 1 }, 'observer');
      state = setVisibility({ test: 1 }, 'otherObserver');
      expect(clearVisibility(state, 'observer')).to.be.deep.equal({
        test: 1,
        _visibility: ['otherObserver'],
      });
    });

    it('should create the store', () => {
      const store = createStore(s => s, {}, storeVisibility());
      expect(store.getState()).to.be.deep.equal({});
    });

    it('should return all the state if no observer is specified', () => {
      const store = createStore(s => s, { test: 1 }, storeVisibility());
      expect(store.getState()).to.be.deep.equal({ test: 1 });
    });

    it('should return undefined if the observer cant see it', () => {
      const state = setVisibility({ test: 1 }, 'observer');
      const store = createStore(s => s, state, storeVisibility());
      expect(store.getState('otherObserver')).to.be.equal(undefined);
    });

    it('should return an object if the observer can see it', () => {
      const state = setVisibility({ test: 1 }, 'observer');
      const store = createStore(s => s, state, storeVisibility());
      expect(store.getState('observer')).to.be.deep.equal({ test: 1 });
    });
  });

  describe('nested objects', () => {
    let state;
    let store;
    beforeEach(() => {
      state = setVisibility({ test: 1 }, 'observer');
      state = setVisibility(state, 'otherObserver');
      state.invisible = { nobodySeesThis: 1 };
      state.key = setVisibility({ otherTest: 2 }, 'otherObserver');
      state.key.subkey = { nobodySeesThisEither: 3 };
      state.otherObserver = setVisibility({ lastTest: 4 }, 'otherObserver');

      store = createStore(s => s, state, storeVisibility());
    });

    it('should recursively filter out the visibility keys from the store', () => {
      expect(store.getState()).to.be.deep.equal({
        test: 1,
        invisible: { nobodySeesThis: 1 },
        key: {
          otherTest: 2,
          subkey: { nobodySeesThisEither: 3 },
        },
        otherObserver: { lastTest: 4 },
      });
    });

    it('should show only visible nodes, first observer', () => {
      expect(store.getState('observer')).to.be.deep.equal({ test: 1 });
    });

    it('should show only visible nodes, second observer', () => {
      expect(store.getState('otherObserver')).to.be.deep.equal({
        test: 1,
        key: {
          otherTest: 2,
        },
        otherObserver: { lastTest: 4 },
      });
    });
  });

  describe('Arrays', () => {
    let state;
    let store;

    beforeEach(() => {
      state = setVisibility({
        test: [setVisibility({ key: 'value' }, 'observer')],
      }, 'observer');
      state = setVisibility(state, 'otherObserver');
      store = createStore(s => s, state, storeVisibility());
    });

    it('should recursively filter out visibility inside arrays', () => {
      expect(store.getState()).to.be.deep.equal({
        test: [{ key: 'value' }],
      });
    });

    it('should remove invisible objects from arrays', () => {
      expect(store.getState('otherObserver')).to.be.deep.equal({ test: [] });
    });

    it('should show visible objects inside arrays', () => {
      expect(store.getState('observer')).to.be.deep.equal({
        test: [{ key: 'value' }],
      });
    });
  });

  describe('actions and reducers', () => {
    describe('with a simple reducer', () => {
      const reducer = state => setVisibility(state, 'observer');
      const store = createStore(reducer, { test: 1 }, storeVisibility());

      it('should return all the state if no observer is specified', () => {
        expect(store.getState()).to.be.deep.equal({ test: 1 });
      });

      it('should return visible nodes', () => {
        expect(store.getState('observer')).to.be.deep.equal({ test: 1 });
      });

      it('should not return invisible nodes', () => {
        expect(store.getState('otherObserver')).to.be.equal(undefined);
      });
    });
  });
});
