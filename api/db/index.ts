import { Pool } from "pg";
import dbConfig from "./config";

export default new Pool(dbConfig);
