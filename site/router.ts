import { HTTPMethod } from './HTTPMethod';
import { HTTPStatus } from './HTTPStatus';
import { Readable } from 'stream';

export interface HandlerResponse<
	T = Record<string, any> | Array<any> | string | Buffer | Readable
> {
	headers?: Record<string, string>;
	body?: T;
	status: HTTPStatus;
}
export type RouteHandler<C = any> = (
	ctx: C,
	vars?: Record<string, string>
) => Promise<HandlerResponse> | HandlerResponse;
export type Route<C = any> = RouteHandler<C> | Partial<Record<HTTPMethod, RouteHandler<C>>>;

export function buildPathRegExp(path: string): RegExp {
	const routePath = path.startsWith('/') ? path : '/' + path;
	return new RegExp(
		`^${routePath.replace(/:([a-z]+)/gi, '(?<$1>[a-z-0-9-_.]+)').replace('/', '/')}$`,
		'i'
	);
}

export default function createRouter<C = any>(routes: Record<string, Route>) {
	const map = new Map<string, Route>(Object.entries(routes));
	const variablePaths = new Map<RegExp, string>();
	for (const key of map.keys()) {
		if (/\/:/.test(key)) {
			variablePaths.set(buildPathRegExp(key), key);
		}
	}

	return async ({ path, method }: { path: string; method: HTTPMethod }, ctx: C) => {
		const routePath = (path: string, params: Record<string, string> = {}) => {
			const route = map.get(path);
			if (typeof route === 'function') return route(ctx, params);
			if (typeof route !== 'object') throw new Error(`Mailformed route for ${path}: ${route}`);
			if (!route[method]) return { status: HTTPStatus.MethodNotAllowed };
			return route[method](ctx, params);
		};
		// Has this exact path
		if (map.has(path)) {
			return routePath(path);
		}
		for (const [re, pathWithVars] of variablePaths) {
			const matches = path.match(re);
			if (matches) {
				const params = matches.groups ?? {};
				return routePath(pathWithVars, params);
			}
		}
		return { status: HTTPStatus.NotFound };
	};
}
