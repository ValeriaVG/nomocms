import { Server } from "http";
export type MemoryFile = {
  type: string;
  size: number;
  contents: string | Buffer;
};

export default function makeDevServer(files: Map<string, MemoryFile>) {
  const indexFile = files.get("/index.html");
  return new Server((req, res) => {
    const sendFile = (file: MemoryFile) => {
      res.setHeader("content-type", file.type);
      res.setHeader("content-length", file.size);
      return res.end(file.contents);
    };
    const path = req.url;
    if (files.has(path)) {
      return sendFile(files.get(path));
    }
    sendFile(indexFile);
  });
}
