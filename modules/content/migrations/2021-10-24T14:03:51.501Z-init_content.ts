import { PoolClient } from "pg";
export default {
  name: "2021-10-24T14:03:51.501Z-init_content",
  up: async (db: PoolClient) => {
    await db.query(`CREATE EXTENSION IF NOT EXISTS ltree`);
    await db.query(`CREATE TABLE IF NOT EXISTS content (
      id uuid PRIMARY KEY,
      path varchar(256) NOT NULL UNIQUE,
      content text NOT NULL,
      parent_id uuid REFERENCES content,
      published_at timestamp with time zone,
      created_at timestamp with time zone DEFAULT NOW(),
      updated_at timestamp with time zone DEFAULT NOW(),
      parent_path LTREE
    )`);
    await db.query(
      `CREATE INDEX content_parent_path_idx ON content USING GIST (parent_path)`
    );
    await db.query(`CREATE INDEX content_parent_id_idx ON content (parent_id)`);
    await db.query(
      `CREATE OR REPLACE FUNCTION update_content_parent_path() RETURNS TRIGGER AS $$
      DECLARE
          path ltree;
      BEGIN
          IF NEW.parent_id IS NULL THEN
              NEW.parent_path = 'root'::ltree;
          ELSEIF TG_OP = 'INSERT' THEN
              SELECT parent_path || REPLACE(id::text,'-','_') FROM content WHERE id = NEW.parent_id INTO path;
              NEW.parent_path = path;
          ELSEIF OLD.parent_id IS NULL OR OLD.parent_id != NEW.parent_id THEN
              SELECT COALESCE(parent_path,id::text) FROM content WHERE id = NEW.parent_id INTO path;
              NEW.parent_path = path;
          END IF;
          RETURN NEW;
          END;
      $$ LANGUAGE plpgsql;`
    );
    await db.query(`CREATE TRIGGER content_parent_path_trigger
    BEFORE INSERT OR UPDATE ON content
    FOR EACH ROW EXECUTE PROCEDURE update_content_parent_path();`);
  },
  down: async (db: PoolClient) => {
    await db.query(`DROP TABLE IF EXISTS content`);
  },
};
