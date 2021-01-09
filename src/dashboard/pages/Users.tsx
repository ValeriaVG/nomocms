import ItemRoutes from "dashboard/ItemRoutes";
import { User } from "modules/authorization/Users";
import * as Preact from "preact";

export default function Users() {
  return (
    <ItemRoutes<User>
      name="User"
      columns={{ id: { label: "ID" } }}
      renderForm={(form) => <></>}
    />
  );
}
