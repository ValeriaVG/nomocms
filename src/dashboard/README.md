# Dashboard

Uses [Preact](https://preactjs.com/) & [sass](https://sass-lang.com/), bundled with [fuse-box](https://fuse-box.org/).

TypeScript is set to resolve jsx with `Preact.h` and `Preact.Fragment`,
therefore please start files with this import:

```tsx
import * as Preact from "preact";

export default function App() {
  return (
    <>
      <div>Rendered by preact!</div>
    </>
  );
}
```
