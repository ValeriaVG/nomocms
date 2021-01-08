import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Table from "dashboard/components/Table";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import useQuery from "dashboard/utils/useQuery";
import { ContentPage } from "modules/pages/types";
import * as Preact from "preact";
import { Link } from "react-router-dom";

export default function Pages() {
  const { result, loading } = useQuery<{ items: ContentPage[] }>("/pages");
  const items = result && "items" in result ? result.items : [];
  return (
    <>
      <header>
        <h1>Pages</h1>
        <Link to="/pages/new" className="button-primary">
          <FontAwesomeIcon icon={faPlus} />
          New Page
        </Link>
      </header>
      <section>
        <Table
          keyField="id"
          items={items}
          isLoading={loading}
          columns={{
            title: { label: "Title" },
            path: {
              label: "Path",
            },
            publishedAt: {
              label: "Published",
            },
            edit: {
              render: ({ id }) => (
                <Link to={`/pages/${id}`} className="button-secondary">
                  Edit
                </Link>
              ),
            },
          }}
        />
      </section>
    </>
  );
}
