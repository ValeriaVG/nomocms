import CRUDLResolver from "core/CRUDLResolver";
import Pages from "./Pages";

export const dataSources = {
  pages: Pages,
};

export const routes = CRUDLResolver<Pages>("pages");
