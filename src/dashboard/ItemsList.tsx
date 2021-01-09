import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Table, { TableColumns } from "dashboard/components/Table";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import useQuery from "dashboard/utils/useQuery";
import * as Preact from "preact";
import { Link } from "react-router-dom";

export default function ItemsList<T extends { id: string }>({
  singular,
  plural,
  path,
  columns,
}: {
  singular: string;
  columns: TableColumns<T>;
  path: string;
  plural: string;
}) {
  const { result, loading } = useQuery<{ items: T[] }>(path);
  const items = result && "items" in result ? result.items : [];
  return (
    <>
      <header>
        <h1>{plural}</h1>
        <Link to={`${path}/new`} className="button-primary">
          <FontAwesomeIcon icon={faPlus} />
          New {singular}
        </Link>
      </header>
      <section>
        <Table
          keyField="id"
          items={items}
          isLoading={loading}
          columns={{
            ...columns,
            edit: {
              render: ({ id }) => (
                <Link to={`${path}/${id}`} className="button-secondary">
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
