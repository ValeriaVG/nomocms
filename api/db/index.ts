import { Pool } from "pg";
import { db as dbConfig } from "../config";

export default new Pool(dbConfig);
