function crawler(observer, node) {
  const out = {};

  if (observer != undefined &&
      (!node._visibility || node._visibility.indexOf(observer) == -1)) {
    return;
  }

  Object.keys(node).forEach(key => {
    if (node[key] instanceof Object && !(node[key] instanceof Array)) {
      const val = crawler(observer, node[key]);
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
  if (state._visibility === undefined) {
    return;
  }

  const idx = state._visibility.indexOf(observer);
  if (idx > -1) {
    state._visibility.splice(idx, 1);
  }
}

export function storeVisibility() {
  return createStore => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer);

    const getState = observer => {
      const state = store.getState();
      return crawler(observer, state);
    }

    return {
      ...store,
      getState
    }
  }
}
