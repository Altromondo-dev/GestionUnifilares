sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("my.namespace.UnifilarCreado", {
        onCloseApp: function () {
            try {
                window.close()
            } catch (e) {
                sap.m.MessageToast.show("No se puede cerrar esta ventana automáticamente.");
            }
        }
    });
});
