sap.ui.define([
	//libs
	"sap/m/MessageToast",
	"sap/m/MessageBox"
	//helpers
], function (MessageToast, MessageBox) {
	"use strict";

	return {

		showMessageToast: function (i18nMessage) {
			sap.m.MessageToast.show(i18nMessage);
		},

		showAlert: function (i18nTitle, i18nMessage, fnOk) {
			var m = i18nMessage;
			var dialogAlert = new sap.m.Dialog({
				type: sap.m.DialogType.Message,
				title: i18nTitle,
				content: [
					new sap.m.Text({
						text: m
					}),
					new sap.m.FlexBox({
						justifyContent: sap.m.FlexJustifyContent.End,
						items: [
							new sap.m.Button({
								icon: "sap-icon://accept",
								press: function () {
									dialogAlert.close();
									dialogAlert.destroy();
									if (fnOk) {
										fnOk();
									}
								}
							})
						]
					})
				]
			}).addStyleClass("dialogCustom");
			dialogAlert.open();
		}
	};
});