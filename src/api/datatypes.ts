export const NUL = "\u0000";

export abstract class DataType<T> {
  value?: T;
  toString: () => string;
  static from: (value: string) => DataType<any>;
}

const isNullable = (value: any) => {
  return [undefined, "undefined", null, NUL].includes(value);
};

export class TBoolean implements DataType<boolean> {
  constructor(public value?: boolean) {}
  toString() {
    switch (this.value) {
      case true:
        return "1";
      case false:
        return "0";
      default:
        return NUL;
    }
  }
  static from(value: string) {
    if (isNullable(value)) return new TBoolean(null);
    if (["false", "0"].includes(value)) return new TBoolean(false);
    return new TBoolean(true);
  }
}

export class TInt implements DataType<number> {
  constructor(public value?: number) {}
  toString() {
    return this.value?.toFixed(0) ?? NUL;
  }
  static from(value: string) {
    if (isNullable(value)) return new TInt(null);
    return new TInt(parseInt(value));
  }
}

export class TFloat implements DataType<number> {
  constructor(public value?: number) {}
  toString() {
    return this.value?.toString() ?? NUL;
  }
  static from(value: string) {
    if (isNullable(value)) return new TFloat(null);
    return new TFloat(parseFloat(value));
  }
}

export class TString implements DataType<string> {
  constructor(public value?: string) {}
  toString() {
    return this.value ?? NUL;
  }
  static from(value: string) {
    if (isNullable(value)) return new TString(null);
    return new TString(value);
  }
}

export class TJSON implements DataType<object> {
  constructor(public value?: object) {}
  toString() {
    if (!this.value) return NUL;
    return JSON.stringify(this.value);
  }
  static from(value: string) {
    if (isNullable(value)) return new TJSON(null);
    return new TJSON(JSON.parse(value));
  }
}

export type SomeDataType =
  | typeof TBoolean
  | typeof TInt
  | typeof TFloat
  | typeof TString
  | typeof TJSON;
