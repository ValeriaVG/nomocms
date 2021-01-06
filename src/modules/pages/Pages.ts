import { RedisDataSource } from "core/DataSource";

export default class Pages extends RedisDataSource<{
  id: string;
  url: string;
  body: string;
  styles: string[];
}> {
  collection = "pages";
  prefix = "pg";
}
