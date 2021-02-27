import NormalizedURL from "core/NormalizedURL";
import Pages from "modules/pages/Pages";

export default async function handleContent({
  pages,
  url,
}: {
  pages: Pages;
  url: NormalizedURL;
}) {
  const page = await pages.retrieve(url.normalizedPath);
  if (page) return { type: "amp", ...page };
  const notFoundPage = await pages.retrieve("/*");
  return { type: "amp", ...notFoundPage, code: 404 };
}
