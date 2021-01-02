import { IncomingMessage } from "http";
import { IncomingForm } from "formidable";
import { HTTPError } from "./errors";

export default async function requestParams(req: IncomingMessage) {
  try {
    const params = {} as any;
    const url = new URL(req.url, "http://localhost");
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    if (["GET", "DELETE"].includes(req.method.toUpperCase())) return params;
    params.input = await new Promise((resolve, reject) => {
      new IncomingForm({ multiples: true } as any).parse(
        req,
        (err, fields, incomingFiles) => {
          if (err) return reject(err);
          params.files = incomingFiles;
          resolve(fields);
        }
      );
    });
    return params;
  } catch (error) {
    throw new HTTPError(400, error.message);
  }
}
