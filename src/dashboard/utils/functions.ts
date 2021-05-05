export const deferred = (fun: CallableFunction, timeoutMS: number) => {
  let timer;
  return (force?: boolean) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fun, force ? 0 : timeoutMS);
  };
};

export const sleep = (timeoutMs: number) =>
  new Promise((r) => setTimeout(r, timeoutMs));
