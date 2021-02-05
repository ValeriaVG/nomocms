import { Dispatch, EventHandler, SetStateAction, useState } from "react";
import { curry, mergeDeepRight, assocPath, Path } from "ramda";
import { F } from "ts-toolbelt";

export default function useForm<T extends { [key: string]: any }>(
  defaultValues: T = {} as any
): FormValues<T> {
  const [values, setValues] = useState<T>(defaultValues);

  const valueSetter = <K extends keyof T>(
    path: K | Path,
    value: T[K] | any
  ) => {
    if (typeof path === "string")
      return setValues(
        (values) => mergeDeepRight(values, { [path]: value }) as T
      );
    return setValues((values) => assocPath(path as Path, value, values) as any);
  };
  const setValue = curry(valueSetter);
  const onValueChange = <K extends keyof T>(
    path: K | Path
  ): EventHandler<any> => ({ target }) => valueSetter(path, target["value"]);
  return { values, setValues, setValue, onValueChange };
}

export type FormValues<T> = {
  values: T;
  setValues: Dispatch<SetStateAction<T>>;
  setValue: F.Curry<<K extends keyof T>(path: K | Path, value: any) => void>;
  onValueChange: <K extends keyof T>(path: K | Path) => EventHandler<any>;
};
