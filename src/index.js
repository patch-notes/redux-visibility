function crawler(node, observer) {
  const out = {};

  if (observer != undefined &&
      (!node._visibility || node._visibility.indexOf(observer) == -1)) {
    return;
  }

  Object.keys(node).forEach(key => {
    if (node[key] instanceof Object && !(node[key] instanceof Array)) {
      const val = crawler(node[key], observer);
      if (val) {
        out[key] = val;
      }
    } else if (key !== '_visibility'){
      out[key] = node[key];
    }
  });

  return out;
};

export function setVisibility(state, observer) {
  const _visibility = (state._visibility !== undefined)
                      ? state._visibility.concat(observer)
                      : [observer];
  return {
    ...state,
    _visibility
  };
}

export function clearVisibility(state, observer) {
  const out = {
    ...state,
    _visibility: state._visibility.filter(o => o !== observer),
  };

  if (out._visibility.length === 0) {
    delete out._visibility;
  }

  return out;
}

export function storeVisibility() {
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);

    const getState = observer => {
      const state = store.getState();
      return crawler(state, observer);
    }

    return {
      ...store,
      getState
    }
  }
}
