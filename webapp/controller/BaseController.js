/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("dma.zcockpit.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		onValueHelpGenericCancelPress: function (oEvt) {
			oEvt.oSource.close();
		},
		onValueHelpGenericAfterClose: function (oEvt) {
			oEvt.oSource.destroy();
        },
		_createFilterForSelectionSet: function (aSelectionSet) {
			let aFilters = [];
			for (let itemFilter of aSelectionSet) {

				if (itemFilter.getValue && itemFilter.getValue().length > 0) {
					aFilters.push(new sap.ui.model.Filter({
						path: itemFilter.mProperties.name,
						operator: sap.ui.model.FilterOperator.Contains,
						value1: itemFilter.getValue().toUpperCase()
					}));
				}

			}
			return aFilters;
		},        
		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		getText: function(sText){
			return this.getResourceBundle().getText(sText);
		},
		getTextWithParams: function(sText, aParams){
			return this.getResourceBundle().getText(sText,aParams);
		},
		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		}

	});

});