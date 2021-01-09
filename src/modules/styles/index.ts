import CRUDLResolver from "core/CRUDLResolver";
import Styles from "./Styles";

export const dataSources = {
  styles: Styles,
};

export const routes = CRUDLResolver<Styles>("styles");
