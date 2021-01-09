import CRUDLResolver from "core/CRUDLResolver";
import Templates from "./Templates";

export const dataSources = {
  templates: Templates,
};

export const routes = CRUDLResolver<Templates>("templates");
