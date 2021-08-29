import { useEffect, useRef, useState } from "preact/hooks";
import api from "./api";
import useNotification from "./notifications";

export default function usePreview(path: string, values: any) {
  const [previewEnabled, setPreviewEnabled] = useState<boolean>(false);

  const preview = useRef<{ timer?: NodeJS.Timeout; window?: Window }>({});

  const { showErrors } = useNotification();
  const timer = preview.current?.timer;

  const getPreview = () =>
    api.post(path, values).then((r) => {
      if (typeof r === "object") return showErrors(r.errors);
      const url =
        URL.createObjectURL(new Blob([r], { type: "text/html" })) +
        "#development=1";
      if (!preview.current.window) {
        preview.current.window = window.open(url, "blank");
      } else {
        preview.current.window.document.location.href = url;
      }
    });

  const togglePreview = () =>
    setPreviewEnabled((enabled) => {
      if (preview.current?.window?.closed) {
        preview.current.window = undefined;
        getPreview();
        return enabled;
      }
      if (preview.current?.window) {
        preview.current?.window.focus();
      }
      return true;
    });
  useEffect(() => {
    const cleanup = () => timer && clearTimeout(timer);
    if (!previewEnabled) return cleanup();
    if (timer) cleanup();

    if (!preview.current.window) {
      getPreview();
    } else {
      preview.current.timer = setTimeout(getPreview, 1000);
    }
    return cleanup;
  }, [values, previewEnabled]);

  return { previewEnabled, setPreviewEnabled, togglePreview };
}
