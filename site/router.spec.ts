import { Test, expect } from 'tiny-jest';
import { HTTPMethod } from './HTTPMethod';
import { HTTPStatus } from './HTTPStatus';
import createRouter from './router';

export const test = new Test('Router');
const { it } = test;
it('should handle simple cases', async () => {
	const routeRequest = createRouter<void>({
		'/text': async () => ({ status: 200, body: 'Hello!', headers: { 'Content-Type': 'text' } }),
		'/json': async () => ({
			status: 201,
			body: { msg: 'Hello!' },
			headers: { 'Content-Type': 'application/json' }
		})
	});
	expect(await routeRequest({ path: '/text', method: HTTPMethod.GET })).toMatchObject({
		status: 200,
		headers: { 'Content-Type': 'text' },
		body: 'Hello!'
	});
	expect(await routeRequest({ path: '/json', method: HTTPMethod.GET })).toMatchObject({
		status: 201,
		headers: { 'Content-Type': 'application/json' },
		body: { msg: 'Hello!' }
	});
});
it('should handle method routing', async () => {
	const routeRequest = createRouter<void>({
		'/item': {
			GET: async () => ({ status: 200, body: 'GET', contentType: 'text' }),
			POST: async () => ({ status: 201, body: 'POST', contentType: 'text' })
		}
	});
	expect(await routeRequest({ path: '/item', method: HTTPMethod.GET })).toMatchObject({
		status: 200,
		contentType: 'text',
		body: 'GET'
	});
	expect(await routeRequest({ path: '/item', method: HTTPMethod.POST })).toMatchObject({
		status: 201,
		contentType: 'text',
		body: 'POST'
	});
	expect(await routeRequest({ path: '/item', method: HTTPMethod.PUT })).toMatchObject({
		status: HTTPStatus.MethodNotAllowed
	});
});

it('should handle variables in the path', async () => {
	const routeRequest = createRouter<void>({
		'/item/:id': (_, { id }) => ({ status: 200, body: { id } }),
		'/:a/:b/:c': { POST: (_, vars) => ({ status: 201, body: vars }) }
	});

	expect(await routeRequest({ path: '/item/1', method: HTTPMethod.GET })).toMatchObject({
		status: 200,
		body: { id: '1' }
	});
	expect(await routeRequest({ path: '/item/1/2/3', method: HTTPMethod.GET })).toMatchObject({
		status: HTTPStatus.NotFound
	});
	expect(await routeRequest({ path: '/a_a/b-b/c.c', method: HTTPMethod.POST })).toMatchObject({
		status: 201,
		body: { a: 'a_a', b: 'b-b', c: 'c.c' }
	});
});