export const deferred = (fun: CallableFunction, timeoutMS: number) => {
  let timer;
  return (force?: boolean) => {
    if (timer) clearTimeout(timer);
    if (force) return fun();
    timer = setTimeout(fun, timeoutMS);
  };
};

export const sleep = (timeoutMs: number) =>
  new Promise((r) => setTimeout(r, timeoutMs));
