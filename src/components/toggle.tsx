import * as React from "react";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";

interface ToggleContext {
  count: number;
}

type ToggleEvents = { type: "TOGGLE" };

const toggleMachine = createMachine<ToggleContext, ToggleEvents>({
  id: "toggle",
  initial: "inactive",
  context: {
    count: 0
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" }
    },
    active: {
      entry: assign({ count: (ctx) => ctx.count + 1 }),
      on: { TOGGLE: "inactive" }
    }
  },
  predictableActionArguments: true
});

export default ToggleComponent;
export function ToggleComponent() {
  const [current, send] = useMachine(toggleMachine);
  const active = current.matches("active");
  const { count } = current.context;

  return (
    <div>
      <h1>Toggle</h1>
      <button onClick={() => send({ type: "TOGGLE" })}>
        Click me ({active ? "✅" : "❌"})
      </button>{" "}
      <code>
        Toggled <strong>{count}</strong> times
      </code>
    </div>
  );
}
