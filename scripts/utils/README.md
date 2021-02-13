# Monaco editor workers

This plugin adds monaco editor web workers via `MonacoEnviroment`.
It uses workers from `.workers` folder. If worker doesn't exist there it bundles it from `node_modules` using external fuse.

Workers are then copied to the original bundle, making them available even during development builds.
