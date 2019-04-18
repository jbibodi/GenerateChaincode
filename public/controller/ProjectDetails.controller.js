/*eslint-disable no-console, no-alert */
/* eslint-disable sap-no-ui5base-prop */
function openErrorDialog(title,message) {
	var dialog = new sap.m.Dialog({
		title: title,
		type: 'Message',
		state: 'Error',
		content: new sap.m.Text({
			text: message
		}),
		beginButton: new sap.m.Button({
			text: 'OK',
			press: function () {
				dialog.close();
			}
		}),
		afterClose: function () {
			dialog.destroy();
		}
	});
	dialog.open();
}

sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";
	
	return BaseController.extend("com.sap.build.standard.generateChaincode.controller.ProjectDetails", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5c9111ce50fb23010b6ff30f";

			var oParams = {};
			
			this.getView().byId("breadcrumbsId").setCurrentLocationText("Project Info");
			this.getView().byId("iconToolBarId").setSelectedKey("projectInfoTab");
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

			var sObjectId = oEvent.getParameter("data").row;
			var a = JSON.parse(atob(sObjectId));
			var model = new sap.ui.model.json.JSONModel();

			if(!a.addClick){	
				model.setData({ 
					arrayName: a
				});
				this.getView().byId("saveProjectInfoButtonId").setVisible(false);
				this.getView().byId("saveProjectInfoButtonId").setEnabled(false);
				this.getView().byId("cancelProjectInfoId").setVisible(false);
				this.getView().byId("cancelProjectInfoId").setEnabled(false);
				this.getView().byId("projectNameId").setEnabled(false);
				this.getView().byId("projectDescriptionId").setEnabled(false);
				console.log(model);
			}
			else{
				model.setData(null);
				this.getView().byId("saveProjectInfoButtonId").setVisible(true);
				this.getView().byId("saveProjectInfoButtonId").setEnabled(true);
				this.getView().byId("cancelProjectInfoId").setVisible(true);
				this.getView().byId("cancelProjectInfoId").setEnabled(true);
				this.getView().byId("projectNameId").setEnabled(true);
				this.getView().byId("projectNameId").setValue("");
				this.getView().byId("projectDescriptionId").setEnabled(true);
				this.getView().byId("projectDescriptionId").setValue("");
			}
			this.getView().setModel(model, "modelPath");
		},
		_onLinkPress: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ListOfProjects", true);
		},
		_onButtonPress: function () {
			var a = new sap.m.BusyDialog()
			a.open();
			var projectName = this.getView().byId("projectNameId").getValue();
			var projectDescription = this.getView().byId("projectDescriptionId").getValue();

			if (projectName.length !== 0 && projectDescription.length !== 0) {
				var data = {
					"projectName":projectName,
					"projectDescription":projectDescription
				};

				var xhr = new XMLHttpRequest();
				xhr.addEventListener("readystatechange", function () {
					
					if (this.status == 200) {
						sap.m.MessageToast.show(this.responseText);
						a.close();
					} 
					else if(this.status == 400) {
						sap.m.MessageToast.show(this.responseText);
						a.close();
					}
				});

				//setting request method
				xhr.open("POST", "./createProject");
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("Accept", "application/json; charset=utf-8");
				xhr.send(JSON.stringify(data));
			} else {
				openErrorDialog('Empty details found!','Please enter all the details!');
			}
		},
		_onButtonPress1: function () {
			return new Promise(function (fnResolve) {
				var aChangedEntitiesPath, oChangedBindingContext;
				var oModel = this.oModel;
				if (oModel && oModel.hasPendingChanges()) {
					aChangedEntitiesPath = Object.keys(oModel.mChangedEntities);

					for (var j = 0; j < aChangedEntitiesPath.length; j++) {
						oChangedBindingContext = oModel.getContext("/" + aChangedEntitiesPath[j]);
						if (oChangedBindingContext && oChangedBindingContext.bCreated) {
							oModel.deleteCreatedEntry(oChangedBindingContext);
						}
					}
					oModel.resetChanges();
				}
				fnResolve();
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onOverflowToolbarButtonPress: function (oEvent) {

			//var oBindingContext = oEvent.getSource().getBindingContext();
			var x = JSON.stringify({
				newEntity:true
			});
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("EntityAndAttributeInfo", {
				row: btoa(x)
			});
			/*return new Promise(function (fnResolve) {

				this.doNavigate("EntityAndAttributeInfo", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});*/

		},
		_onRowPress: function (oEvent) {
			var oTable = oEvent.getSource().getBindingContext("modelPath");
			var Row = oTable.oModel.getProperty(oTable.sPath);
			Row["newEntity"] = false;
			Row = JSON.stringify(Row);
			console.log(btoa(Row));
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("EntityAndAttributeInfo", {
				row: btoa(Row)
			});

			//var oBindingContext = oEvent.getSource().getBindingContext();

			/*return new Promise(function (fnResolve) {

				this.doNavigate("EntityAndAttributeInfo", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});*/

		},
		_onButtonPress2: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			/*return new Promise(function (fnResolve) {

				this.doNavigate("FunctionInfo", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});*/

		},
		_onButtonPress3: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			/*return new Promise(function (fnResolve) {

				this.doNavigate("GenerateCc", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});*/

		},
		_onButtonPress4: function () {
			var oView = this.getView();
			var oController = this;

			return new Promise(function (fnResolve, fnReject) {
				var oModel = oController.oModel;

				var fnResetChangesAndReject = function (sMessage) {
					oModel.resetChanges();
					fnReject(new Error(sMessage));
				};
				if (oModel && oModel.hasPendingChanges()) {
					oModel.submitChanges({
						success: function (oResponse) {
							var oBatchResponse = oResponse.__batchResponses[0];
							var oChangeResponse = oBatchResponse.__changeResponses && oBatchResponse.__changeResponses[0];
							if (oChangeResponse && oChangeResponse.data) {
								var sNewContext = oModel.getKey(oChangeResponse.data);
								oView.unbindObject();
								oView.bindObject({
									path: "/" + sNewContext
								});
								if (window.history && window.history.replaceState) {
									window.history.replaceState(undefined, undefined, window.location.hash.replace(encodeURIComponent(oController.sContext),
										encodeURIComponent(sNewContext)));
								}
								oModel.refresh();
								fnResolve();
							} else if (oChangeResponse && oChangeResponse.response) {
								fnResetChangesAndReject(oChangeResponse.message);
							} else if (!oChangeResponse && oBatchResponse.response) {
								fnResetChangesAndReject(oBatchResponse.message);
							} else {
								oModel.refresh();
								fnResolve();
							}
						},
						error: function (oError) {
							fnReject(new Error(oError.message));
						}
					});
				} else {
					fnResolve();
				}
			}).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		onInit: function () {
			//sap.ui.getCore().getEventBus().subscribe("app", "PODataLoaded", this.onHandle, this);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("ProjectDetails").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		}/*,
		onHandle: function(channelId,eventId,data){
			console.log("Inside onHandle")
			console.log(data);
		}*/,
		onSelectChanged: function(oEvent) {
			var key =oEvent.getParameters().key;
			var curr = this.getView().byId("breadcrumbsId");
			if(key=="projectInfoTab") {
              curr.setCurrentLocationText("Project Info");
            }
            else if(key == "entityInfoTab") 
            {
				curr.setCurrentLocationText("Entity Info");
            };
        }
	});
}, /* bExport= */ true);