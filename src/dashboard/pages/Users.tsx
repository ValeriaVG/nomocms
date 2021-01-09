import {
  faEdit,
  faEye,
  faList,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Table from "dashboard/components/Table";
import ItemRoutes from "dashboard/ItemRoutes";
import FontAwesomeIcon from "dashboard/utils/FontAwesomeIcon";
import { Permission } from "modules/authorization/Permissions";
import { User, UserInput } from "modules/authorization/Users";
import * as Preact from "preact";

export default function Users() {
  return (
    <ItemRoutes<UserInput & { id: string }>
      name="User"
      columns={{ id: { label: "ID" } }}
      renderForm={({ values, setValue, onValueChange }) => {
        const onPermissionChange = (permission: number) => (e) => {
          if (permission === Permission.all) {
            return setValue(
              "permissions",
              e.target.checked ? Permission.all : 0
            );
          }
          if (e.target.checked)
            return setValue("permissions", values.permissions | permission);
          return setValue("permissions", values.permissions & ~permission);
        };
        return (
          <div class="buttons">
            <fieldset>
              <label>
                <span style="width:114px;">Name:</span>
                <input
                  type="name"
                  value={values.name}
                  onChange={onValueChange("name")}
                />
              </label>
              <label>
                <span style="width:114px;">Email:</span>
                <input
                  type="email"
                  value={values.email}
                  onChange={onValueChange("email")}
                  required
                />
              </label>
              <label>
                <span style="width:114px;">Password:</span>
                <input
                  type="password"
                  value={values.password}
                  onChange={onValueChange("password")}
                  required={!values.id}
                />
              </label>
            </fieldset>
            <fieldset style="display:flex;height:min-content;margin-top:0;padding:1rem 1rem 1rem 0">
              <label style="width:114px;">Permissions:</label>
              <table>
                <thead>
                  <tr>
                    <th>
                      <FontAwesomeIcon icon={faEye} />
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faList} />
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faPlus} />
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faEdit} />
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faTrash} />
                    </th>
                    <th>All</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {["read", "list", "create", "update", "delete", "all"].map(
                      (key) => (
                        <td key={key}>
                          <input
                            type="checkbox"
                            value={Permission[key]}
                            title={key}
                            checked={
                              key === "all"
                                ? values.permissions === Permission.all
                                : Boolean(values.permissions & Permission[key])
                            }
                            onChange={onPermissionChange(Permission[key])}
                          />
                        </td>
                      )
                    )}
                  </tr>
                </tbody>
              </table>
            </fieldset>
          </div>
        );
      }}
    />
  );
}
