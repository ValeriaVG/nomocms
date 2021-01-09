import { MaybePromise } from "../types";

/**
 * DataSource can be anything from an item
 * stored in Redis to third party service
 */
export abstract class DataSource {
  constructor(protected context: any) {}
}

export class NotImplementedError extends Error {
  constructor(className: string, methodName: string) {
    super(`${className}.${methodName}`);
    this.name = `NotImplemented`;
  }
}

export type ListParams = {
  offset?: number;
  limit?: number;
  search?: string;
};

export type ItemsList<T> = {
  items: T[];
  nextOffset?: number;
};
export abstract class CRUDLDataSource<
  T,
  I = Partial<T>,
  P = I
> extends DataSource {
  create(input: I): MaybePromise<T> {
    throw new NotImplementedError(this.constructor.name, "create");
  }
  update(id: string, input: P): MaybePromise<T> {
    throw new NotImplementedError(this.constructor.name, "update");
  }
  delete(id: string): MaybePromise<{ deleted: boolean }> {
    throw new NotImplementedError(this.constructor.name, "delete");
  }
  get(id: string): MaybePromise<T> {
    throw new NotImplementedError(this.constructor.name, "get");
  }
  list(params: ListParams): MaybePromise<ItemsList<T>> {
    throw new NotImplementedError(this.constructor.name, "get");
  }
}

export type TypedData = { id: string; type: string };
