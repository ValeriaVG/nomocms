import http from 'http';
import example from '../modules/example';
import { HTTPMethod } from './HTTPMethod';
import createRouter from './router';
import { Readable } from 'stream';

const port = process.env.PORT || 3030;

const modules = [example];

const routes = modules.reduceRight((a, m) => ({ ...a, ...m.routes }), {});
const routePath = createRouter<{ req: http.IncomingMessage }>(routes);
export const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, 'http://127.0.0.1');
	const result = await routePath(
		{ path: url.pathname, method: req.method.toUpperCase() as HTTPMethod },
		{ req }
	);
	res.statusCode = result.status || 200;
	if (result.headers) {
		for (const [header, value] of Object.entries(result.headers)) {
			res.setHeader(header, value as string);
		}
	}
	if (result.body instanceof Readable) {
		// TODO: Warn that it needs length, if missing
		return result.body.pipe(res);
	}
	if (result.body) {
		const buffer =
			result.body instanceof Buffer
				? result.body
				: typeof result.body === 'string'
				? Buffer.from(result.body)
				: Buffer.from(JSON.stringify(result.body));
		res.setHeader('content-length', buffer.byteLength);
		res.write(buffer);
	}
	return res.end();
});

if (!module.parent) {
	server.listen(port, () => {
		console.info(`Server is listening on http://localhost:${port}`);
	});
}
