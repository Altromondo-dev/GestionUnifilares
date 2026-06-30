
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../services/UbicacionService",
	"../services/oDataService",
	'sap/m/MessageToast',
	"../utils/MessageBoxHelper",
	"sap/ui/core/Fragment",
	"../services/LimitacionesTecnica"
], function (Controller, UbicacionService, oDataService, MessageToast, MessageBoxHelper, Fragment, LimitacionesTecnica) {
	"use strict";

	return Controller.extend("Transener.GestionUnifilares.controller.Main", {
		drawIcon: false,
		drawIcon1: false,
		drawIcon2: false,
		_raysArray: [],
		_firstZoom: 0,
		_canvasScale: 1,
		_scaleFactor: 1.01,
		zoom: 1,
		iZoomIn: 0,
		iZoomOut: 0,
		_isDrawing: false,
		initialZoomScale: 100,

		zoomIn: function () {
			var oImage = document.body.style;
			if (this.initialZoomScale < 170) {
				this.initialZoomScale = this.initialZoomScale + 10
				var sWidth = this.initialZoomScale.toString() + "%";
				oImage.zoom = sWidth;
			}
		},

		zoomOut: function () {
			var oImage = document.body.style;
			if (this.initialZoomScale > 100) {
				this.initialZoomScale = this.initialZoomScale - 10
				var sWidth = this.initialZoomScale.toString() + "%";
				oImage.zoom = sWidth;
			}
		},

		openThirdPartyEquipmentView: function () {
			if (this.oDialogTable) {
				this.oDialogTable.close();
			}
			var oDialogSelection = new sap.m.Dialog({
				title: "Medidas de Seguridad de Terceros",
				contentWidth: "70%",
				content: [
					new sap.m.VBox({
						width: "90%",
						items: [
							new sap.m.Text({
								text: "Interruptor abierto y en local / extraído."
							}),
							new sap.m.TextArea({
								width: "100%",
								value: "{ThirdPartyEQModel>/InterAbiertoLocalExt}"
							})
						]
					}).addStyleClass("sapUiTinyMarginBeginEnd"),
					new sap.m.VBox({
						width: "90%",
						items: [
							new sap.m.Text({
								text: "Seccionador abierto bloqueado y trabado."
							}),
							new sap.m.TextArea({
								width: "100%",
								value: "{ThirdPartyEQModel>/SeccionadorAbiertoBloqCerr}"
							})
						]
					}).addStyleClass("sapUiTinyMarginBeginEnd"),
					new sap.m.VBox({
						width: "90%",
						items: [
							new sap.m.Text({
								text: "Seccionador de PaT cerrado."
							}),
							new sap.m.TextArea({
								width: "100%",
								value: "{ThirdPartyEQModel>/SeccionadorPatCerr}"
							})
						]
					}).addStyleClass("sapUiTinyMarginBeginEnd"),
					new sap.m.VBox({
						width: "90%",
						items: [
							new sap.m.Text({
								text: "PaT adicional"
							}),
							new sap.m.TextArea({
								width: "100%",
								value: "{ThirdPartyEQModel>/PatAdicional}"
							})
						]
					}).addStyleClass("sapUiTinyMarginBeginEnd"),
				],
				buttons: [
					new sap.m.Button({
						text: "Guardar",
						press: [this.closeThirdPartyDialog, this]
					}).addStyleClass("buttonInverted floatLeft"),
					new sap.m.Button({
						text: "Cancelar",
						icon: "sap-icon://decline",
						press: [this.closeThirdPartyDialog, this]
					}).addStyleClass("buttonInverted floatLeft"),
				]
			});
			this.getView().addDependent(oDialogSelection);
			this.oDialogSelection = oDialogSelection;
			oDialogSelection.open();
		},

		closeThirdPartyDialog: function () {
			var data = this.getView().getModel("ThirdPartyEQModel").getData();
			this.setButtonColor(data)
			this.oDialogSelection.close();
		},

		formatTextDraw: function (draw) {
			return draw ? "Dibujo activado" : "Dibujo desactivado";
		},

		formatTextInfo: function (bActivated) {
			return bActivated ? "Referencia Activada" : "Referencia Desactivada"
		},

		formatImageDraw: function (draw) {
			return draw ? sap.ui.require.toUrl("Transener/GestionUnifilares/img/menubut/lapiz_azul_linea_naranja.svg") :
				sap.ui.require.toUrl("Transener/GestionUnifilares/img/menubut/lapiz_azul.svg");
		},

		formatImageHands: function (data) {
			return data ? sap.ui.require.toUrl("Transener/GestionUnifilares/img/menubut/mano_linea_naranja.svg") :
				sap.ui.require.toUrl("Transener/GestionUnifilares/img/menubut/manos.svg");
		},

		createVisibilityModel: function () {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				isDrawing: this._isDrawing,
				textTitle: "",
				UT: "",
				referenceActivated: false,
				handsOn: false
			}), "DrawingModel");
		},

		handleOpenInfoTable: function () {
			if (this.oDialogTable) {
				this.oDialogTable.destroy(true);
			}

			var bDraw = this.getView().getModel("DrawingModel").getProperty("/referenceActivated");
			this.getView().getModel("DrawingModel").setProperty("/referenceActivated", !bDraw);

			var oDialogTable = new sap.m.Dialog({
				afterClose: () => {
					this.getView().getModel("DrawingModel").setProperty("/referenceActivated", false);
				},
				title: "Referencia de colores",
				contentWidth: "20%",
				draggable: true,
				modal: true,
				content: [
					new sap.m.Table({
						inset: false,
						fixedLayout: false,
						columns: [
							new sap.m.Column({
								hAlign: sap.ui.core.TextAlign.Center,
								header: new sap.m.Text({
									text: "Color"
								})
							}),
							new sap.m.Column({
								hAlign: sap.ui.core.TextAlign.Center,
								header: new sap.m.Text({
									text: "Detalle"
								})
							}),
						],
						items: [
							new sap.m.ColumnListItem({
								cells: [
									new sap.m.HBox({
										width: "25px",
										height: "25px"
									}).addStyleClass("PurpleBox"),
									new sap.m.Text({
										text: "Interruptor abierto y en local / extraido"
									}),
								]
							}),
							new sap.m.ColumnListItem({
								cells: [
									new sap.m.HBox({
										width: "25px",
										height: "25px"
									}).addStyleClass("RedBox"),
									new sap.m.Text({
										text: "Seccionador abierto bloqueado y trabado"
									}),
								]
							}),
							new sap.m.ColumnListItem({
								cells: [
									new sap.m.HBox({
										width: "25px",
										height: "25px"
									}).addStyleClass("YellowBox"),
									new sap.m.Text({
										text: "Seccionador de PaT cerrado"
									}),
								]
							}),
							new sap.m.ColumnListItem({
								cells: [
									new sap.m.HBox({
										width: "25px",
										height: "25px"
									}).addStyleClass("GreenBox"),
									new sap.m.Text({
										text: "Equipos a mover / pruebas funcionales a realizar"
									}),
								]
							})
						]
					})
				],
			});
			this.getView().addDependent(oDialogTable);
			this.oDialogTable = oDialogTable;
			oDialogTable.open();
			//	sap.ui.getCore().byId("sap-ui-blocklayer-popup").addStyleClass("jajaaj")
			$("#sap-ui-blocklayer-popup").addClass("bloff")
		},

		getBaseURL: function () {

			var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");

			//var appId = this.getManifestEntry("/sap.app/id");
			var appPath = appId.replaceAll(".", "/");
			var appModulePath = jQuery.sap.getModulePath(appPath);

			var jsonModel = sap.ui.getCore().getModel("appCurrentInfo");
			//checks if the model exists
			if (!jsonModel) {
				jsonModel = new sap.ui.model.json.JSONModel();
				jsonModel.setSizeLimit(9999);
				jsonModel.appUrl = appModulePath;
				sap.ui.getCore().setModel(jsonModel, "appCurrentInfo");
				//initilializing = appModulePath; 
				jsonModel.setData({});
			}
			return appModulePath;
		},

		onInit: function () {
			// cdr migracion
			var cUrl = this.getBaseURL();
			var oImageModel = new sap.ui.model.json.JSONModel();
			oImageModel.loadData(sap.ui.require.toUrl("Transener/GestionUnifilares/model/imagesRoutes.json"));

			// Establecer el modelo en la vista
			this.getView().setModel(oImageModel, "imageModel");
			// Establecer el modelo en la vista
			this.getView().setModel(oImageModel, "imageModel");
			this.createVisibilityModel();
			//var xhr = new XMLHttpRequest();
			var search = location.hash.split("?")[1];
			var url = new URL(location.origin + "?" + search);

			//DEV PRUEBA POSTA

			this.Empresa = url.searchParams.get("Empresa");
			this.Anio = url.searchParams.get("Anio");
			this.RealIdUnifilar = url.searchParams.get("RealIdUnifilar");
			this.IdLicencia = url.searchParams.get("Id");
			this.IdUnifilar = url.searchParams.get("IdUnifilar");
			this.Centro = url.searchParams.get("Centro");
			this.ET = url.searchParams.get("ET");
			this.Mode = url.searchParams.get("Mode");
			this.Version = url.searchParams.get("Version");
			this.Tipo = url.searchParams.get("Tipo");
			this.LicenciaCreada = url.searchParams.get("LicenciaCreada");

			this.aNoRelDelete = []; //TRNS95 

			LimitacionesTecnica.loadLimitacionesTecnicas(this.Empresa === "100" ? "TRANSENER" : "TRANSBA", this.getOwnerComponent())

		},

		handleDraw: function () {
			this._isDrawing = !this._isDrawing;
			this.getView().getModel("DrawingModel").setProperty("/isDrawing", this._isDrawing);
			this.fabricCanvas.isDrawingMode = this._isDrawing;
			//var squarePatternBrush = new fabric.PatternBrush(this.fabricCanvas);

			//this.fabricCanvas.freeDrawingBrush = squarePatternBrush;
			this.fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(this.fabricCanvas);
			this.fabricCanvas.freeDrawingBrush.color = "#000000"; // Color negro
			this.fabricCanvas.freeDrawingBrush.width = 2; // Grosor del trazo

		},

		checkbounds: function (boundingBox, movingBox) {
			var self = this;

			var top = movingBox.top;
			var bottom = top + movingBox.height;
			var left = movingBox.left;
			var right = left + movingBox.width;

			var topBound = boundingBox.top;
			var bottomBound = topBound + boundingBox.height;
			var leftBound = boundingBox.left;
			var rightBound = leftBound + boundingBox.width;

			// capping logic here
			movingBox.set("left", Math.min(Math.max(left, leftBound), rightBound - movingBox.width));
			movingBox.set("top", Math.min(Math.max(top, topBound), bottomBound - movingBox.height));

		},

		findBoundingBox: function (sId) {
			var aObjects = this.fabricCanvas.getObjects();

			var oMovingBox = aObjects.find(function (e) {
				var splittedId = e.id.split("---")[1];
				return splittedId === sId;
			})
			if (oMovingBox) {
				return oMovingBox;
			}
			return {};

		},

		isMarker: function (object) {
			return object.target !== null && object.target.id === "MARCADOR";
		},

		getIndividualEquipment: function (sUT) {
			var aData = this.getView().getModel("Ubicaciones").getData().Ubicaciones;
			return aData.find(e => e.Ut === sUT);
		},

		getControlByClass: function (UT, classMarker) {
			if (classMarker === "RF") {
				return new sap.m.Input({
					maxLength: 30,
					width: "94%",
					value: "{" + UT + "_JsonModel>/Comments}"
				}).addStyleClass("sapUiTinyMarginBeginEnd")
			} else {
				return new sap.m.TextArea({
					visible: false,
					width: "90%",
					height: "100px",
					value: "{" + UT + "_JsonModel>/Comments}"
				}).addStyleClass("sapUiTinyMarginBeginEnd")
			}
		},

		getLabelByClass: function (UT, classMarker) {
			if (classMarker === "RF") {
				return new sap.m.Text({
					text: "Especificar Características Técnicas"
				}).addStyleClass("sapUiTinyMarginBegin")
			} else {
				return new sap.m.Text({
					visible: false,
					text: "Comentarios"
				}).addStyleClass("sapUiTinyMarginBegin")
			}
		},

		validateMarkerDialog: function (oModelData) {
			if (oModelData.Clase === "RF" && oModelData.Comments === "") {
				sap.m.MessageToast.show("Comentario Requerido", {
					duration: 3000, // default
					width: "15em", // default
					my: "center bottom", // default
					at: "center bottom", // default
					of: window, // default
					offset: "0 0", // default
					collision: "fit fit", // default
					onClose: null, // default
					autoClose: true, // default
					animationTimingFunction: "ease", // default
					animationDuration: 1000, // default
					closeOnBrowserNavigation: true // default
				});
				return false
			} else {
				return true
			}
		},
		// ✅ Devuelve una Promise que se resuelve AL CERRAR el mensaje (si hay)
		// o inmediatamente (si no hay). No usa sap.ui.getCore().
		checkLimiTecnica: function (equipo) {
			try {
				var oModelLim = this.getOwnerComponent().getModel("LimitacionesJsonModel");
				var aLimitaciones = (oModelLim && oModelLim.getData() && oModelLim.getData().Limitaciones) || [];
				var aFilteredLim = aLimitaciones.filter(function (limitacion) {
					return limitacion.Equipo === equipo;
				});

				if (aFilteredLim.length === 0) {
					// No hay limitaciones -> continuar YA
					return Promise.resolve(false);
				}

				// Armar mensaje
				var sMensaje = `El equipo ${equipo} tiene activas las siguientes Limitaciones técnicas:\n`;
				aFilteredLim.forEach(function (limitacion) {
					sMensaje += `- ${limitacion.Idlimitacion}\n`;
				});

				// Mostrar y esperar a que el usuario cierre
				return new Promise(function (resolve) {
					sap.m.MessageBox.information(sMensaje, {
						title: "Limitaciones técnicas",
						onClose: function () {
							resolve(true); // hubo limitaciones y ya cerraron el mensaje
						}
					});
				});

			} catch (e) {
				// Ante cualquier problema, no bloquees el flujo
				return Promise.resolve(false);
			}
		},



		openDialogMarkers: function (bFoundCoordinates, opt) {
			if (this.oDialogTable) {
				this.oDialogTable.close();
			}

			var self = this;
			var UT = bFoundCoordinates.equipoEncontrado.Ut;

			// 1) Chequear limitaciones y esperar cierre del mensaje (si lo hubo)
			this.checkLimiTecnica(UT).then(function () {
				// 2) Recién acá abrimos el diálogo original

				var pointerX = opt.pointer.x;
				var pointerY = opt.pointer.y;

				self.opt = {
					target: {
						data: bFoundCoordinates.equipoEncontrado,
						pointerX: pointerX,
						pointerY: pointerY
					}
				};

				var oModelEquipmentSelected = self.generateModelSelectedEquipment(self.opt, UT);
				var classMarker = oModelEquipmentSelected.getData().Clase;

				var oControlLabel = self.getLabelByClass(UT, classMarker);
				var oControl = self.getControlByClass(UT, classMarker);

				var oDialog = new sap.m.Dialog({
					contentWidth: "500px",
					title: self.opt.target.data.Ut,
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Guardar",
						press: function (oEvent) {
							var oModel = oEvent.getSource().getModel(UT + "_JsonModel");
							var oModelData = oModel.getData();
							if (self.validateMarkerDialog(oModelData)) {
								var iconOption = oModelData.SelectedIndex.toString();
								if (!oModelData.created) {
									oEvent.getSource().getModel(UT + "_JsonModel").setProperty("/created", "X");
									oModelData.created = "X";
									self.opt.target.formData = oModelData;
									self.opt.target.formData.created = true;
									self.createMarker(self.opt, iconOption, oModelData);
								} else {
									self.editMarker(self.opt, iconOption, UT, oModelData);
								}
								oEvent.getSource().getParent().close();
							}
						}.bind(self)
					}),
					endButton: new sap.m.Button({
						text: "Cerrar",
						press: function (oEvent) {
							oEvent.getSource().getParent().close();
						}
					}),
					content: [
						new sap.m.VBox({
							items: [
								new sap.m.List({
									items: [
										new sap.m.StandardListItem({
											title: "Descripcion",
											description: self.opt.target.data.Ut
										})
									]
								}),
								new sap.m.RadioButtonGroup({
									selectedIndex: `{${UT}_JsonModel>/SelectedIndex}`,
									buttons: [
										new sap.m.RadioButton({ text: "Interruptor abierto y en local", enabled: `{${UT}_JsonModel>/EnabledInterruptorAbierto}` }),
										new sap.m.RadioButton({ text: "Seccionador abierto bloqueado y trabado", enabled: `{${UT}_JsonModel>/EnabledSeccionadorAbierto}` }),
										new sap.m.RadioButton({ text: "Seccionador PAT cerrado", enabled: `{${UT}_JsonModel>/EnabledSeccionadorPat}` }),
										new sap.m.RadioButton({ text: "Equipos a mover (Interruptores)", enabled: `{${UT}_JsonModel>/EnabledEquiposAMover}` }),
										new sap.m.RadioButton({ text: "Equipos a mover (Seccionadores)", enabled: `{${UT}_JsonModel>/EnabledEquipoAMoverSeccionador}` }),
										new sap.m.RadioButton({ text: "Equipos a mover (Seccionadores)", enabled: `{${UT}_JsonModel>/EnabledEquipoAMoverSeccionadorPat}` }),
										new sap.m.RadioButton({ text: "Interruptor extraído", enabled: `{${UT}_JsonModel>/EnabledInterruptorAbierto}` })
									]
								}),
								oControlLabel,
								oControl
							]
						})
					]
				});

				oDialog.setModel(oModelEquipmentSelected, UT + "_JsonModel");
				oDialog.open();
			});
		},


		onAfterRendering: function () {
			this.getView().setBusy(true);
			this._oModel = oDataService.getModel("TransenerOperaciones");

			var self = this
			this.byId("canvas").setContent("<canvas id='canvas-container' class='canvas-container'></canvas>");

			setTimeout(function () {

				self.fabricCanvas = new fabric.Canvas("canvas-container", {
					isDrawingMode: false,
				});

				self.fabricCanvas.on('selection:created', (e) => {
					if (e.target.type === 'activeSelection') {
						self.fabricCanvas.discardActiveObject();
					} else {
						//do nothing
					}
				})

				/*	var boundingBox = new fabric.Rect({
						fill: "transparent",
						width: 600,
						height: 400,
						hasBorders: false,
						hasControls: false,
						lockMovementX: true,
						lockMovementY: true,
						evented: false,
						stroke: "red"

					});
					//TODO this could be the object
					var movingBox = new fabric.Rect({
						width: 100,
						height: 100,
						hasBorders: false,
						hasControls: false
					});*/

				self.fabricCanvas.on('mouse:move', function (opt) {
					self.checkCoordinates(opt.pointer.x, opt.pointer.y);
				});

				var isObjectMoving = false;
				self.fabricCanvas.on('object:moving', function (event) {
					isObjectMoving = true;
					//TODO DESOMCNETAR CUANDO TERMINE DE ACOMODAR TEMPLATE
					/*var movingBox = event.target;
					var movingBoxData = movingBox.data
					if (movingBoxData) {
						var movingBoxUT = movingBoxData.UT;
						if (movingBoxUT) {
							var boundingBox = self.findBoundingBox(movingBoxUT);
							self.checkbounds(boundingBox, movingBox);
						}
					}*/
				});

				/*self.fabricCanvas.add(boundingBox);
				self.fabricCanvas.add(movingBox);
				self.fabricCanvas.renderAll();*/

				self.fabricCanvas.on('mouse:dblclick', function (opt) {
					var bFoundCoordinates = self.checkIfFoundEquipment(opt.pointer.x, opt.pointer.y);
					if (bFoundCoordinates.bFound) {
						self.openDialogMarkers(bFoundCoordinates, opt);
					} else {
						if (self.isMarker(opt)) {
							bFoundCoordinates.equipoEncontrado = self.getIndividualEquipment(opt.target.data.UT);
							self.openDialogMarkers(bFoundCoordinates, opt);
						} else {
							self.checkAndOpenNonAssociatedCamps(opt);
						}
					}
				});

				//cuando el objeto se dejo de mover
				self.fabricCanvas.on('mouse:up', function (opt) {
					console.log(opt);

					this.isDragging = false;
					this.selection = true;

					if (isObjectMoving) {
						isObjectMoving = false;
						/*	console.log("se dejo de mover");
							console.log(opt) // fire this if finished
							var oObject = self.checkIfFoundEquipment(opt.pointer.x, opt.pointer.y);
							var obj = opt.target;
							var color = "";
							if (oObject.bFound) {
								self.showMessageToast();
								obj.data = oObject.equipoEncontrado;
								console.log("icono en lugar de equipo");
								color = '#49FF33';
								obj.showDialog = true;
							} else {
								obj.showDialog = false;
								color = '#F02F14';
							}
							if (obj && obj._objects) {
								for (var i = 0; i < obj._objects.length; i++) {
									obj._objects[i].set({
										fill: color
									});
								}
							}
							self.fabricCanvas.setActiveObject(obj).renderAll();*/
					}
				});

				//	self.fabricCanvas.setBackgroundImage("../sap/fiori/gestionunifilares/img/" + self.Unifilar + ".jpg")
				//self.fabricCanvas.setBackgroundImage("/webapp/img/" + self.Unifilar + ".jpg")

				self.loadUnifilarImage($.proxy(self.onSuccess, self), $.proxy(self.onError, self))
			}, 2000)

		},

		getGeneralData: function () {
			return new Promise((resolve, reject) => {
				this._editEntity = "/EsquemaUnifilarMarcadorSet(Idunifilar='" + this.IdUnifilar + "',Numerolicencia='" + this.IdLicencia +
					"',Empresa='" +
					this.Empresa +
					"',Anio='" + this.Anio + "')"
				var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
				oModelOperaciones.read(this._editEntity, {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						console.log(e)
					}
				});
			});
		},

		getNonAssociatedData: function () {
			return new Promise((resolve, reject) => {
				this._editEntity = "/EsquemaUnifilarMarcadorSet(Idunifilar='" + this.IdUnifilar + "',Numerolicencia='" + this.IdLicencia +
					"',Empresa='" +
					this.Empresa +
					"',Anio='" + this.Anio + "')"
				var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
				oModelOperaciones.read(this._editEntity + "/marcadoresnorel_nav", {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						console.log(e)
					}
				});
			});
		},

		getAsociatedData: function () {
			return new Promise((resolve, reject) => {
				this._editEntity = "/EsquemaUnifilarMarcadorSet(Idunifilar='" + this.IdUnifilar + "',Numerolicencia='" + this.IdLicencia +
					"',Empresa='" +
					this.Empresa +
					"',Anio='" + this.Anio + "')"
				var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
				oModelOperaciones.read(this._editEntity + "/marcadores_nav", {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						console.log(e)
					}
				});
			});
		},

		createThirdPartyEQModel: function () {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				InterAbiertoLocalExt: "",
				SeccionadorAbiertoBloqCerr: "",
				SeccionadorPatCerr: "",
				PatAdicional: ""
			})
			this.getView().setModel(oModel, "ThirdPartyEQModel")
		},

		generateTransparentBackgroundForMarker: function () {
			var self = this;
			var aData = this.getView().getModel("Ubicaciones").getProperty("/Ubicaciones")
			aData.forEach(function (e) {
				var xPercentage = parseFloat(e.XIniPorc) * self.imgWidth;
				var yPercentage = parseFloat(e.YIniPorc) * self.imgHeight;
				var xPercentageEnd = parseFloat(e.XFinPorc) * self.imgWidth;
				var yPercentageEnd = parseFloat(e.YFinPorc) * self.imgHeight;

				var transparentBackground = new fabric.Rect({
					fill: "transparent",
					left: xPercentage,
					top: yPercentage,
					width: 17,
					height: 17,
					hasBorders: false,
					hasControls: false,
					lockMovementX: true,
					selectable: false,
					lockMovementY: true,
					evented: false,
					lockRotation: true,
					lockScalingFlip: true,
					lockScalingX: true,
					lockScalingY: true,
					lockSkewingX: true,
					//stroke: "red",
					id: `TransparentBackground----${e.Ut}`,
					idGen: "TransparentBack"
				});

				self.fabricCanvas.add(transparentBackground);

			});
			self.fabricCanvas.renderAll();
		},

		generateRedPoints: function () {
			var self = this;
			var aData = this.getView().getModel("Ubicaciones").getProperty("/Ubicaciones")
			aData.forEach(function (e) {
				var xPercentage = parseFloat(e.XIniPorc) * self.imgWidth;
				var yPercentage = parseFloat(e.YIniPorc) * self.imgHeight;
				var xPercentageEnd = parseFloat(e.XFinPorc) * self.imgWidth;
				var yPercentageEnd = parseFloat(e.YFinPorc) * self.imgHeight;

				var boundingBox = new fabric.Rect({
					fill: "transparent",
					left: xPercentage - 15,
					top: yPercentage - 15,
					width: 60,
					height: 60,
					hasBorders: false,
					hasControls: false,
					lockMovementX: true,
					lockMovementY: true,
					selectable: false,
					evented: false,
					lockRotation: true,
					lockScalingFlip: true,
					lockScalingX: true,
					lockScalingY: true,
					lockSkewingX: true,
					//stroke: "red",
					id: `BoundingBox---${e.Ut}`
				});

				self.fabricCanvas.add(boundingBox);

			});
			self.fabricCanvas.renderAll();
		},

		generateImageBackground: function () {
			var self = this;
			this.createThirdPartyEQModel();
			if (this.Mode === "C") {
				self.fabricCanvas.setBackgroundImage(self.urlBase64, function (img) {
					if (!img || !img._element) {
						self.getView().setBusy(false);
						return;
					}
					self.fabricCanvas.setHeight(img.height);
					self.fabricCanvas.setWidth(img.width);
					self.fabricCanvas.renderAll();
					self.imgWidth = img.width;
					self.imgHeight = img.height;
					//TODO DESCOMENTAR DPS DEL TEMPLATE
					//self.generateRedPoints();
					self.generateTransparentBackgroundForMarker();
					self.getView().setBusy(false);
				});
			} else {
				var aPromises = [];
				aPromises.push(this.getGeneralData())
				aPromises.push(this.getNonAssociatedData())
				aPromises.push(this.getAsociatedData())
				Promise.all(aPromises).then((aData) => {
					var oGeneralData = aData[0];

					var oModelEquipos = this.getView().getModel("ThirdPartyEQModel")
					oModelEquipos.setProperty("/InterAbiertoLocalExt", oGeneralData.IntAbLe)
					oModelEquipos.setProperty("/SeccionadorAbiertoBloqCerr", oGeneralData.SecAbBt)
					oModelEquipos.setProperty("/SeccionadorPatCerr", oGeneralData.SecPatCr)
					oModelEquipos.setProperty("/PatAdicional", oGeneralData.PatAdic)
					this.setButtonColor(oModelEquipos.getData());
					this.createMarkersModel(aData[2].results);
					this.onSuccesEditImage(oGeneralData)

				}).catch((e) => {
					console.log(e);
				})
			}
		},

		blockObjects: function () {
			var aMarkers = this.fabricCanvas.getObjects().filter(e => e.id === "MARCADOR")
			aMarkers.forEach((e) => {
				e.lockMovementX = true;
				e.lockMovementY = true;
				e.selectable = true;
				e.lockRotation = true;
				e.lockScalingFlip = true;
				e.lockScalingX = true;
				e.lockScalingY = true;
				e.lockSkewingX = true;
			});

			var aBackgrounds = this.fabricCanvas.getObjects().filter(e => e.idGen === "TransparentBack")
			aBackgrounds.forEach((e) => {
				e.lockMovementX = true;
				e.lockMovementY = true;
				e.selectable = true;
				e.lockRotation = true;
				e.lockScalingFlip = true;
				e.lockScalingX = true;
				e.lockScalingY = true;
				e.lockSkewingX = true;
			})
		},

		setButtonColor: function (data) {
			var oButton = this.byId("medidasButon")
			if (data.InterAbiertoLocalExt !== "" || data.PatAdicional !== "" || data.SeccionadorAbiertoBloqCerr !== "" || data.SeccionadorPatCerr !==
				"") {
				this.getView().getModel("DrawingModel").setProperty("/handsOn", true)
			} else {
				this.getView().getModel("DrawingModel").setProperty("/handsOn", false)
			}
			console.log(data);
		},

		createMarkersModel: function (aData) {
			for (var oData of aData) {
				var UT = oData.Equipo;
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					UT: UT,
					SelectedIndex: parseInt(oData.Opcionseleccionada),
					Comments: oData.Comentario,
					//TODO MAPEAR?
					LicenseNumber: "",
					EnabledInterruptorAbierto: oData.Clase === "IN" || oData.Clase === "RF",
					EnabledEquiposAMover: oData.Clase === "IN",
					EnabledSeccionadorAbierto: oData.Clase === "SC" || oData.Clase === "RF",
					EnabledEquipoAMoverSeccionador: oData.Clase === "SC" || oData.Clase === "RF",
					EnabledSeccionadorPat: oData.Clase === "ST",
					EnabledEquipoAMoverSeccionadorPat: oData.Clase === "ST",
					Clase: oData.Clase,
					created: true
				});
				this.getView().setModel(oModel, UT + "_JsonModel")
			}
		},

		onSuccesEditImage: function (data) {
			var self = this
			self.fabricCanvas.setBackgroundImage(self.urlBase64, function (img) {
				if (!img || !img._element) {
					self.getView().setBusy(false);
					return;
				}
				self.fabricCanvas.setHeight(img.height);
				self.fabricCanvas.setWidth(img.width);
				self.fabricCanvas.renderAll();
				self.imgWidth = img.width;
				self.imgHeight = img.height;
				//TODO DESCOMENTAR DPS DEL TEMPLATE
				//	self.generateRedPoints();
				self.getView().setBusy(false);
				self.fabricCanvas.loadFromJSON(JSON.parse(data.Mapa), function () {
					self.blockObjects();
				});
			});

		},

		loadUnifilarImage: function (fnSuccess, fnError) {
			var aFilters = [];
			//TODO MAPEAR CENTRO LICENCIA this.Centro 102
			var centerFilter = new sap.ui.model.Filter({
				path: "Centro", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.Centro //d
			});
			//TODO MAPEAR CENTRO LICENCIA this.ET AB
			var ETFilter = new sap.ui.model.Filter({
				path: "Et", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.ET //d
			});

			var IdFilter = new sap.ui.model.Filter({
				path: "IdUnifilar", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.RealIdUnifilar //d
			});

			var TipoFilter = new sap.ui.model.Filter({
				path: "TipoUnifilar", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.Tipo //d
			});

			//TODO MANDAR VERSION 

			//PARA EDICION, NO METO ESTE FILTRO, SINÓ
			//SIEMPRE EN UNO para this.Mode === "C" ? "1" : ""

			if (this.Mode === "C") {
				//buscar version activa en creacion. 
				var EstadoFilter = new sap.ui.model.Filter({
					path: "Estado",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "1"
				});
				aFilters.push(EstadoFilter);
			} else {
				//buscar version con la que se creó el unifilar. 
				//this.version crear en licenciasd de trbajo
				var VersionFilter = new sap.ui.model.Filter({
					path: "NumVersion",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: this.Version
				});
				aFilters.push(VersionFilter);
			}

			aFilters.push(centerFilter);
			aFilters.push(ETFilter);
			aFilters.push(TipoFilter);
			aFilters.push(IdFilter);

			var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
			oModelOperaciones.read("/LTUnifilaresFileSet", {
				filters: aFilters,
				success: fnSuccess,
				error: fnError
			})

		},

		loadUnifilarData: function (fnSuccess, fnError) {
			var aFilters = [];
			var centerFilter = new sap.ui.model.Filter({
				path: "Centro", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oDataFilterForMapping.Centro //d
			});
			aFilters.push(centerFilter)
			var etFilter = new sap.ui.model.Filter({
				path: "Et", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oDataFilterForMapping.Et //d
			});
			aFilters.push(etFilter)
			var IdUnifilarFilter = new sap.ui.model.Filter({
				path: "IdUnifilar", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oDataFilterForMapping.IdUnifilar //d
			});
			aFilters.push(IdUnifilarFilter)
			var NumVersionFilter = new sap.ui.model.Filter({
				path: "NumVersion", //a
				operator: sap.ui.model.FilterOperator.EQ,
				value1: this.oDataFilterForMapping.NumVersion //d
			});
			aFilters.push(NumVersionFilter);
			var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
			oModelOperaciones.read("/LTUnifilaresMapingSet", {
				filters: aFilters,
				success: fnSuccess,
				error: fnError
			})
		},

		onSuccessLoad: function (data) {
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				Ubicaciones: data.results
			}), "Ubicaciones");
			this.generateImageBackground();
		},

		onErrorLoad: function () {

		},

		onSuccess: function (data) {
			var oData = null;
			if (this.RealIdUnifilar) {
				oData = data.results.find(item => {
					return item.IdUnifilar == this.RealIdUnifilar;
				});
			} else {
				oData = data.results.shift();
			}

			if (oData) {
				this.getView().getModel("DrawingModel").setProperty("/textTitle",
					`Esquema Unifilar: ${this.getTipo(oData.TipoUnifilar)} / ${oData.Et} - ${oData.Descripcion} / ${this.getRegiones(oData.Centro)}`
				);
				this.oDataFilterForMapping = {
					Centro: oData.Centro,
					Et: oData.Et,
					IdUnifilar: oData.IdUnifilar,
					NumVersion: oData.NumVersion,
					Nombre: oData.Descripcion
				};
				var sType = oData.ArchivoUnifilar.split(".")[1];
				this.urlBase64 = "data:image/" + sType + ";base64," + oData.ImageFile;
				this.loadUnifilarData($.proxy(this.onSuccessLoad, this), $.proxy(this.onErrorLoad, this));

			} else {
				sap.m.MessageBox.alert("No se encontró imagen con los datos propuestos de la licencia", {
					title: "Alerta", // default
					onClose: function () {
						window.close();
					}, // default
					styleClass: "", // default
					actions: sap.m.MessageBox.Action.OK, // default
					emphasizedAction: sap.m.MessageBox.Action.OK, // default
					initialFocus: null, // default
					textDirection: sap.ui.core.TextDirection.Inherit // default
				});
			}
		},

		onError: function () {
			sap.m.MessageBox.alert("Error al cargar imagen", {
				title: "Alerta", // default
				onClose: function () {
					window.close();
				}, // default
				styleClass: "", // default
				actions: sap.m.MessageBox.Action.OK, // default
				emphasizedAction: sap.m.MessageBox.Action.OK, // default
				initialFocus: null, // default
				textDirection: sap.ui.core.TextDirection.Inherit // default
			});
		},

		getMarker: function (id) {
			if (id === "rayo") {
				return "Alto Voltaje"
			}
		},

		SaveUnifilar: function () {
			fabric.Object.prototype.toObject = (function (toObject) {
				return function (propertiesToInclude) {
					propertiesToInclude = (propertiesToInclude || []).concat(
						['data', 'id', 'created', 'idGen', 'generatedCode']
					);
					return toObject.apply(this, [propertiesToInclude]);
				};
			})(fabric.Object.prototype.toObject);

			var oThirdPartyData = this.getView().getModel("ThirdPartyEQModel").getData();

			this.getView().setBusy(true);
			var canvas = this.fabricCanvas;
			var sDoctype = canvas.toDataURL().split(",")[0];
			var sBase64 = canvas.toDataURL().split(",")[1];
			var aObjects = canvas.getObjects();
			var oPayload = {
				"Region": this.Centro,
				"Et": this.ET,
				"TipoUnifilar": this.Tipo,
				"Mapa": JSON.stringify(canvas.toJSON()),
				"Nombre": this.oDataFilterForMapping.Nombre,
				"Doctype": sDoctype,
				"NumVersion": this.oDataFilterForMapping.NumVersion,
				"Idunifilar": this.IdUnifilar,
				"Imagenunifilar": sBase64,
				"Numerolicencia": this.IdLicencia,
				"Empresa": this.Empresa,
				"Anio": this.Anio,
				"marcadores_nav": this.getAssociatedObjectMarkers(aObjects),
				"marcadoresnorel_nav": this.getNonAssociatedMarkers(aObjects),
				"areasseguras_nav": this.getSecuredAreas(aObjects),
				//TODO AGREGAR NUEVOS 4 CAMPOS
				"SecAbBt": oThirdPartyData.SeccionadorAbiertoBloqCerr,
				"IntAbLe": oThirdPartyData.InterAbiertoLocalExt,
				"SecPatCr": oThirdPartyData.SeccionadorPatCerr,
				"PatAdic": oThirdPartyData.PatAdicional,
				//Nuevo campo Ticket 556
				"RealIdUnifilar": this.RealIdUnifilar
			};
			if (!this.validPAT(oPayload)) {
				//EXT-MSUELDIA - se muestra popup con resumen de lo que se va a guardar
				// this.getView().setBusy(false);
				// this._openReviewDialog(oPayload);

				if (!oPayload.RealIdUnifilar) oPayload.RealIdUnifilar = "";

				this._reintentar = true;
				this._oPayloadReintento = oPayload;
				this._esGuardarBack = false;
				this._oModel.create("/EsquemaUnifilarMarcadorSet", oPayload, {
					success: $.proxy(this.onSuccessCreate, this),
					error: $.proxy(this.onErrorCreate, this)
				})
			} else {
				MessageBoxHelper.showAlert("Alerta", "Es necesario complentar los comentarios de Puesta a Tierra ", () => {
					this.getView().setBusy(false);
				})
			}
		},

		SaveUnifilarBack: function () {
			fabric.Object.prototype.toObject = (function (toObject) {
				return function (propertiesToInclude) {
					propertiesToInclude = (propertiesToInclude || []).concat(
						['data', 'id', 'created', 'idGen', 'generatedCode']
					);
					return toObject.apply(this, [propertiesToInclude]);
				};
			})(fabric.Object.prototype.toObject);

			var oThirdPartyData = this.getView().getModel("ThirdPartyEQModel").getData();

			this.getView().setBusy(true);
			var canvas = this.fabricCanvas;
			var sDoctype = canvas.toDataURL().split(",")[0];
			var sBase64 = canvas.toDataURL().split(",")[1];
			var aObjects = canvas.getObjects();
			var oPayload = {
				"Region": this.Centro,
				"Et": this.ET,
				"TipoUnifilar": this.Tipo,
				"Mapa": JSON.stringify(canvas.toJSON()),
				"Nombre": this.oDataFilterForMapping.Nombre,
				"Doctype": sDoctype,
				"NumVersion": this.oDataFilterForMapping.NumVersion,
				"Idunifilar": this.IdUnifilar,
				"Imagenunifilar": sBase64,
				"Numerolicencia": this.IdLicencia,
				"Empresa": this.Empresa,
				"Anio": this.Anio,
				"marcadores_nav": this.getAssociatedObjectMarkers(aObjects),
				"marcadoresnorel_nav": this.getNonAssociatedMarkersBack(aObjects), //TRNS95
				"areasseguras_nav": this.getSecuredAreas(aObjects),
				//TODO AGREGAR NUEVOS 4 CAMPOS
				"SecAbBt": oThirdPartyData.SeccionadorAbiertoBloqCerr,
				"IntAbLe": oThirdPartyData.InterAbiertoLocalExt,
				"SecPatCr": oThirdPartyData.SeccionadorPatCerr,
				"PatAdic": oThirdPartyData.PatAdicional,
				//Nuevo campo Ticket 556
				"RealIdUnifilar": this.RealIdUnifilar
			};
			if (!this.validPAT(oPayload)) {
				this._esGuardarBack = true;
				if (!oPayload.RealIdUnifilar) oPayload.RealIdUnifilar = "";
				this._oModel.create("/EsquemaUnifilarMarcadorSet", oPayload, {
					success: $.proxy(this.onSuccessCreateBack, this),
					error: $.proxy(this.onErrorCreateBack, this)
				})
			}
		},

		//INI - EXT-MSUELDIA - se muestra popup con resumen de lo que se va a guardar
		_openReviewDialog: function (oData) {
			if (!this._oReviewDialog) {
				Fragment.load({
					id: this.getView().getId(),
					name: "Transener.GestionUnifilares.view.Fragments.ReviewSave",
					controller: this
				}).then(function (oPopup) {
					this._oReviewDialog = oPopup;
					this.getView().addDependent(oPopup);
					this._oReviewDialog.setModel(new sap.ui.model.json.JSONModel(oData), "reviewSaveModel");
					this._oReviewDialog.open();
				}.bind(this));
			} else {
				this._oReviewDialog.setModel(new sap.ui.model.json.JSONModel(oData), "reviewSaveModel");
				this._oReviewDialog.open();
			}
		},

		onCloseRevieDialog: function () {
			this._oReviewDialog.close();
		},

		onConfirmSaveUnifilar: function () {
			this._oReviewDialog.close();
			this.getView().setBusy(true);
			const oPayload = this._oReviewDialog.getModel("reviewSaveModel").getData();
			this._esGuardarBack = false;
			this._oModel.create("/EsquemaUnifilarMarcadorSet", oPayload, {
				success: $.proxy(this.onSuccessCreate, this),
				error: $.proxy(this.onErrorCreate, this)
			})
		},

		formatOpcionSeleccionada: function (iOption) {
			if (iOption) {
				var sOption = iOption.toString();
				switch (sOption) {
					case "0":
						return "Interruptor abierto";
					case "1":
						return "Seccionador abierto bloqueado y trabado";
					case "2":
						return "Seccionador PAT cerrado";
					case "3":
						return "Equipos a mover (Interruptores)";
					case "4":
						return "Equipos a mover (Seccionadores)";
					case "5":
						return "Equipos a mover (Seccionadores)";
					case "6":
						return "Interruptor extraído"
					default:
						return "";
				}
			} else {
				return "";
			}
		},

		formatterTipoMarcadorNoRel: function (sTipo) {
			return sTipo === "02" ? "PUESTA A TIERRA" : "TENSIÓN";
		},
		//FIN - EXT-MSUELDIA - se muestra popup con resumen de lo que se va a guardar

		validPAT: function (oPayload) {
			var aNonRelationatedMarkers = oPayload.marcadoresnorel_nav;
			var aPAT = aNonRelationatedMarkers.filter(e => e.Tipomarcador === "02");
			var oPatWithoutComment = aPAT.find(e => e.Comentario === "");
			return !!oPatWithoutComment
		},

		formatTimes: function (oLicense) {
			if (oLicense.Timend !== null) {
				oLicense.Timend = "PT" + oLicense.Timend.getHours() + "H" + oLicense.Timend.getMinutes() + "M" + oLicense.Timend.getSeconds() +
					"S";
			} else {
				oLicense.Timend = "PT00H00M00S";
			}

			if (oLicense.Timbeg !== null) {
				oLicense.Timbeg = "PT" + oLicense.Timbeg.getHours() + "H" + oLicense.Timbeg.getMinutes() + "M" + oLicense.Timbeg.getSeconds() +
					"S";
			} else {
				oLicense.Timbeg = "PT00H00M00S";
			}

		},

		putLicense: function (data) {
			var license = data;
			var entity = "/LicenciaTrabajoSet";
			this.formatTimes(license);
			this.deleteNavProperties(license);
			if (license.Rdisparo === "Y") license.Rdisparo = "";
			if (license.Equstat === "Y") license.Equstat = "";
			oDataService.getModel("TransenerOperaciones").update(entity + "(Empresa='" + license.Empresa + "',Id='" + license.Id + "',Tipo='" +
				license.Tipo + "',Anio='" + license.Anio + "')", license, {
				success: (data) => {
					this.getView().setBusy(false);
					// MessageBoxHelper.showAlert("alerta", "Se ha editado la licencia de manera correcta", () => {
					// 	window.close();
					// })

					// sap.m.MessageBox.show(
					// 	"Se ha editado la licencia de manera correcta", {
					// 		icon: sap.m.MessageBox.Icon.INFORMATION,
					// 		title: "alerta",
					// 		actions: ["DESPLEGAR RESUMEN", sap.m.MessageBox.Action.CLOSE],
					// 		emphasizedAction: "DESPLEGAR RESUMEN",
					// 		onClose: function (oAction) { 
					// 			if(oAction === "DESPLEGAR RESUMEN"){
					// 				this._openReviewDialog(this._oPayloadReintento);	
					// 			}
					// 		}.bind(this)
					// 	}
					// );
					if (!this._esGuardarBack) {
						this._onOpenSuccessDialog("Se ha editado la licencia de manera correcta");
					}
				},
				error: () => {
					console.log("error al editar")
				}
			});
		},

		deleteNavProperties: function (oObject) {
			delete oObject.HorariosPorLicencia_nav;
			delete oObject.CoordinacionesLicencia_nav;
			delete oObject.ObservacionesLicencia_nav;
			delete oObject.TramitacionesLicencia_nav;
			delete oObject.SuspensionLicencia_nav;
			delete oObject.TransferenciaJefeTrabajo_nav;
			delete oObject.DevolucionLicencia_nav;
			delete oObject.EntregasLicencia_nav;
			delete oObject.ReanudacionLicencia_nav;
			delete oObject.AttachmentXLicencia_nav;
			delete oObject.EsquemaUnifilar_nav;
		},

		formaTimesToShow: function (iDate) {
			var dDate = new Date(iDate);
			var oNewDate = new Date(dDate.getTime() + dDate.getTimezoneOffset() * 60 * 1000);
			return oNewDate;
		},

		formatTimesFromGetLicenses: function (aLicenses) {

			aLicenses.map(function (oLicense) {

				if (oLicense.HorariosPorLicencia_nav && oLicense.HorariosPorLicencia_nav.length > 0) {
					var aLicensesDays = oLicense.HorariosPorLicencia_nav;
					aLicensesDays.map(function (oDay) {
						//why is this if here?
						//i should add the gmt on this dates, so it shows the correct date
						let gmtDifferenceMs = new Date().getTimezoneOffset() * 60 * 1000;
						if (oDay.Horafin.ms >= 0) {
							oDay.Horafin = new Date(oDay.Horafin.ms + gmtDifferenceMs);
						}

						if (oDay.Horainicio.ms >= 0) {
							oDay.Horainicio = new Date(oDay.Horainicio.ms + gmtDifferenceMs);
						}

					});
				}

				if (oLicense.Timbeg.ms >= 0) {
					oLicense.Timbeg = new Date(oLicense.Timbeg.ms);
				}

				if (oLicense.Timend.ms >= 0) {
					oLicense.Timend = new Date(oLicense.Timend.ms);
				}
			});
		},

		formatlicensedata: function (oLicense) {
			var aLicences = [];
			aLicences.push(oLicense);
			this.formatTimesFromGetLicenses(aLicences);

			oLicense.Timbeg = this.formaTimesToShow(oLicense.Timbeg);
			oLicense.Timend = this.formaTimesToShow(oLicense.Timend);
			oLicense.Solbeg = this.formatDatesGMT(oLicense.Solbeg)
			oLicense.Solend = this.formatDatesGMT(oLicense.Solend)
			if (oLicense.Rdisparo === "") oLicense.Rdisparo = "Y";
			if (oLicense.Equstat === "") oLicense.Equstat = "Y";
		},

		formatDatesGMT: function (dDate) {
			let dDateFormatted = new Date(dDate.getTime() + dDate.getTimezoneOffset() * 60 * 1000);
			let d = new Date(dDateFormatted);
			return d;
		},

		setUnifilarInfo: function (license, aUnifilar) {
			var sTextoInterruptoresAbiertosTitle = this.getDataText(aUnifilar, "Interabier");
			license.Interabier = sTextoInterruptoresAbiertosTitle;
			var sTextoSeccionadores = this.getDataText(aUnifilar, "Seleccionad");
			license.Seleccionad = sTextoSeccionadores
			var sTextoSeccionadoPatCerrado = this.getDataText(aUnifilar, "Intercerr");
			license.Intercerr = sTextoSeccionadoPatCerrado;
			var sTextoEquiposAMover = this.getDataText(aUnifilar, "Equimov");
			license.Equimov = sTextoEquiposAMover;
			var sTextoPatAdicionalesTerceros = this.getDataText(aUnifilar, "Patadic");
			license.Patadic = sTextoPatAdicionalesTerceros;
		},

		getTextoByRadioButtonSelection: function (oUnifilar, aUnifilar, type) {
			switch (type) {
				case "Interabier":
					return this.getInterAbiertos(oUnifilar, aUnifilar);
					break;
				case "Seleccionad":
					return this.getSeccionadoresAbiertos(oUnifilar, aUnifilar);
					break;
				case "Intercerr":
					return this.getSeccionadoresPATCerrados(oUnifilar, aUnifilar);
					break;
				case "Equimov":
					return this.getEquiposAMover(oUnifilar, aUnifilar);
					break;
				case "Patadic":
					return "BLANK"
					break;
			}
		},

		getDataText: function (aUnifilar, type) {
			var sTitle = ``;
			var sDinamycText = ``;
			var sTotalText = ``;
			var ThirdParty = ``;
			for (var oUnifilar of aUnifilar) {
				sTitle = `${oUnifilar.Et}:`
				var nonrelationatedMarker = oUnifilar.NonRelationatedMarkers ? oUnifilar.NonRelationatedMarkers : [];
				var relationatedMarker = oUnifilar.markers ? oUnifilar.markers : [];
				var aMarkers = type === "Patadic" ? nonrelationatedMarker : relationatedMarker;
				sDinamycText = this.getTextoByRadioButtonSelection(oUnifilar, aMarkers, type);
				if (sDinamycText !== "") {
					//todo agregar third party aqUI
					if (type === "Patadic") {
						var aPatadic = aMarkers.filter(e => e.Tipomarcador === "02");
						var oPatadicTer = oUnifilar.PatAdic;
						//iterar marker y add titls
						if (oPatadicTer !== "" || aMarkers.length !== 0) {
							sTotalText = this.getPatadic(sTotalText, oUnifilar, aPatadic);
						}
					} else {
						var sTitleSSAA = oUnifilar.TipoUnifilar === "S" ? "SSAA: " : "";
						//CAMBIAR ESTO PARA SS AA SOLAMENTE
						sTotalText += sTitleSSAA + sDinamycText;
					}
				}
				console.log(sTotalText);
			}
			return sTotalText;
		},

		getTipo: function (tipo) {
			if (tipo === "P") {
				return "Potencia";
			}
			if (tipo === "S") {
				return "Servicios Auxiliares"
			}
			if (tipo === "O") {
				return "Otro"
			}
			return ""
		},

		getInterAbiertos: function (oUnifilar, aMarkers) {
			var sText = ``
			let aData = [];
			for (var oMarker of aMarkers) {
				if (oMarker.Opcionseleccionada === "00") {
					aData.push(oMarker.Clase === "RF" ? `${oMarker.Equipo} (${oMarker.Comentario})` : oMarker.Equipo)
				}

				if (oMarker.Opcionseleccionada === "06") {
					aData.push(oMarker.Clase === "RF" ? `${oMarker.Equipo} (${oMarker.Comentario})` : oMarker.Descripcion)
				}
			}
			sText = aData.join("; ");
			var sSeparator = aData.length === 0 ? "" : " / "
			if (oUnifilar.IntAbLe) {
				sText += `${sSeparator}3ros:${oUnifilar.IntAbLe}`
			}
			sText += sText === "" ? "" : "\n";
			return sText;
		},

		getSeccionadoresAbiertos: function (oUnifilar, aMarkers) {
			var sText = ``
			let aData = [];
			for (var oMarker of aMarkers) {
				if (oMarker.Opcionseleccionada === "01")
					aData.push(oMarker.Clase === "RF" ? `${oMarker.Equipo} (${oMarker.Comentario})` : oMarker.Equipo)
			}
			sText = aData.join("; ");
			var sSeparator = aData.length === 0 ? "" : " / "
			if (oUnifilar.SecAbBt) {
				sText += `${sSeparator}3ros:${oUnifilar.SecAbBt}`
			}
			sText += sText === "" ? "" : "\n";
			return sText;
		},

		getSeccionadoresPATCerrados: function (oUnifilar, aMarkers) {
			var sText = ``
			let aData = [];
			for (var oMarker of aMarkers) {
				if (oMarker.Opcionseleccionada === "02")
					aData.push(oMarker.Equipo)
			}
			sText = aData.join("; ");
			var sSeparator = aData.length === 0 ? "" : " / "
			if (oUnifilar.SecPatCr) {
				sText += `${sSeparator}3ros:${oUnifilar.SecPatCr}`
			}
			sText += sText === "" ? "" : "\n";
			return sText;
		},

		getEquiposAMover: function (oUnifilar, aMarkers) {
			var sText = ``
			let aData = [];
			for (var oMarker of aMarkers) {
				if (oMarker.Opcionseleccionada === "03" || oMarker.Opcionseleccionada === "04" || oMarker.Opcionseleccionada === "05")
					aData.push(oMarker.Clase === "RF" ? `${oMarker.Equipo} (${oMarker.Comentario})` : oMarker.Equipo)
			}
			sText += aData.length === 0 ? "" : aData.join("; ") + "\n";
			return sText;
		},

		getPatadic: function (sTotalText, oUnifilar, aMarkers) {
			sTotalText += oUnifilar.TipoUnifilar === "S" ? `${oUnifilar.Et} SSAA: ` : `${oUnifilar.Et}: `;
			let aPatadic = [];
			for (var i = 0; i < aMarkers.length; i++) {
				aPatadic.push(aMarkers[i].Comentario);
			}
			var sText = aPatadic.join(" / ")

			sTotalText += sText
			var sSeparator = aPatadic.length === 0 ? "" : " / "
			if (oUnifilar.PatAdic) {
				sTotalText += `${sSeparator}3ros: ${oUnifilar.PatAdic}`;
			}
			sTotalText += "\n";
			return sTotalText;
		},

		updateLicence: function (aUnifilar) {
			var entity = "/LicenciaTrabajoSet";
			var key = entity + "(Empresa='" + this.Empresa + "',Id='" + this.LicenciaCreada + "',Tipo='L',Anio='" + this.Anio + "')";
			var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
			oModelOperaciones.read(key, {
				success: (data) => {
					this.formatlicensedata(data)
					this.setUnifilarInfo(data, aUnifilar);
					//antes de el put hacer tratamiento del unifilar
					this.putLicense(data)
				},
				error: (e) => {
					console.log(e)
				}
			});
		},

		getAllUnifilarDataHeaders: function (license, fnCallback, fnError, oParameter) {
			var aFilters = [
				new sap.ui.model.Filter({
					path: "Empresa",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: license.Empresa
				}),
				new sap.ui.model.Filter({
					path: "Anio",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: license.Anio
				}),
				new sap.ui.model.Filter({
					path: "Numerolicencia",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: license.Idunifilar
				})
			]
			var entity = "/EsquemaUnifilarMarcadorSet";
			oDataService.getModel("TransenerOperaciones").read(entity, {
				filters: aFilters,
				urlParameters: oParameter ? oParameter : {
					"$select": "Nombre,Idunifilar,NumVersion,Region,TipoUnifilar,Et,Empresa,Anio,Region,IntAbLe,SecAbBt,SecPatCr,PatAdic,Numerolicencia"
				},
				success: fnCallback,
				error: fnError
			});
		},

		getIndividualUnifilar: function (Anio, Empresa, Idunifilar, Numerolicencia, navigation) {
			var sNavigation = navigation ? navigation : ""
			return new Promise((resolve, reject) => {
				var entity = "/EsquemaUnifilarMarcadorSet(Idunifilar='" + Idunifilar + "',Numerolicencia='" + Numerolicencia + "',Empresa='" +
					Empresa +
					"',Anio='" + Anio + "')" + sNavigation;
				oDataService.getModel("TransenerOperaciones").read(entity, {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						console.log(e)
						reject();
					}
				});
			})
		},

		getMarkerByHeaderId: function (aData, oUnifilarHeader) {
			for (var oData of aData) {
				var sId = oData.results[0] ? oData.results[0].Idunifilar : ""
				var sNumerolicencia = oData.results[0] ? oData.results[0].Numerolicencia : ""
				if (oUnifilarHeader.Idunifilar === sId && oUnifilarHeader.Numerolicencia === sNumerolicencia) {
					oUnifilarHeader.markers = oData.results;
				}
			}
		},

		getAllMarkersFromUnifilares: function (aUnifilares) {
			return new Promise((resolve, reject) => {
				var aPromises = [];
				for (var oData of aUnifilares) {
					aPromises.push(this.getIndividualUnifilar(oData.Anio, oData.Empresa, oData.Idunifilar, oData.Numerolicencia,
						"/marcadores_nav"));
				}
				Promise.all(aPromises).then((data) => {
					for (var i = 0; i < aUnifilares.length; i++) {
						this.getMarkerByHeaderId(data, aUnifilares[i]);
					}
					resolve();
				}).catch(() => {
					reject()
				});
			})
		},

		getAllNonRelationatedMarkersFromUnifilares: function (aUnifilaresFormatted) {
			return new Promise((resolve, reject) => {
				var aPromises = [];
				for (var oData of aUnifilaresFormatted) {
					aPromises.push(this.getIndividualUnifilar(oData.Anio, oData.Empresa, oData.Idunifilar, oData.Numerolicencia,
						"/marcadoresnorel_nav"));
				}
				Promise.all(aPromises).then((data) => {
					for (var i = 0; i < aUnifilaresFormatted.length; i++) {
						this.getMarkerNonRelationatedByHeaderId(data, aUnifilaresFormatted[i]);
					}
					resolve();
				}).catch(() => {
					reject();
				});
			})
		},

		getMarkerNonRelationatedByHeaderId: function (aData, oUnifilarHeader) {
			for (var oData of aData) {
				var sId = oData.results[0] ? oData.results[0].Idunifilar : ""
				var sNumerolicencia = oData.results[0] ? oData.results[0].Numerolicencia : ""
				if (oUnifilarHeader.Idunifilar === sId && oUnifilarHeader.Numerolicencia === sNumerolicencia) {
					oUnifilarHeader.NonRelationatedMarkers = oData.results;
				}
			}
		},

		getInternalData: async function (aUnifilaresHeaders) {
			var aUnifilaresFormatted = $.extend([], true, aUnifilaresHeaders)

			var a = await this.getAllMarkersFromUnifilares(aUnifilaresFormatted)
			var b = await this.getAllNonRelationatedMarkersFromUnifilares(aUnifilaresFormatted);

			return aUnifilaresFormatted;
		},

		onSuccessCreate: function (oUnifilar) {
			var sMessage = this.Mode === "C" ? "Unifilar creado correctamente" : "Unifilar editado correctamente"

			if (this.LicenciaCreada) {
				var license = {
					Empresa: this.Empresa,
					Anio: this.Anio,
					Idunifilar: this.IdLicencia
				}
				this.getAllUnifilarDataHeaders(license, (data) => {
					var aUnifilaresHeaders = data.results
					this.getInternalData(aUnifilaresHeaders).then((aUnifilaresHeadersFormatted) => {
						this.updateLicence(aUnifilaresHeadersFormatted);
					}).catch(() => {
						this.getView().setBusy(false);
						MessageBoxHelper.showAlert("alerta", "Error al buscar unifilares", () => {
							window.close();
						})
					})
				}, () => {
					this.getView().setBusy(false);
					MessageBoxHelper.showAlert("alerta", "Error al buscar unifilares", () => {
						window.close();
					})
				})

			} else {
				this.getView().setBusy(false);
				// MessageBoxHelper.showAlert("alerta", sMessage, () => {
				// 	window.close();
				// })

				// sap.m.MessageBox.show(
				// 	sMessage, {
				// 		icon: sap.m.MessageBox.Icon.INFORMATION,
				// 		title: "alerta",
				// 		actions: ["DESPLEGAR RESUMEN", sap.m.MessageBox.Action.CLOSE],
				// 		emphasizedAction: "DESPLEGAR RESUMEN",
				// 		onClose: function (oAction) { 
				// 			if(oAction === "DESPLEGAR RESUMEN"){
				// 				this._openReviewDialog(this._oPayloadReintento);	
				// 			}
				// 		}.bind(this)
				// 	}
				// );
				this._onOpenSuccessDialog(sMessage);
			}
		},

		onSuccessCreateBack: function (oUnifilar) {
			if (this.LicenciaCreada) {
				var license = {
					Empresa: this.Empresa,
					Anio: this.Anio,
					Idunifilar: this.IdLicencia
				}
				this.getAllUnifilarDataHeaders(license, (data) => {
					var aUnifilaresHeaders = data.results
					this.getInternalData(aUnifilaresHeaders).then((aUnifilaresHeadersFormatted) => {
						this.updateLicence(aUnifilaresHeadersFormatted);
					}).catch(() => {
						this.getView().setBusy(false);
					})
				}, () => {
					this.getView().setBusy(false);
				})

			} else {
				this.getView().setBusy(false);
			}
		},

		_onOpenSuccessDialog: function (sMesage) {
			if (this._oSuccessDialog) {
				this._oSuccessDialog.close();
			}
			var oSuccessDialog = new sap.m.Dialog({
				title: "alerta",
				state: "Information",
				content: [
					new sap.m.VBox({
						items: [
							new sap.m.Text({
								text: sMesage
							}),
						]
					}).addStyleClass("sapUiSmallMargin"),
					new sap.m.OverflowToolbar({
						height: "5px",
						content: []
					}),
					new sap.m.OverflowToolbar({
						content: [
							new sap.m.Button({
								// text: "Desplegar Resumen", // visualizar solo icono
								icon: "sap-icon://question-mark",
								iconFirst: false,
								type: "Emphasized",
								press: function () {
									this._openReviewDialog(this._oPayloadReintento);
									//no se cierra mensaje de exito
									// this._oSuccessDialog.close();
								}.bind(this)
							}).addStyleClass("btnResumen"),
							new sap.m.ToolbarSpacer(),
							new sap.m.Button({
								text: "OK",
								press: [this._closeSuccessDialog, this]
							})
						]
					})
				]
			});
			this.getView().addDependent(oSuccessDialog);
			this._oSuccessDialog = oSuccessDialog;
			oSuccessDialog.open();
		},

		_closeSuccessDialog: function () {
			this._oSuccessDialog.close();
			this.getOwnerComponent().getRouter().navTo("UnifilarCreado");
		},



		onErrorCreate: function (error) {
			if (this._reintentar && this._oPayloadReintento) {
				this._reintentar = false;
				this._oModel.create("/EsquemaUnifilarMarcadorSet", this._oPayloadReintento, {
					success: $.proxy(this.onSuccessCreate, this),
					error: function () {
						this.getView().setBusy(false);
						MessageToast.show("Error al guardar unifilar");
					}.bind(this)
				})
			} else {
				this.getView().setBusy(false);
				MessageToast.show("Error al guardar unifilar");
			}

		},

		onErrorCreateBack: function (error) {
			this.getView().setBusy(false);
		},

		getAssociatedObjectMarkers: function (aObjects) {
			var aData = [];
			var aObjectsWithMarkers = aObjects.filter(function (e) {
				return e.id === "MARCADOR"
			});
			for (var i = 0; i < aObjectsWithMarkers.length; i++) {
				var oObject = aObjectsWithMarkers[i];
				var sUT = oObject.data.UT;
				var oModel = this.getView().getModel(sUT + "_JsonModel");
				if (oModel) {
					var oModelData = oModel.getData();
					var fixedCX = oModelData.CX;
					var fixedCY = oModelData.CY;
					aData.push({
						"Idunifilar": this.IdUnifilar,
						"Numerolicencia": this.IdLicencia,
						"Empresa": this.Empresa,
						"Anio": this.Anio,
						"Equipo": sUT,
						"Opcionseleccionada": oModelData.SelectedIndex.toString(),
						"Comentario": oModelData.Comments,
						"Clase": oModelData.Clase,
						"Descripcion": oModelData.SelectedIndex.toString() === '6' ? `${sUT} (Extraído)` : sUT
						///"CX": fixedCX.toFixed(3),
						///	"CY": fixedCY.toFixed(3)
					});
				}
			}
			return aData;
		},

		getNonAssociatedMarkers: function (aObjects) {
			var self = this;
			var aNonAssociated = aObjects.filter(function (e) {
				return e.id === "rayo" || e.id === "puesta-tierra-otra";
			});
			var aPayload = aNonAssociated.map(function (e, i) {
				var imarker = i + 1;
				var fixedCX = e.data ? e.data.CX : 0;
				var fixedCY = e.data ? e.data.CY : 0;
				return {
					"Idunifilar": self.IdUnifilar,
					"Numerolicencia": self.IdLicencia,
					"Tipomarcador": e.id === "rayo" ? "01" : "02",
					"Empresa": self.Empresa,
					"Anio": self.Anio,
					"Nromarcador": e.generatedCode,
					"Comentario": e.data ? e.data.comments : "",
					//	"CX": fixedCX.toFixed(3),
					//	"CY": fixedCY.toFixed(3)
				};
			});
			return aPayload;
		},

		//INI TRNS95
		getNonAssociatedMarkersBack: function (aObjects) {
			var self = this;
			var aNonAssociated = aObjects.filter(function (e) {
				return e.id === "rayo" || e.id === "puesta-tierra-otra";
			});
			if (!this.aNoRelDelete) {
				this.aNoRelDelete = [];
			}
			var aPayload = [];
			try {
				aNonAssociated.forEach((e) => {
					var fixedCX = e.data ? e.data.CX : 0;
					var fixedCY = e.data ? e.data.CY : 0;
					const oBorrado = this.aNoRelDelete.find((dele) => { return (fixedCX === dele.data.CX && fixedCY === dele.data.CY) });
					if (!oBorrado) {
						aPayload.push({
							"Idunifilar": self.IdUnifilar,
							"Numerolicencia": self.IdLicencia,
							"Tipomarcador": e.id === "rayo" ? "01" : "02",
							"Empresa": self.Empresa,
							"Anio": self.Anio,
							"Nromarcador": e.generatedCode,
							"Comentario": e.data ? e.data.comments : ""
						});
					}
				});
			} catch { }
			return aPayload;
		},
		//FIN TRNS95

		getSecuredAreas: function (aObjects) {
			var self = this;
			var aSecuredAreas = aObjects.filter(function (e) {
				return e.id === "areas-seguras";
			});
			var aPayload = aSecuredAreas.map(function (e, i) {
				var imarker = i + 1;
				var fixedCX = e.data.CX;
				var fixedCY = e.data.CY;
				return {
					"Idunifilar": self.IdUnifilar,
					"Numerolicencia": self.IdLicencia,
					"Empresa": self.Empresa,
					"Anio": self.Anio,
					"Numeroarea": imarker.toString(),
					"Comentario": e.data ? e.data.comments : "",
					"CX": fixedCX.toFixed(3),
					"CY": fixedCY.toFixed(3)
				};
			});
			return aPayload;
		},

		generateModelSelectedEquipment: function (opt, UT) {
			var oModel = this.getView().getModel(UT + "_" + "JsonModel");
			if (oModel) {
				return oModel;
			} else {
				var UT = UT;
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					UT: UT,
					SelectedIndex: -1,
					Comments: "",
					LicenseNumber: "",
					EnabledInterruptorAbierto: opt.target.data.Clase === "IN" || opt.target.data.Clase === "RF",
					EnabledEquiposAMover: opt.target.data.Clase === "IN",
					EnabledSeccionadorAbierto: opt.target.data.Clase === "SC" || opt.target.data.Clase === "RF",
					EnabledEquipoAMoverSeccionador: opt.target.data.Clase === "SC" || opt.target.data.Clase === "RF",
					EnabledSeccionadorPat: opt.target.data.Clase === "ST",
					EnabledEquipoAMoverSeccionadorPat: opt.target.data.Clase === "ST",
					Clase: opt.target.data.Clase
				});
				this.getView().setModel(oModel, UT + "_" + "JsonModel")
				return oModel;
			}

		},

		getIdByWorkType: function () {

		},

		getUrlFromIconOption: function (iOption) {

			//qas
			var url = "Transener/GestionUnifilares/img/";
			switch (iOption) {
				case "0":
				case "6":
					return sap.ui.require.toUrl(url + "rb1.svg")
				case "1":
					return sap.ui.require.toUrl(url + "rb2.svg")
				case "2":
					return sap.ui.require.toUrl(url + "rb3.svg")
				case "3":
				case "4":
				case "5":
					return sap.ui.require.toUrl(url + "rb5rb6.svg")
				default:
					return "";
			}
		},

		editMarker: function (opt, iconOption, sUT, data) {
			var aObjects = this.fabricCanvas.getObjects();
			var oObjectToEdit = aObjects.find(function (e) {
				if (e.data) {
					return e.data.UT === sUT
				}
			})
			if (oObjectToEdit) {
				//llamado de iterador con array de una pos
				this.fabricCanvas.remove(...[oObjectToEdit]);
				var self = this;
				var sUrl = this.getUrlFromIconOption(iconOption);
				fabric.loadSVGFromURL(sUrl, function (objects, options) {
					var svgData = fabric.util.groupSVGElements(objects, options);
					svgData.top = parseFloat(opt.target.data.YIniPorc) * self.imgHeight
					svgData.left = parseFloat(opt.target.data.XIniPorc) * self.imgWidth;
					svgData.scaleToWidth(25);
					svgData.scaleToHeight(25);
					svgData.id = 'MARCADOR';
					svgData.data = data;
					//momentaneo pa invisii
					svgData.stroke = "none"
					svgData.opacity = "0"
					svgData.lockMovementX = true;
					svgData.selectable = true;
					svgData.lockMovementY = true;
					svgData.lockRotation = true;
					svgData.lockScalingFlip = true;
					svgData.lockScalingX = true;
					svgData.lockScalingY = true;
					svgData.lockSkewingX = true;
					self.getBackgroundMarkerColor(svgData.data);
					self.fabricCanvas.add(svgData);
					self.fabricCanvas.renderAll();
				});
			}

		},

		getRegiones: function (value) {
			if (value === '103' || value === '113') {
				return 'Norte'
			} else if (value === '102') {
				return 'Reg. Metropolitana'
			} else if (value === '104' || value === '114') {
				return 'Sur'
			}
		},

		getImagePath: function (sValue) {
			console.log("Imagen", sValue)
			if (sValue) {
				return sap.ui.require.toUrl("Transener/GestionUnifilares/img/") + sValue;
			}
			return sap.ui.require.toUrl("Transener/GestionUnifilares/img/default.png");
		},

		getRGBByRadioSelection: function (iOption) {
			var sOption = iOption.toString();
			switch (sOption) {
				case "0":
				case "6":
					return "rgb(166, 62, 240,0.7)";
				case "1":
					return "rgb(255, 0, 0, 0.7)"
				case "2":
					return "rgb(255, 210, 0, 0.7)"
				case "3":
				case "4":
				case "5":
					return "rgb(0, 176, 80, 0.7)"
				default:
					return "transparent";
			}
		},

		findBoundingBox: function (sId) {
			var aObjects = this.fabricCanvas.getObjects();

			var oMovingBox = aObjects.find(function (e) {
				var splittedId = e.id.split("---")[1];
				return splittedId === sId;
			})
			if (oMovingBox) {
				return oMovingBox;
			}
			return {};

		},

		findBanckgroundTransparentMarker: function (sId) {
			var aObjects = this.fabricCanvas.getObjects();

			var oBackground = aObjects.find(function (e) {
				var splittedId = e.id.split("----")[1];
				return splittedId === sId;
			})
			if (oBackground) {
				return oBackground;
			}
			return {};
		},

		getBackgroundMarkerColor: function (data) {
			var background = this.findBanckgroundTransparentMarker(data.UT)
			if (background) {
				var sRGB = this.getRGBByRadioSelection(data.SelectedIndex);
				//TODO METODO PARA OBTENER el RGB en base a la opcion seleccionada
				//verificar si esto es valido para la edicion tmb
				//tmb generar metodo para que cuando se haga el eliminado se limpie la zona transparente con un set de vacio ""
				background.set("fill", sRGB);
			}
		},

		createMarker: function (opt, iconOption, data) {
			var self = this;
			var sUrl = this.getUrlFromIconOption(iconOption);
			fabric.loadSVGFromURL(sUrl, function (objects, options) {
				var svgData = fabric.util.groupSVGElements(objects, options);
				svgData.top = parseFloat(opt.target.data.YIniPorc) * self.imgHeight
				svgData.left = parseFloat(opt.target.data.XIniPorc) * self.imgWidth;
				svgData.scaleToWidth(25);
				svgData.scaleToHeight(25);
				svgData.id = 'MARCADOR';
				svgData.data = data;
				//momentaneo pa invisii
				svgData.stroke = "none"
				svgData.opacity = "0"
				svgData.lockMovementX = true;
				svgData.selectable = true;
				svgData.lockMovementY = true;
				svgData.lockRotation = true;
				svgData.lockScalingFlip = true;
				svgData.lockScalingX = true;
				svgData.lockScalingY = true;
				svgData.lockSkewingX = true;
				self.fabricCanvas.add(svgData);
				self.getBackgroundMarkerColor(data);
				self.fabricCanvas.renderAll();
			});
		},

		checkAndOpenNonAssociatedCamps: function (evt) {
			var self = this;
			this.evt = evt;
			//si no es drawer
			if (this.evt.target && this.evt.target.type && this.evt.target.type === "group") {
				var oModelNonAsociatedCamps = new sap.ui.model.json.JSONModel();
				//verificar en un futuro si es left y top o 
				oModelNonAsociatedCamps.setData({
					CX: evt.target.left,
					CY: evt.target.top,
					comments: evt.target.data ? evt.target.data.comments : "",
					commentRequired: evt.target.id === "puesta-tierra-otra",
					blockedtension: evt.target.id !== "rayo"
				});
				var oDialog = new sap.m.Dialog({
					contentWidth: "500px",
					title: "Especificar Punto de Conexión de PaT",
					beforeOpen: function (e) {
						//	console.log(e);
					},
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Guardar",
						press: function (oEvent) {
							var oModelData = oEvent.getSource().getParent().getModel("ModelNonAssociatedCamps").getData()
							this.evt.target.data = oModelData;
							//TESS
							//TEST
							if (this.evt.target.data.commentRequired) {
								if (this.evt.target.data.comments !== "") {
									oEvent.getSource().getParent().close();
								}
							} else {
								oEvent.getSource().getParent().close();
							}
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cerrar",
						press: function (oEvent) {
							oEvent.getSource().getParent().close()
						}.bind(this)
					}),
					content: [
						new sap.m.TextArea({
							enabled: "{ModelNonAssociatedCamps>/blockedtension}",
							width: "95%",
							value: "{ModelNonAssociatedCamps>/comments}"
						}).addStyleClass("sapUiTinyMarginBeginEnd")
					]
				})
				oDialog.setModel(oModelNonAsociatedCamps, "ModelNonAssociatedCamps")
				if (evt.target.id !== "rayo") {
					oDialog.open();
				}

			}

		},

		showMessageToast: function () {
			sap.m.MessageToast.show("Marcador Encontrado", {
				duration: 3000, // default
				width: "15em", // default
				my: "center bottom", // default
				at: "center bottom", // default
				of: window, // default
				offset: "0 0", // default
				collision: "fit fit", // default
				onClose: null, // default
				autoClose: true, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});
		},

		getGeneratedCodeNonAssociated: function () {
			var sIdUnifilar = new Date().valueOf().toString(36) + Math.random().toString(36).substr(2);
			var s = sIdUnifilar.substr(1, 18)
			return s;
		},

		addTierraAdicionalIcon: function () {
			this._isDrawing = false;
			this.fabricCanvas.isDrawingMode = this._isDrawing;
			var self = this;
			//dev
			//var image = "/webapp/img/teirra_adicional.svg";
			//qas
			var image = sap.ui.require.toUrl("Transener/GestionUnifilares/img/teirra_adicional.svg");
			fabric.loadSVGFromURL(image, function (objects, options) {
				var svgData = fabric.util.groupSVGElements(objects, options);
				svgData.top = 30;
				svgData.left = self.imgWidth - 300;
				svgData.id = 'puesta-tierra-otra';
				svgData.generatedCode = self.getGeneratedCodeNonAssociated();
				self.fabricCanvas.add(svgData);
			});
		},

		addTensionIcon: function (evt) {
			this._isDrawing = false;
			this.fabricCanvas.isDrawingMode = this._isDrawing;
			var self = this;
			//dev
			//var image = "/webapp/img/tension.svg";
			//qas
			var image = sap.ui.require.toUrl("Transener/GestionUnifilares/img/tension.svg")
			fabric.loadSVGFromURL(image, function (objects, options) {
				var svgData = fabric.util.groupSVGElements(objects, options);
				svgData.top = 30;
				svgData.left = self.imgWidth - 350;
				svgData.id = 'rayo';
				svgData.generatedCode = self.getGeneratedCodeNonAssociated();
				self.fabricCanvas.add(svgData);
			});
		},

		onClickDrawIcon: function () {
			//rayos y centellas
			this.drawIcon = !this.drawIcon;
			this.drawIcon1 = false;
			this.drawIcon2 = false;
		},

		onClickDrawIcon1: function () {
			this.drawIcon1 = !this.drawIcon1;
			this.drawIcon = false;
			this.drawIcon2 = false;
		},

		onClickDrawIcon2: function () {
			this.drawIcon2 = !this.drawIcon2;
			this.drawIcon = false;
			this.drawIcon1 = false;
		},

		removeRelationatedMarker: function (oData) {
			return new Promise((resolve, reject) => {
				var oMarkerToDelete = "/MarcadoresSet(Equipo='" + oData.UT +
					"',Numerolicencia='" + this.IdLicencia + "',Clase='" + oData.Clase +
					"',Idunifilar='" + this.IdUnifilar +
					"',Empresa='" +
					this.Empresa +
					"',Anio='" + this.Anio + "')"
				var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
				oModelOperaciones.remove(oMarkerToDelete, {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						reject(e)
					}
				});
			})
		},

		removeNonRelationatedMarker: function (oData) {
			return new Promise((resolve, reject) => {
				var oMarkerToDelete = "/MarcadoresNoAsociadosSet(Numerolicencia='" + this.IdLicencia + "',Nromarcador='" + oData.generatedCode +
					"',Idunifilar='" + this.IdUnifilar +
					"',Empresa='" +
					this.Empresa +
					"',Anio='" + this.Anio + "')"
				var oModelOperaciones = oDataService.getModel("TransenerOperaciones");
				oModelOperaciones.remove(oMarkerToDelete, {
					success: function (data) {
						resolve(data)
					},
					error: function (e) {
						reject(e)
					}
				});
			})
		},

		DeleteMarker: function () {
			var multipleObjectsSelected = this.fabricCanvas.getActiveObjects();
			var oObject = this.fabricCanvas.getActiveObject();
			if (multipleObjectsSelected.length > 1) {
				sap.m.MessageToast.show("No se pueden eliminar multiples marcadores selecccionados", {
					duration: 3000, // default
					width: "15em", // default
					my: "center bottom", // default
					at: "center bottom", // default
					of: window, // default
					offset: "0 0", // default
					collision: "fit fit", // default
					onClose: null, // default
					autoClose: true, // default
					animationTimingFunction: "ease", // default
					animationDuration: 1000, // default
					closeOnBrowserNavigation: true // default
				});
				return
			}
			if (oObject.idGen && oObject.idGen === "TransparentBack") {
				return;
			}
			if (oObject.data && oObject.id === "MARCADOR") {
				if (this.Mode !== "C") {
					this.removeRelationatedMarker(oObject.data).then(() => {
						var oBoundingBox = this.findBanckgroundTransparentMarker(oObject.data.UT)
						if (oBoundingBox) {
							oBoundingBox.set("fill", "transparent");
						}
						var UT = oObject.data.UT;
						var sModel = UT + "_JsonModel";
						delete this.getView().oModels[sModel]

						//se agrega guardado automatico
						this.SaveUnifilarBack()

						this.fabricCanvas.remove(this.fabricCanvas.getActiveObject());
					}).catch((e) => {
						console.log(e)
					})
				} else {
					var oBoundingBox = this.findBanckgroundTransparentMarker(oObject.data.UT)
					if (oBoundingBox) {
						oBoundingBox.set("fill", "transparent");
					}
					var UT = oObject.data.UT;
					var sModel = UT + "_JsonModel";
					delete this.getView().oModels[sModel]
					this.fabricCanvas.remove(this.fabricCanvas.getActiveObject());
				}
			} else {
				if (this.Mode !== "C") {
					this.removeNonRelationatedMarker(oObject).then(() => {
						this.aNoRelDelete.push({ ...oObject }); //TRNS95 

						//se agrega guardado automatico
						this.SaveUnifilarBack()

						this.fabricCanvas.remove(this.fabricCanvas.getActiveObject());
					}).catch((e) => {
						console.log(e)
					})
				} else {
					this.fabricCanvas.remove(this.fabricCanvas.getActiveObject());
				}
			}

		},

		removeMarker: function (evt) {
			var id = evt.getSource().getId();
			var elem = document.getElementById(id);
			elem.parentNode.removeChild(elem);
		},

		checkIfFoundEquipment: function (x, y) {
			var percentages = {
				x: x / this.imgWidth,
				y: y / this.imgHeight
			};

			var equipoEncontrado = this.getView().getModel("Ubicaciones").getProperty("/Ubicaciones")
				.find(function (ubicacion) {
					return ubicacion.XIniPorc < percentages.x && ubicacion.XFinPorc > percentages.x &&
						ubicacion.YIniPorc < percentages.y && ubicacion.YFinPorc > percentages.y;
				});

			var bFound = equipoEncontrado ? true : false;
			return {
				equipoEncontrado: equipoEncontrado,
				bFound: bFound
			}

		},

		checkCoordinates: function (x, y) {
			var percentages = {
				x: x / this.imgWidth,
				y: y / this.imgHeight
			};

			var equipoEncontrado = this.getView().getModel("Ubicaciones").getProperty("/Ubicaciones")
				.find(function (ubicacion) {
					return ubicacion.XIniPorc < percentages.x && ubicacion.XFinPorc > percentages.x &&
						ubicacion.YIniPorc < percentages.y && ubicacion.YFinPorc > percentages.y;
				});

			if (equipoEncontrado) {
				//TODO demian arreglar
				this.getView().getModel("DrawingModel").setProperty("/UT", equipoEncontrado.Ut + " --- " + equipoEncontrado.DescripcionUt)
			} else {
				this.getView().getModel("DrawingModel").setProperty("/UT", "")
			}
		}

	});
});