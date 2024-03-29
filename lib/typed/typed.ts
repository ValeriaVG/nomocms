import { Failure } from ".";
import type {
  Enum,
  Err,
  Infer,
  InferTuple,
  Literal,
  PlainObject,
  Result,
  Shape,
  Typed,
  UnionToIntersection,
} from "./common";
import {
  failure,
  getTypeOf,
  isPlainObject,
  mapErrorKey,
  success,
  toError,
  toMessage,
  toResult,
} from "./util";

/**
 * Create a new type from a given base type.
 * It ensures that the base type passes validation before carrying on.
 *
 * @example
 * ```ts
 * const emailType = T.map(T.string, (value) =>
 *  EMAIL_REGEX.test(value)
 *    ? T.success(value)
 *    : T.failure(T.toError('Expecting string to be a valid email address'))
 * )
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.0.0
 */
export const map =
  <I, O>(base: Typed<I>, onSuccess: (value: I) => Result<O>): Typed<O> =>
    (x) => {
      const result = base(x);
      return result.success ? onSuccess(result.value) : result as Failure;
    };

/**
 * It allows you to further process the result of a type.
 * Specially usefull when trimming, upper casing, etc.
 * Keep in mind that the output type must be the same as the input type.
 *
 * @example
 * ```ts
 * const lowerTrim = T.refine(T.string, (value) => value.trim().toLowerCase())
 * lowerTrim('  HELLO WORLD  ') // Success('hello world')
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.3.0
 */
export const refine =
  <I>(base: Typed<I>, onSuccess: (value: I) => I): Typed<I> =>
    (x) => {
      const result = base(x);
      return result.success ? success(onSuccess(result.value)) : result;
    };

/**
 * Check wether a given value is of type string.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const string: Typed<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toMessage("string", getTypeOf(x))));

/**
 * Check wether a given value is of type number.
 * It also makes sure that the value is a finite number.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const number: Typed<number> = (x) =>
  typeof x === "number"
    ? Number.isFinite(x)
      ? success(x)
      : failure(toError(`Expecting value to be a finite 'number'`))
    : failure(toError(toMessage("number", getTypeOf(x))));

/**
 * Check wether a given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const boolean: Typed<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toMessage("boolean", getTypeOf(x))));

/**
 * Check wether a given value is of type Date.
 * It also makes sure that the date is a valid.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const date: Typed<Date> = (x) =>
  x instanceof Date
    ? Number.isFinite(x.getTime())
      ? success(x)
      : failure(toError(`Expecting value to be a valid 'date'`))
    : failure(toError(toMessage("date", getTypeOf(x))));

/**
 * Check wether a given value is a string and matches a given regular expression.
 *
 * @param regex - The regex to check against.
 * @returns The result.
 * @since 1.3.0
 */
export const regex = (regex: RegExp) =>
  map(string, (x) =>
    regex.test(x)
      ? success(x)
      : failure(toError(`Expecting value to match '${regex.toString()}'`)),
  );

/**
 * Create a new typed function that will check wether a given value is an array and every element of the array passes the given type.
 *
 * @example
 * ```ts
 * const arrayOfStrings = T.array(T.string)
 * arrayOfStrings(['hello', 'world']) // success
 * arrayOfStrings(['hello', 123]) // failure
 * ```
 *
 * @param type - The type of the items in the array.
 * @returns The new type.
 * @since 1.0.0
 */
export const array =
  <T>(type: Typed<T>): Typed<T[]> =>
    (x) => {
      if (!Array.isArray(x)) {
        return failure(toError(toMessage("array", getTypeOf(x))));
      }
      const arr = [];
      const err: Err[] = [];
      for (let i = 0; i < x.length; i++) {
        const result = type(x[i]);
        if (result.success) {
          arr.push(result.value);
        } else {
          err.push(...mapErrorKey((result as Failure).errors, i));
        }
      }
      return toResult(arr, err);
    };

/**
 * Create a new typed function from a given shape.
 * The shape can be as deep as needed.
 *
 * @example
 * ```ts
 * const postType = T.object({
 *   title: T.string,
 *   body: T.string,
 *   tags: T.array(T.string),
 *   author: T.object({
 *     name: T.string,
 *   })
 * })
 * ```
 *
 * @param shape - The shape of the object.
 * @returns The new type.
 * @since 1.0.0
 */
export const object = <T extends Shape>(shape: T): Typed<Infer<T>> => {
  const entries = Object.entries(shape);
  return (x) => {
    if (!isPlainObject(x)) {
      return failure(toError(toMessage("object", getTypeOf(x))));
    }
    const obj = Object.create(null);
    const err: Err[] = [];
    for (const [key, type] of entries) {
      const result = type(x[key]);
      if (result.success) {
        obj[key] = result.value;
      } else {
        err.push(...mapErrorKey((result as Failure).errors, key));
      }
    }
    return toResult(obj, err);
  };
};

