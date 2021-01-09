import * as Preact from "preact";
import { Notify } from "./notifications";

export default function Errors({
  errors,
}: {
  errors?: Readonly<Array<{ name: string; message: string }>>;
}) {
  return (
    <>
      {Boolean(errors?.length) &&
        errors.map((error) => (
          <Notify
            key={error.name}
            variant="error"
            id={error.message}
            content={error.message}
            ttl={10}
          />
        ))}
    </>
  );
}
