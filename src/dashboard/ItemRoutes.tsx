import * as Preact from "preact";
import { Route, Switch } from "react-router-dom";
import { TableColumns } from "./components/Table";
import ItemForm from "./ItemForm";
import ItemsList from "./ItemsList";
import { FormValues } from "./utils/useForm";

export default function ItemRoutes<T extends { id: string }>({
  name,
  columns,
  renderForm,
  defaultValue,
  legend,
  ...props
}: {
  name: string;
  columns: TableColumns<T>;
  plural?: string;
  path?: string;
  defaultValue?: Partial<T>;
  renderForm: (form: FormValues<Partial<T>>) => Preact.JSX.Element;
  legend?: string | Preact.JSX.Element;
}) {
  const plural = props.plural ?? name + "s";
  const path = props.path ?? "/" + plural.toLowerCase();
  const params = { singular: name, plural, path };
  const Page = () => (
    <ItemForm {...params} defaultValue={defaultValue}>
      {renderForm}
    </ItemForm>
  );
  const Pages = () => (
    <ItemsList {...params} columns={columns} legend={legend} />
  );
  return (
    <Switch>
      <Route path={`${path}/new`} exact render={Page} />
      <Route path={`${path}/:id`} exact render={Page} />
      <Route path={path} exact render={Pages} />
    </Switch>
  );
}
