import { RedisDataSource } from "core/DataSource";
import { TString } from "core/datatypes";

export default class Pages extends RedisDataSource<{
  id: string;
  url: string;
  body: string;
  head: string;
  style: string;
}> {
  collection = "pages";
  prefix = "pg";

  schema = {
    url: TString,
    body: TString,
    head: TString,
    style: TString,
  };
}