/**
 * Create a new typed function from a given constant.
 * It ensures that the value is equal to the given constant.
 *
 * @example
 * ```ts
 * const constant = T.literal('hello')
 * constant('hello') // success
 * constant('world') // failure
 * ```
 *
 * @param value - The constant to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const literal =
  <T extends Literal>(constant: T): Typed<T> =>
    (x) =>
      constant === x
        ? success(x as T)
        : failure(toError(`Expecting literal '${constant}'. Got '${x}'`));

/**
 * Create a new typed function from a given type that will succeed if the value is null.
 *
 * @example
 * ```ts
 * const nullable = T.nullable(T.string)
 * nullable(null) // success
 * nullable('hello') // success
 * nullable(123) // failure
 * ```
 *
 * @param type - The type to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const nullable =
  <T>(type: Typed<T>): Typed<T | null> =>
    (x) =>
      x === null ? success(x) : type(x);

/**
 * Create a new typed function from a given type that will succeed if the value is undefined.
 *
 * @example
 * ```ts
 * const optional = T.optional(T.string)
 * optional(undefined) // success
 * optional('hello') // success
 * optional(123) // failure
 * ```
 *
 * @param type - The type to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const optional =
  <T>(type: Typed<T>): Typed<T | undefined> =>
    (x) =>
      typeof x === "undefined" ? success(x) : type(x);

/**
 * Create a new typed function from a given TypeScript Enum.
 *
 * @example
 * ```ts
 * enum Role {
 *   ADMIN,
 *   USER,
 * }
 *
 * const role = T.enums(Role)
 * role(Role.ADMIN) // success
 * role(Role.USER) // success
 * role(Role.GUEST) // failure
 * ```
 *
 * @param enumType - The enum to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const enums = <T extends Enum, K extends keyof T>(e: T): Typed<T[K]> => {
  const values = Object.values(e);
  return (x) => {
    return values.includes(x as any)
      ? success(x as T[K])
      : failure(
        toError(
          `Expecting value to be one of '${values.join(", ")}'. Got '${x}'`,
        ),
      );
  };
};

/**
 * Create a new typed function from a list of types.
 * A tuple is like a fixed length array and every item should be of the specified type.
 *
 * @example
 * ```ts
 * const tuple = T.tuple(T.string, T.number)
 * tuple(['hello', 123]) // success
 * tuple(['hello', 'world']) // failure
 * ```
 *
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const tuple =
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<[Infer<A>, ...InferTuple<B>]> =>
    (x) => {
      if (!Array.isArray(x)) {
        return failure(toError(toMessage("array", getTypeOf(x))));
      }

      const arr: unknown[] = [];
      const err: Err[] = [];

      for (let i = 0; i < types.length; i++) {
        const result = types[i](x[i]);
        if (result.success) {
          arr.push(result.value);
        } else {
          err.push(...mapErrorKey((result as Failure).errors, i));
        }
      }

      return toResult(arr as any, err);
    };

/**
 * Create a new typed function from a list of types.
 * This function will succeed if the value is any of the given types.
 *
 * @example
 * ```ts
 * const anyOf = T.union(T.string, T.number, T.boolean)
 * anyOf('hello') // success
 * anyOf(123) // success
 * anyOf(true) // success
 * anyOf(null) // failure
 * ```
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const union =
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<Infer<A> | InferTuple<B>[number]> =>
    (x): Result<Infer<A> | InferTuple<B>[number]> => {
      const errors: Err[] = [];

      for (const type of types) {
        const result = type(x);
        if (result.success) {
          return result as any;
        }
        errors.push(...(result as Failure).errors);
      }

      return failure(...errors);
    };

/**
 * Create a new typed function which combines multiple types into one.
 *
 * @example
 * ```ts
 * const a = T.object({ name: T.string  })
 * const b = T.object({ age: T.number})
 * const c = T.intersection(a, b)
 *
 * c({ name: 'hello', age: 123 }) // success
 * c({ name: 'hello', age: 'world' }) // failure
 * c({name: 'hello'}) // failure
 * ```
 *
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.2.0
 */
export const intersection =
  <A extends Typed<PlainObject>, B extends Typed<PlainObject>[]>(
    ...types: [A, ...B]
  ): Typed<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> =>
    (x): Result<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> => {
      const errors: Err[] = [];
      const obj = Object.create(null);

      for (const type of types) {
        const result = type(x);
        if (result.success) {
          Object.assign(obj, result.value);
        } else {
          errors.push(...(result as Failure).errors);
        }
      }

      return toResult(obj, errors);
    };

/**
 * A passthrough function which returns its input marked as any.
 * Do not use this unless you really need to, it defeats the purpose of this library.
 *
 * @since 1.0.0
 */
export const any: Typed<any> = (x): any => success(x);

/**
 * Create a new typed function from a given type that will return a fallback value if the input value is undefined.
 *
 * @example
 * ```ts
 * const withFallback = T.defaulted(T.number, 0)
 * withFallback(undefined) // success(0)
 * withFallback(123) // success(123)
 * withFallback('hello') // failure
 * ```
 *
 * @param type - The type to check.
 * @param fallback - The fallback value.
 * @returns The new type.
 * @since 1.0.0
 */
export const defaulted =
  <T>(type: Typed<T>, fallback: T): Typed<T> =>
    (x) =>
      typeof x === "undefined" ? success(fallback) : type(x);

/**
 * Coerce first, then check if value is a string.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asString: Typed<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asNumber: Typed<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asDate: Typed<Date> = (x) =>
  date(typeof x === "string" || typeof x === "number" ? new Date(x) : x);
