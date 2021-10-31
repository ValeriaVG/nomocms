import { RouteHandler } from "api/http/router";
import { randomUUID } from "crypto";
import { BadRequest, NotFoundError } from "lib/errors";
import { ensureInt } from "lib/typecast";
import { ValidationError } from "lib/validation";
import {
  ensureAccountPermission,
  Permission,
} from "modules/account/lib/permissions";
import * as T from "typed";
import compileContent from "../lib/compileContent";
import toHTMLBuffer from "../lib/toHTMLBuffer";

const contentType = T.object({
  title: T.string,
  path: T.string,
  parent_id: T.optional(T.nullable(T.string)),
  content: T.string,
  parameters: T.any,
  published_at: T.optional(T.date),
});

const previewContentType = T.object({
  title: T.string,
  content: T.string,
  parameters: T.any,
});

export const createPage: RouteHandler = async ({ db, req }, { body }) => {
  await ensureAccountPermission({ db, req }, "content", Permission.create);
  const validation = contentType(body);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  const { content, title, parameters, published_at, parent_id, path } =
    validation.value;

  await compileContent(content, parameters);

  const id = randomUUID();
  const {
    rows: [page],
  } = await db.query(
    `INSERT INTO content (id,title,content, parameters, published_at, parent_id, path) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      id,
      title,
      content,
      parameters,
      published_at || new Date(),
      parent_id,
      path,
    ]
  );
  return {
    status: 201,
    body: {
      page,
    },
  };
};

export const updatePage: RouteHandler = async (
  { db, req },
  { body, params: { id } }
) => {
  if (!id) throw BadRequest;
  await ensureAccountPermission({ db, req }, "content", Permission.update);
  const validation = contentType(body);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  const { content, title, parameters, published_at, parent_id, path } =
    validation.value;

  await compileContent(content, parameters);

  const {
    rows: [page],
  } = await db.query(
    `UPDATE content SET content=$1,title=$2, parameters=$3, published_at=$4, parent_id=$5, path=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
    [
      content,
      title,
      parameters,
      published_at || new Date(),
      parent_id,
      path,
      id,
    ]
  );
  return {
    status: 200,
    body: {
      page,
    },
  };
};

export const getPage: RouteHandler = async (
  { db, req },
  { params: { id } }
) => {
  await ensureAccountPermission({ db, req }, "content", Permission.read);
  if (!id) throw BadRequest;
  const result = await db.query(`SELECT * FROM content WHERE id=$1`, [id]);
  if (!result.rowCount) throw NotFoundError;
  const page = result.rows[0];
  return {
    status: 200,
    body: {
      page,
    },
  };
};

export const deletePage: RouteHandler = async (
  { db, req },
  { params: { id } }
) => {
  await ensureAccountPermission({ db, req }, "content", Permission.delete);
  if (!id) throw NotFoundError;
  await db.query(`DELETE FROM content WHERE id=$1`, [id]);
  return {
    status: 200,
    body: {
      message: "Page was deleted",
    },
  };
};

export const previewPage: RouteHandler = async ({ db, req }, { body }) => {
  await ensureAccountPermission({ db, req }, "content", Permission.read);
  const validation = previewContentType(body);
  if (validation.success === false)
    throw new ValidationError(validation.errors);
  const { content, parameters, title } = validation.value;
  const { head, html, css, js } = await compileContent(content, {
    title,
    ...parameters,
  });
  const htmlBuffer = toHTMLBuffer({ head, html, css, js });
  return {
    status: 200,
    body: htmlBuffer,
    headers: {
      "content-type": "text/html",
      "content-length": htmlBuffer.byteLength.toString(),
    },
  };
};

export const listPages: RouteHandler = async ({ db, req }, { queryParams }) => {
  await ensureAccountPermission({ db, req }, "content", Permission.list);
  const params = Object.fromEntries(queryParams.entries());
  const limit = ensureInt(params.limit, 10);
  const { query, cursor, parent_id } = params;
  const where = [`1=1`];
  const values: any[] = [limit];
  const i = () => values.length;
  if (cursor) {
    values.push(cursor);
    where.push(`parent_path>$${i()}`);
  }
  if (query) {
    values.push(query);
    where.push(`path LIKE %${i()}%`);
  }
  if (
    parent_id &&
    /^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/.test(
      parent_id
    )
  ) {
    values.push(parent);
    where.push(`parent_path @ '*.${parent}.*{0,2}'`);
  }
  const { rows } = await db.query(
    `SELECT * FROM content WHERE ${where.join(
      " AND "
    )} ORDER BY parent_path ASC LIMIT $1`,
    values
  );
  return {
    status: 200,
    body: {
      items: rows,
    },
  };
};
