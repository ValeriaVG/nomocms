import { describe, it } from "mocha";
import chai, { expect } from "chai";
import like from "chai-like";
import { createStateEmitter } from "./state";

chai.use(like);

describe("state", () => {
  it("can set and get state", () => {
    const store = createStateEmitter({ foo: "bar" });
    expect(store.getState()).to.be.like({ foo: "bar" });
    store.setState({ foo: "baz" });
    expect(store.getState()).to.be.like({ foo: "baz" });
  });
  it("can subscribe to and unsubscribe from property updates", () => {
    const user: any = {};
    const store = createStateEmitter({ name: "", age: 0 });
    const onNameChange = (v) => (user.name = v);
    store.on("name", onNameChange);
    store.on("age", (v) => (user.age = v));
    store.setState({ name: "John", age: 21 });
    expect(user).to.be.like({ name: "John", age: 21 });
    store.setState({ name: "Jane" });
    expect(user).to.be.like({ name: "Jane", age: 21 });
    store.off("name", onNameChange);
    store.setState({ name: "Pete", age: 25 });
    expect(user).to.be.like({ name: "Jane", age: 25 });
  });
  it("can subscribe to and unsubscribe to state updates", () => {
    const user: any = {};
    const store = createStateEmitter({ name: "", age: 0 });
    const onChange = (state) => Object.assign(user, state);
    store.onUpdate(onChange);
    store.setState({ name: "John", age: 21 });
    expect(user).to.be.like({ name: "John", age: 21 });
    store.setState({ name: "Jane" });
    expect(user).to.be.like({ name: "Jane", age: 21 });
    store.offUpdate(onChange);
    store.setState({ name: "Pete", age: 25 });
    expect(user).to.be.like({ name: "Jane", age: 21 });
  });
});
