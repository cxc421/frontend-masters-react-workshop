import { createMachine, assign } from "xstate";

const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;
const resetTimer = assign({
  duration: 5,
  elapsed: 0,
});
const increaseElapsed = assign({
  elapsed: (ctx) => ctx.elapsed + ctx.interval,
});
const increaseDuration = assign({
  duration: (ctx) => ctx.duration + 60,
});

export const timerMachine = createMachine({
  initial: "idle",
  context: {
    duration: 5,
    elapsed: 0,
    interval: 0.1,
  },
  states: {
    idle: {
      entry: resetTimer,
      on: {
        TOGGLE: "running",
      },
    },
    running: {
      // Add the `normal` and `overtime` nested states here.
      // Don't forget to add the initial state (`normal`)!
      initial: "normal",
      states: {
        normal: {
          always: {
            cond: timerExpired,
            target: "overtime",
          },
          on: {
            // forbiddent parent RESET event if state in runnimg.normal
            RESET: undefined,
          },
        },
        overtime: {
          // after 2 seconds, jump to timesUp state
          after: {
            2000: "timesUp",
          },
          on: {
            // forbiddent TOGGLE event if state in runnimg.overtime
            TOGGLE: undefined,
          },
        },
        // declare this is final state
        timesUp: {
          type: "final",
        },
      },
      // when entering final state, jumpt to idle state
      onDone: "idle",
      on: {
        TICK: {
          actions: increaseElapsed,
        },
        TOGGLE: "paused",
        ADD_MINUTE: {
          actions: increaseDuration,
        },
      },
    },
    paused: {
      on: {
        TOGGLE: "running",
      },
    },
  },
  on: {
    RESET: {
      target: ".idle",
    },
  },
});
