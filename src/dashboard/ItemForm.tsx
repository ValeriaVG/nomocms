import {
  faCheck,
  faCircleNotch,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BreadCrumbs from "dashboard/components/BreadCrumbs";
import api from "dashboard/utils/api";
import useForm, { FormValues } from "dashboard/utils/useForm";
import React from "react";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import NotFound from "./pages/NotFound";
import useNotification from "./utils/notifications";
import preventDefault from "./utils/preventDefault";
import useQuery from "./utils/useQuery";

export type ItemFormProps<T> = {
  singular: string;
  plural: string;
  path: string;
  apipath: string;
  defaultValue?: Partial<T>;
  children: (form: FormValues<Partial<T>> & { update: boolean }) => JSX.Element;
};

export function ItemCreate<T extends Record<string, any>>({
  path,
  singular,
  plural,
  defaultValue,
  apipath,
  children,
}: ItemFormProps<T>) {
  const { add, showErrors } = useNotification();
  const form = useForm<Partial<T>>(defaultValue);
  const history = useHistory();
  const onSubmit = async () => {
    const result = await api.post(apipath, form.values);
    if ("errors" in result) return showErrors(result.errors);
    add({
      id: "saved_" + singular,
      content: (
        <>
          <FontAwesomeIcon icon={faCheck} style={{ marginRight: "0.5rem" }} />{" "}
          Saved the {singular}
        </>
      ),
      variant: "success",
      ttl: 5,
    });

    history.push(path);
  };
  const label = `New ${singular}`;
  return (
    <form onSubmit={preventDefault(onSubmit)}>
      <header>
        <div>
          <BreadCrumbs
            path={[
              {
                to: path,
                label: plural,
              },
              {
                label,
              },
            ]}
          />
          <h1>{label}</h1>
        </div>
        <div className="buttons">
          <Link to={path} className="button-alt" type="cancel">
            Cancel
          </Link>
          <button className="button-primary" type="submit">
            <FontAwesomeIcon icon={faSave} />
            Create
          </button>
        </div>
      </header>
      {children({ ...form, update: false })}
    </form>
  );
}

export function ItemUpdate<T extends Record<string, any>>({
  path,
  singular,
  plural,
  defaultValue,
  apipath,
  children,
  id,
}: ItemFormProps<T> & { id: string }) {
  const { add, showErrors } = useNotification();
  const form = useForm<Partial<T>>(defaultValue);
  const history = useHistory();

  const onSubmit = async () => {
    const result = await api.post(`${apipath}/${id}`, form.values);
    if ("errors" in result) return showErrors(result.errors);
    return add({
      id: "updated_" + singular,
      content: (
        <>
          <FontAwesomeIcon icon={faCheck} style={{ marginRight: "0.5rem" }} />{" "}
          Updated the {singular} #{id}
        </>
      ),
      variant: "success",
      ttl: 5,
    });
  };
  const label = `${singular} #${id}`;
  const askAndDelete = () => {
    if (confirm(`Are you sure you want to delete ${label}?`)) {
      return api.delete(`${apipath}/${id}`).then((result) => {
        if ("errors" in result) return showErrors(result.errors);
        add({
          id: "deleted_" + singular,
          content: (
            <>
              <FontAwesomeIcon
                icon={faCheck}
                style={{ marginRight: "0.5rem" }}
              />{" "}
              Deleted {singular} #{id}
            </>
          ),
          variant: "success",
          ttl: 3,
        });
        return history.push(path);
      });
    }
  };
  return (
    <>
      <form
        onSubmit={preventDefault(onSubmit)}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <header>
          <div>
            <BreadCrumbs
              path={[
                {
                  to: path,
                  label: plural,
                },
                {
                  label,
                },
              ]}
            />
            <h1>{label}</h1>
          </div>
          <div className="buttons">
            <Link
              to={path}
              className="button-alt"
              type="cancel"
              onClick={() => history.goBack()}
            >
              Cancel
            </Link>
            <button className="button-primary" type="submit">
              <FontAwesomeIcon icon={faSave} />
              Save
            </button>
          </div>
        </header>
        {children({ ...form, update: true })}
      </form>
      <footer>
        <button
          className="button button-danger"
          onClick={askAndDelete}
          style={{ marginLeft: "auto" }}
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </button>
      </footer>
    </>
  );
}

export default function ItemForm<T>(props: ItemFormProps<T>) {
  const {
    params: { id },
  } = useRouteMatch<{ id?: string }>();
  const { loading, result } = useQuery(id && props.apipath + "/" + id);

  if (id && result?.id)
    return <ItemUpdate {...props} id={id} defaultValue={result} />;

  if (loading) return <FontAwesomeIcon icon={faCircleNotch} spin />;
  if (!id) return <ItemCreate {...props} />;
  return <NotFound />;
}
