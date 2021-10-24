export default {
	routes: {
		'/': () => {
			return {
				headers: {
					'content-type': 'text/html'
				},
				body: '<html><head><title>Example</title></head><body><h1>Example!</h1><p>Hello, world!</p></body></html>'
			};
		}
	}
};
