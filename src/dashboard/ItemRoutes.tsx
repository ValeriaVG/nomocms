import * as Preact from "preact";
import { Route, Switch } from "./utils/BrowserRouter";
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
  apipath,
  ...props
}: {
  name: string;
  columns: TableColumns<T>;
  plural?: string;
  path?: string;
  apipath?: string;
  defaultValue?: Partial<T>;
  renderForm: (
    form: FormValues<Partial<T>> & { update: boolean }
  ) => Preact.JSX.Element;
  legend?: string | Preact.JSX.Element;
}) {
  const plural = props.plural ?? name + "s";
  const path = props.path ?? "/" + plural.toLowerCase();
  const params = {
    singular: name,
    plural,
    path,
    apipath: apipath ? apipath : "/_api" + path,
  };
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
      <Route path={`${path}/new`} exact component={Page} />
      <Route path={`${path}/:id`} exact component={Page} />
      <Route path={path} exact component={Pages} />
    </Switch>
  );
}
