import { useEffect } from "react";
import useNotification from "./notifications";

export default function Errors({
  errors,
}: {
  errors?: Array<{ name: string; message: string }>;
}) {
  const { showErrors } = useNotification();
  useEffect(() => {
    errors && errors.length && showErrors(errors);
  }, [errors]);
  return null;
}
