sap.ui.define([
  "./oDataService",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (oDataService, Filter, FilterOperator, JSONModel) {
  "use strict";

  return {
    _entitySet: "/LimitacionTecnicaSet",

    async loadLimitacionesTecnicas(empresa, oComponent) {
      const aFilter = [new Filter("Empresa", FilterOperator.EQ, empresa)];
      try {
        const data = await this._read(aFilter);
        const oModel =
          oComponent.getModel("LimitacionesJsonModel") || new JSONModel();

        oModel.setData({ Limitaciones: data.results || [] });
        oModel.setSizeLimit(99999);
        oComponent.setModel(oModel, "LimitacionesJsonModel");

        return data; // opcional, por si querés encadenar
      } catch (e) {
        jQuery.sap.log.error("Error al cargar limitaciones técnicas", e && e.message);
        throw e;
      }
    },

    _read(aFilter) {
      return new Promise((resolve, reject) => {
        oDataService.getModel("TransenerOperaciones").read(this._entitySet, {
          filters: aFilter,
          success: resolve,
          error: reject
        });
      });
    }
  };
});
