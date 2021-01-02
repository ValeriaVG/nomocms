import { IncomingMessage } from "http";
import { IncomingForm } from "formidable";

export default async function requestParams(req: IncomingMessage) {
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
}
