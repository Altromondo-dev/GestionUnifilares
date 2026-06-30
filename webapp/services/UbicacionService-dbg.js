sap.ui.define([
	"./oDataService"
], function (oDataService) {
	"use strict";

	return {
		entitySet: "/replacethisURL",
		/*getUbicaciones: function (successCallback, errorCallback) {
			oDataService.getModel().read(this.entitySet, {
				success: successCallback,
				error: errorCallback
			});
		},*/

		// getUbicaciones: function (successCallback, errorCallback) {
		// 	var oModel = new sap.ui.model.json.JSONModel();
		// 	//qas
		// 	oModel.loadData("../sap/fiori/gestionunifilares/model/Ubicaciones.json");

		// 	//dev 
		// 	//oModel.loadData("/webapp/model/Ubicaciones.json");

		// 	oModel.attachRequestCompleted(function (data) {
		// 		successCallback(oModel.getData());
		// 	});
		// 	return oModel;
		// }
		getUbicaciones: function (successCallback, errorCallback) {
			var oModel = new sap.ui.model.json.JSONModel();

			// Generar la ruta con sap.ui.require.toUrl
			var sPath = sap.ui.require.toUrl("Transener/GestionUnifilares/model/Ubicaciones.json");

			oModel.loadData(sPath);

			oModel.attachRequestCompleted(function (data) {
				if (oModel.getData()) {
					successCallback(oModel.getData());
				} else {
					errorCallback("Error loading data");
				}
			});

			oModel.attachRequestFailed(function (oError) {
				errorCallback(oError);
			});

			return oModel;
		}

	};
});