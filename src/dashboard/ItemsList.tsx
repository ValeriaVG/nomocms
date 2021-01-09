import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { ErrorResponse } from "core/types";
import Table, { TableColumns } from "dashboard/components/Table";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import useQuery from "dashboard/utils/useQuery";
import * as Preact from "preact";
import { Link } from "react-router-dom";
import Errors from "./utils/Errors";

export default function ItemsList<T extends { id: string }>({
  singular,
  plural,
  path,
  columns,
  legend,
}: {
  singular: string;
  columns: TableColumns<T>;
  path: string;
  plural: string;
  legend?: string | Preact.JSX.Element;
}) {
  const { result, loading } = useQuery<{ items: T[] }>(path);
  const items = result && "items" in result ? result.items : [];

  return (
    <>
      <Errors errors={(result as ErrorResponse)?.errors} />
      <header>
        <div>
          <h1>{plural}</h1>
          {legend && <div class="legend">{legend}</div>}
        </div>
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
                <Link to={`${path}/${id}`} className="button-alt">
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
