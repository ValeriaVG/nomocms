import { IncomingMessage } from "http";
import formidable, { IncomingForm } from "formidable";
import { HTTPError } from "./errors";
import { JSONObject } from "./types";

export default async function requestParams(req: IncomingMessage): Promise<
  Record<string, string> & {
    input?: JSONObject;
    files?: formidable.Files;
  }
> {
  try {
    const params = {} as any;
    const url = new URL(req.url, "http://localhost");
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    if (["GET", "DELETE"].includes(req.method.toUpperCase())) return params;
    const input = await new Promise((resolve, reject) => {
      new IncomingForm({ multiples: true } as any).parse(
        req,
        (err, fields, incomingFiles) => {
          if (err) return reject(err);
          params.files = incomingFiles;
          resolve(fields);
        }
      );
    });
    params.input = input;
    return params;
  } catch (error) {
    throw new HTTPError(400, error.message);
  }
}
