sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function (BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.generateChaincode.controller.EntityAndAttributeInfo", {
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

			var sObjectId = oEvent.getParameter("data").row;
			var a = JSON.parse(atob(sObjectId));
			var curr = this.getView().byId("entityAndAttributeBreadcrumbsId");
			var model = new sap.ui.model.json.JSONModel();

			if(!a.newEntity){
				curr.setCurrentLocationText(a.entityName);
				model.setData({ 
					arrayName: a
				});
			}
			else {
				curr.setCurrentLocationText("New Entity");
				model.setData(null);
			}
			this.getView().setModel(model, "modelPath");
		},
		_onLinkPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("ListOfProjects", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onLinkPress1: function () {
			/*var x = JSON.stringify({
				newEntity:true
			});
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ProjectDetails", {
				row: btoa(x)
			});*/

			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var oQueryParams = this.getQueryParameters(window.location);

			if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("ProjectDetails", true);
			}

		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		_onOverflowToolbarButtonPress: function () {
			var itemArrForComboBox = [
				new sap.ui.core.Item({
					key: "string",
					text: "String",
					enabled: true
				}), new sap.ui.core.Item({
					key: "int",
					text: "Integer",
					enabled: true
				}), new sap.ui.core.Item({
					key:"bool",
					text:"Boolean",
					enabled:true
				})
			]
			var oItem = new sap.m.ColumnListItem({
				cells : [ new sap.m.Input({
						type:"Text",
						showValueHelp:false,
						enabled:true,
						visible:true,
						width:"auto",
						valueHelpOnly:false,
						maxLength:256
					}).addStyleClass("sapUiResponsiveMargin"), 
					new sap.m.Input({
						type:"Text",
						showValueHelp:false,
						enabled:true,
						visible:true,
						width:"auto",
						valueHelpOnly:false,
						maxLength:256
					}).addStyleClass("sapUiResponsiveMargin"), 
					new sap.m.ComboBox({
						editable:true, 
						enabled:true,
						visible:true,
						width:"auto",
						valueState:"None",
						maxWidth:"100%", 
						selectionChange:"_onComboBoxSelectionChange"
					}).addStyleClass("sapUiResponsiveMargin").addItem(itemArrForComboBox[0]).addItem(itemArrForComboBox[1]).addItem(itemArrForComboBox[2]),
					new sap.m.CheckBox({
						text : "",
						editable:true, 
						enabled:true, 
						visible:true, 
						width:"auto", 
						textDirection:"Inherit", 
						wrapping:false,
						useEntireWidth:true
					}).addStyleClass("sapUiResponsiveMargin")]
				});

			var oTable = this.getView().byId("attributesTableId");
			oTable.addItem(oItem);
		},
		_onComboBoxSelectionChange: function () {

			this.close();

		},
		_onButtonPress: function () {
			
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
		onInit: function () {
			console.log("Inside entityAndAttributes")
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("EntityAndAttributeInfo").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			this.oModel = this.getOwnerComponent().getModel();

		}
	});
}, /* bExport= */ true);