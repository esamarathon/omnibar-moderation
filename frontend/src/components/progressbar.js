const stateMap = new WeakMap();

export default {
  name: 'ProgressBar',
  props: {
    finishes: Number,
    duration: Number
  },
  directives: {
    progressUpdate: {
      inserted: (el, binding) => {
        let state = stateMap.get(el) || {};
        state.finishes = binding.value.finishes;
        state.duration = binding.value.duration;
        stateMap.set(el, state);
        const updateProgressBar = () => {
          let currentState = stateMap.get(el) || {};
          let width =
            (currentState.finishes - Date.now()) / currentState.duration;
          if (width < 0) width = 0;
          if (width > 1) width = 1;
          el.style.width = width * 100 + '%';
          currentState.raf = window.requestAnimationFrame(updateProgressBar);
          stateMap.set(el, currentState);
        };
        updateProgressBar();
      },
      update: (el, binding) => {
        const state = stateMap.get(el);
        state.finishes = binding.value.finishes;
        state.duration = binding.value.duration;
      },
      unbind: el => {
        const state = stateMap.get(el);
        window.cancelAnimationFrame(state.raf);
      }
    }
  }
};
