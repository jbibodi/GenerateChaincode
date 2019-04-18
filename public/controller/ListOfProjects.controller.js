sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.generateChaincode.controller.ListOfProjects", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5c9111ce50fb23010b6ff30f";
			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}
		},
		_onOverflowToolbarButtonPress: function (oEvent) {
			var x = JSON.stringify({
				addClick: true
			});

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ProjectDetails", {
				row: btoa(x)
			});
		},
		_onOverflowToolbarButtonPress1: function (oEvent) {

			var oSource = oEvent.getSource();
			var oSourceBindingContext = oSource.getBindingContext();

			return new Promise(function (fnResolve, fnReject) {
				if (oSourceBindingContext) {
					var oModel = oSourceBindingContext.getModel();
					oModel.remove(oSourceBindingContext.getPath(), {
						success: function () {
							oModel.refresh();
							fnResolve();
						},
						error: function () {
							oModel.refresh();
							fnReject(new Error("remove failed"));
						}
					});
				}
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onRowPress: function (oEvent) {
			var oTable = oEvent.getSource().getBindingContext("modelPath");
			var Row = oTable.oModel.getProperty(oTable.sPath);
			Row["addClick"] = false;
			Row = JSON.stringify(Row);
			console.log(btoa(Row));
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ProjectDetails", {
				row: btoa(Row)
			});
		},
		onInit: function () {
			console.log("Inside init")
			var a = new sap.m.BusyDialog()
			a.open()

			var self = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ListOfProjects").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var xhr = new XMLHttpRequest();
			xhr.addEventListener("readystatechange", function () {
				if (this.status == 200) {
					var x = JSON.parse(this.responseText);

					if (x.length == 0) {
						sap.m.MessageToast.show("No projects found");
					}
					else {
						sap.m.MessageToast.show("Results fetched successfully!");
					}

					var model = new sap.ui.model.json.JSONModel();
					model.setData({
						arrayName: x
					});
					/*sap.ui.getCore().getEventBus().publish("app", "PODataLoaded", {
						payload: x
					});*/

					self.getView().setModel(model, "modelPath");
					a.close();
				}
				else if (this.status == 400) {
					sap.m.MessageToast.show(this.responseText);
					a.close();
				}

			});

			//setting request method
			var getUrl = "./getListOfAllProjects";
			xhr.open("GET", getUrl, true);
			xhr.send();
		}
	});
}, /* bExport= */ true);