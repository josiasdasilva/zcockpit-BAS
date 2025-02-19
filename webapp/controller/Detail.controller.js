sap.ui.define([
    "dma/zcockpit/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "dma/zcockpit/model/formatter",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter"
], function (BaseController, JSONModel, formatter, History, MessageBox, Sorter, Filter) {
    "use strict";
    return BaseController.extend("dma.zcockpit.controller.Detail", {
        formatter: formatter,
        _compraTable: null,
        _vendaTable: null,
        _faceamentoTable: null,
        _pesquisaTable: null,
        _compraTableHeader: null,
        _vendaTableHeader: null,
        _faceamentoTableHeader: null,
        _pesquisaTableHeader: null,
        _segCompra: null,
        _colInput: null,
        onInit: function () {
            //var oViewModel = new JSONModel({ busy: false, delay: 0 });
            //var globalModel = this.getModel("globalModel");
            //this.setModel(oViewModel, "detailView");
            //this.getOwnerComponent().getModel().metadataLoaded().then(this.onMetadataLoaded.bind(this));

            this.getRouter().getRoute("detail").attachPatternMatched(this.onObjectMatched, this);
            this._segCompra = this.getView().byId("_segCompra");

            //FAFN - Begin
            this._compraTable = this.getView().byId('compraTable');
            this._vendaTable = this.getView().byId('vendaTable');
            this._faceamentoTable = this.getView().byId('faceamentoTable');
            this._pesquisaTable = this.getView().byId('pesquisaTable');
            this._compraTableHeader = this.getView().byId('compraTableHeader');
            this._vendaTableHeader = this.getView().byId('vendaTableHeader');
            this._faceamentoTableHeader = this.getView().byId('faceamentoTableHeader');
            this._pesquisaTableHeader = this.getView().byId('pesquisaTableHeader');

            // if (!this._oColumnFilterPopover) {
            // 	this._oColumnFilterPopover = sap.ui.xmlfragment("dma.zcockpit.view.fragment.FilterColumn", this);
            // 	this._oColumnFilterPopover.setModel(this.getView().getModel());
            // }

            this._compraTableHeader.addEventDelegate({
                onAfterRendering: () => {
                    var oHeader = this._compraTableHeader.$().find('.sapMListTblHeaderCell');
                    for (var i = 0; i < oHeader.length; i++) {
                        var oID = oHeader[i].id;
                        this.onClickColumnHeader(oID, this._compraTable);
                    }
                }
            }, this._compraTableHeader);
            this._vendaTableHeader.addEventDelegate({
                onAfterRendering: () => {
                    var oHeader = this._vendaTableHeader.$().find('.sapMListTblHeaderCell');
                    for (var i = 0; i < oHeader.length; i++) {
                        var oID = oHeader[i].id;
                        this.onClickColumnHeader(oID, this._vendaTable);
                    }
                }
            }, this._vendaTableHeader);
            this._faceamentoTableHeader.addEventDelegate({
                onAfterRendering: () => {
                    var oHeader = this._faceamentoTableHeader.$().find('.sapMListTblHeaderCell');
                    for (var i = 0; i < oHeader.length; i++) {
                        var oID = oHeader[i].id;
                        this.onClickColumnHeader(oID, this._faceamentoTable);
                    }
                }
            }, this._faceamentoTableHeader);
            this._pesquisaTableHeader.addEventDelegate({
                onAfterRendering: () => {
                    var oHeader = this._pesquisaTableHeader.$().find('.sapMListTblHeaderCell');
                    for (var i = 0; i < oHeader.length; i++) {
                        var oID = oHeader[i].id;
                        this.onClickColumnHeader(oID, this._pesquisaTable);
                    }
                }
            }, this._pesquisaTableHeader);
            //FAFN - End
            this.configTabKeyFocus(this._compraTable);
        },
        configTabKeyFocus: function (oTable) {
            oTable.addEventDelegate({
                onAfterRendering: () => {
                    let oTableID = oTable.getId();

                    $("#" + oTableID).focusout(function () {
                        for (let itemRow of oTable.getItems()) {
                            itemRow.removeStyleClass('selecetMaterial');
                        }
                    })

                    $("#" + oTableID).focusin(function (evt) {
                        // remember current focused cell
                        jQuery.sap.delayedCall(100, null, function () {
                            var oBody = $('#' + oTableID).find('tbody');
                            // find the focused input field
                            var oField = oBody.find('.sapMInputFocused')[0];
                            if (oField && !oTable._skipFocusInitialization) {
                                // store ID of focused cell
                                oTable._focusedInput = oField.id;
                                oTable._currentIndex = oTable.getItems().findIndex((item) => {
                                    return item.getCells().find((field) => {
                                        return field.getId() === oTable._focusedInput
                                    });
                                });


                                oTable._rowIndexOfInputFields = 0;
                                oTable.getItems()[oTable._currentIndex].addStyleClass('selecetMaterial');
                                for (let itemTable of oTable.getItems()) {
                                    oTable._rowIndexOfInputFields = itemTable.getCells().findIndex((field) => {
                                        return field.getId() === oTable._focusedInput;

                                    });
                                    if (oTable._rowIndexOfInputFields > 0) {
                                        break;
                                    }
                                }

                            } else {
                                oTable._skipFocusInitialization = false;
                            }
                        });
                    });

					/*					$('#' + oTableID).on('keyup', function (e) {
											oTable.getItems()[2].getCells()[16].focus()
											console.log(oTable._focusedInput);
										});*/

                    $('#' + oTableID).on('keydown', function (e) {

                        for (let itemRow of oTable.getItems()) {
                            itemRow.removeStyleClass('selecetMaterial');
                        }

                        if (e.key === 'Enter') {
                            oTable._skipFocusInitialization = true;

                            if (oTable.getItems().length === (oTable._currentIndex + 1)) {
                                oTable._currentIndex = 0;
                            } else {
                                oTable._currentIndex++;
                            }
                            let oCurrentField = oTable.getItems()[oTable._currentIndex].getCells()[oTable._rowIndexOfInputFields];
                            let currentLine = oTable.getItems()[oTable._currentIndex];
                            oCurrentField.focus();
                            //Highlight selected field
                            currentLine.addStyleClass('selecetMaterial');
                            jQuery.sap.delayedCall(100, null, function () {
                                oCurrentField.selectText(0, oCurrentField.getValue().length)
                            });

                        }

                        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            oTable._skipFocusInitialization = true;

                            if (oTable.getItems().length === (oTable._currentIndex + 1)) {
                                oTable._currentIndex = 0;
                            } else {
                                e.key === 'ArrowDown' ? oTable._currentIndex++ : oTable._currentIndex--;
                            }
                            let oCurrentField = oTable.getItems()[oTable._currentIndex].getCells()[oTable._rowIndexOfInputFields];
                            let currentLine = oTable.getItems()[oTable._currentIndex];
                            oCurrentField.focus();
                            //Highlight selected field
                            currentLine.addStyleClass('selecetMaterial');
                            jQuery.sap.delayedCall(100, null, function () {
                                oCurrentField.selectText(0, oCurrentField.getValue().length)
                            });

                        }

                    });

					/*	$('#' + oTableID).on('keyup', function (e) {
							var oSelectedField = sap.ui.getCore().byId(that._FieldID);
							var oRow = oSelectedField.getParent();
							var oCells = oRow.getCells();
							var aInputs = []; // all input fields per row
							var firstInput = 0; // first input field in row
							var lastInput = 0; // last input field in row

							// get index of first and last input fields of table row
							for (var i = 0; i < oCells.length; i++) {
								if (oCells[i]._$input) {
									aInputs.push(i);
									if (!firstInput) {
										firstInput = i;
									}
									lastInput = i;
								}
							}

							var oTargetCell, thisInput, thisRow, targetIndex;

							// on TAB press - navigate one field forward
							if (e.which == 9 && !e.shiftKey) {
								// get index of currently focused field
								thisInput = oCells.indexOf(oCells.filter(function (entry) {
									return entry.getId() === that._FieldID;
								})[0]);

								// is field last input in row?
								if (thisInput === lastInput) {
									// jump to next row
									thisRow = oRows.indexOf(oRows.filter(function (entry) {
										return entry.getId() === oRow.getId();
									})[0]);

									// is row last visible row on screen?
									if (thisRow === oTable.getRows().length - 1) {
										// last visible row - scroll one row down and keep focus
										oTable._scrollNext();
										jQuery.sap.delayedCall(100, null, function () {
											var oTargetCell = oRows[thisRow].getCells()[firstInput];
											oTargetCell.focus();
										});
									} else {
										// not last visible row - set focus in next row
										oTargetCell = oRows[thisRow + 1].getCells()[firstInput];
										oTargetCell.focus();
									}

								} else {
									// no row jump - focus next input cell in this row
									targetIndex = 0;
									for (i = 0; i < aInputs.length; i++) {
										if (aInputs[i] === thisInput) {
											// next entry is target cell
											targetIndex = aInputs[i + 1];
										}
									}
									oTargetCell = oRow.getCells()[targetIndex];
									oTargetCell.focus();
								}
							}
							// On SHIFT + TAB press - navigate one field backward
							if (e.which == 9 && e.shiftKey) {
								// get index of currently focused field
								thisInput = oCells.indexOf(oCells.filter(function (entry) {
									return entry.getId() === that._FieldID;
								})[0]);

								// is field first input in row?
								if (thisInput === firstInput) {
									// jump to previous row
									thisRow = oRows.indexOf(oRows.filter(function (entry) {
										return entry.getId() === oRow.getId();
									})[0]);

									// is row first visible row on screen?
									if (thisRow === 0) {
										// first visible row - scroll one row up and keep focus
										oTable._scrollPrevious();
										jQuery.sap.delayedCall(100, null, function () {
											var oTargetCell = oRows[thisRow].getCells()[lastInput];
											oTargetCell.focus();
										});
									} else {
										// not last visible row - set focus in previous row
										oTargetCell = oRows[thisRow - 1].getCells()[lastInput];
										oTargetCell.focus();
									}

								} else {
									// no row jump - focus previous input cell in this row
									targetIndex = 0;
									for (i = 0; i < aInputs.length; i++) {
										if (aInputs[i] === thisInput) {
											// next entry is target cell
											targetIndex = aInputs[i - 1];
										}
									}
									oTargetCell = oRow.getCells()[targetIndex];
									oTargetCell.focus();
								}
							}

						});*/
                }
            }, oTable);
        },
        onNavChangeContract: function () {
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "ZZContract",
                    action: "change"
                },
                params: {
                    "contract": this.oPopoverContact.ebeln
                }
            })) || ""; // generate the Hash to display a Supplier
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Supplier application
        },
        handleLojaPress: function (e) {
            var oData = e.getSource().getBindingContext().getModel().getProperty(e.getSource().getBindingContext().sPath)
            this.oPopoverContact = new sap.m.ResponsivePopover({
                showHeader: false,
                placement: "Top",
                content: [
                    new sap.m.HBox({
                        alignItems: 'Center',
                        fitContainer: true,
                        justifyContent: 'Center',
                        width: '14em',
                        height: '2em',
                        items: [new sap.m.Link({
                            text: this.getText('nav_to_contract') + " " + oData.Ebeln,
                            press: [this.onNavChangeContract, this]
                        })]
                    })
                ],
                footer: []
            });
            this.oPopoverContact.openBy(e.getSource());
            this.oPopoverContact.ebeln = oData.Ebeln;
        },
        previousMaterial: function (oEvt) {
            this.gravaValores(oEvt);
            this.navDetail(false);
        },
        nextMaterial: function (oEvt) {
            this.gravaValores(oEvt);
            this.navDetail(true);
        },
        navDetail: function (isForward) {
            let oModelDatapedidoNavList = this.getView().getModel('pedidoListNav').getData();
            let indexNav = isForward ? oModelDatapedidoNavList.current + 1 : oModelDatapedidoNavList.current - 1;
            let itemMaterial = this.pedidoNavList.list[indexNav - 1];

            localStorage.removeItem("pedidoNavList");
            localStorage.setItem("pedidoNavList", JSON.stringify({ ...this.pedidoNavList, current: indexNav }));

            let globalModel = this.getModel("globalModel");
            let sMatnr = itemMaterial.Matnr;
            let sMaabc = itemMaterial.Maabc;
            globalModel.setProperty("/Matnr", sMatnr);
            globalModel.setProperty("/codABC", sMaabc);

            this.getRouter().navTo("detail", {
                Ekgrp: globalModel.getProperty("/Ekgrp"),
                Lifnr: globalModel.getProperty("/Lifnr"),
                Matnr: sMatnr,
                Werks: globalModel.getProperty("/Werks")
            }, true);
        },
        onObjectMatched: function (oEvent) {
            //var oViewModel = this.getModel("detailView ");
            this.pedidoNavList = JSON.parse(localStorage.getItem("pedidoNavList"));
            if(this.pedidoNavList && this.pedidoNavList.current){
            this.getView().setModel(new JSONModel({ current: this.pedidoNavList.current, size: this.pedidoNavList.size }), "pedidoListNav");
            }

            var globalModel = this.getModel("globalModel");

            globalModel.setProperty("/colVlrCompra", this._segCompra.getProperty("selectedKey") === "real")

            var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
            var sLifnr = oEvent.getParameter("arguments").Lifnr;
            var sMatnr = oEvent.getParameter("arguments").Matnr;

            globalModel.setProperty("/Ekgrp", sEkgrp);
            globalModel.setProperty("/Lifnr", sLifnr);
            globalModel.setProperty("/Matnr", sMatnr);
            var sObjectPath = this.getModel().createKey("/PO", {
                Ekgrp: sEkgrp,
                Lifnr: sLifnr,
                Matnr: sMatnr
            });
            var sHeader = this.byId("headerDetail");
            sHeader.bindElement(sObjectPath);
            
            // Tabela Compra
            this._compraTable.bindItems({
                path: sObjectPath + "/POCompra",
                template: this._compraTable.getBindingInfo("items").template
            });
            this.resetSortIcons(this._compraTable, true);
            // Tabela Venda
            this._vendaTable.bindItems({
                path: sObjectPath + "/POVenda",
                template: this._vendaTable.getBindingInfo("items").template
            });
            this.resetSortIcons(this._vendaTable, true);
            // Tabela Histórico
            // var tableHistorico = this.byId("historicoTable");
            // tableHistorico.bindItems({
            // 	path: sObjectPath + "/POHistorico",
            // 	template: tableHistorico.getBindingInfo("items").template
            // });
            // Tabela Faceamento
            this._faceamentoTable.bindItems({
                path: sObjectPath + "/POFaceamento",
                template: this._faceamentoTable.getBindingInfo("items").template
            });
            this.resetSortIcons(this._faceamentoTable, true);
            // Tabela Pesquisa
            this._pesquisaTable.bindItems({
                path: sObjectPath + "/POPesquisaSet",
                template: this._pesquisaTable.getBindingInfo("items").template
            });
            this.resetSortIcons(this._pesquisaTable, true);

            globalModel.setProperty("/Alterado", false);
            this.byId('botaoGravarSugestao').setEnabled(false);
            this.updateTotalTelaLocal();
            // this.resetFilters(oEvent);
            // Busca número da coluna de input
            for (var i = 0; i < this._compraTable.mAggregations.columns.length; i++) {
                if (this._compraTable.mAggregations.columns[i].sId.includes("colinputSugestao")) {
                    this._colInput = i;
                    break;
                }
            }
            this.recoverSortConfig('compraTable');
            this.recoverSortConfig('vendaTable');
            this.recoverSortConfig('faceamentoTable');
            this.recoverSortConfig('pesquisaTable');
        },
        //FAFN - Begin
        onClickColumnHeader: function (oID, oTable) {
            let sID = oID;
            let oTabela = oTable;
            $('#' + oID).click((oEvent) => { //Attach Table Header Element Event
                //let sBinding = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[0].id).data('binding');
                let sBinding = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[0].childNodes[0].id).data('binding');
                this.onClickSort(oEvent, oTable, sBinding);
            });
        },
        onClickSort: function (oEvent, oTable, oBinding) {
            //let oIcon = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id);
            let oIcon = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[1].childNodes[0].id);
            let oItems = oTable.getBinding("items");
            let oSorter = new Sorter(oBinding);
            let oColor = oIcon.getColor();
            let oSrc = oIcon.getSrc();
            //let sId = oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id;
            let sId = oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[1].childNodes[0].id;
            this.resetSortIcons(oTable, false);
            if (oColor === "#808080") {
                oIcon.setColor("#f00000");
                oIcon.setSrc("sap-icon://sort-ascending");
                oItems.sort(oSorter);
                this.setSortConfig(oBinding, true, sId, this.getTableName(oTable.getId()));
            } else {
                if (oSrc === "sap-icon://sort-ascending") {
                    oIcon.setColor("#f00000");
                    oIcon.setSrc("sap-icon://sort-descending");
                    oSorter.bDescending = true;
                    oItems.sort(oSorter, true);
                    this.setSortConfig(oBinding, false, sId, this.getTableName(oTable.getId()));
                } else {
                    this.resetSortIcons(oTable, true);
                    let oSortInitial = new Sorter("Werks");
                    oItems.sort(oSortInitial);
                    this.setSortConfig(oBinding, true, sId, this.getTableName(oTable.getId()));
                }
            }
        },
        getTableName: function (sId) {
            if (sId.includes('compraTable')) {
                return 'compraTable';
            }
            if (sId.includes('vendaTable')) {
                return 'vendaTable';
            }
            if (sId.includes('faceamentoTable')) {
                return 'faceamentoTable';
            }
            if (sId.includes('pesquisaTable')) {
                return 'pesquisaTable';
            }            
        },
        recoverSortConfig: function (sTable) {

            let sStorage = 'sortConfig' + sTable;
            let oConfigSort = localStorage.getItem(sStorage) ? JSON.parse(localStorage.getItem(sStorage)) : null;
            let oItems = this.getView().byId(sTable).getBinding("items");

            if (oConfigSort) {

                let oIcon = sap.ui.getCore().byId(oConfigSort.sId);
                if (oIcon) {
                    if (sTable.includes('compra')) {
                        this.getView().byId('_i_compra_0').setColor('#808080');
                    }
                    if (sTable.includes('faceamento')) {
                        this.getView().byId('_i_faceamento_0').setColor('#808080');
                    }
                    if (sTable.includes('pesquisa')) {
                        this.getView().byId('_i_pesquisa_0').setColor('#808080');
                    }
                    if (sTable.includes('venda')) {
                        this.getView().byId('_i_venda_0').setColor('#808080');
                    }
                    oIcon.setColor("#f00000");
                    oIcon.setSrc(oConfigSort.isAsc ? "sap-icon://sort-ascending" : "sap-icon://sort-descending");
                    let oSorter = new Sorter(oConfigSort.field);
                    oSorter.bDescending = !oConfigSort.isAsc;
                    oItems.sort(oSorter, !oConfigSort.isAsc);
                }
            }
        },
        setSortConfig: function (sField, bIsAsc, sId, sTable) {
            let oConfigSort = localStorage.getItem('sortConfig' + sTable) ? JSON.parse(localStorage.getItem('sortConfig')) : null;
            oConfigSort = {
                table: sTable,
                field: sField,
                isAsc: bIsAsc,
                sId: sId
            };
            localStorage.setItem('sortConfig' + sTable, JSON.stringify(oConfigSort));
        },
        onFilterPress: function (oEvent) {
            var aFilters = [];
            var iWerks = this.byId("_if_compra_werks");
            var iUf = this.byId("_if_compra_uf");
            var iBandeira = this.byId("_if_compra_bandeira");

            if (oEvent.getParameters("pressed").pressed) {
                if (iWerks.getValue() !== "") {
                    var fWerks = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, iWerks.getValue().toUpperCase());
                    aFilters.push(fWerks);
                }
                if (iUf.getValue() !== "") {
                    var fUf = new sap.ui.model.Filter("Uf", sap.ui.model.FilterOperator.Contains, iUf.getValue().toUpperCase());
                    aFilters.push(fUf);
                }
                if (iBandeira.getValue() !== "") {
                    var fBandeira = new sap.ui.model.Filter("Bandeira", sap.ui.model.FilterOperator.Contains, iBandeira.getValue().toUpperCase());
                    aFilters.push(fBandeira);
                }
            } else {
                iWerks.setValue("");
                iUf.setValue("");
                iBandeira.setValue("");
            }
            var oItemsCompra = this._compraTable.getBinding("items");
            oItemsCompra.filter(aFilters);
            var oItemsPedido = this._vendaTable.getBinding("items");
            oItemsPedido.filter(aFilters);
            var oItemsFaceamento = this._faceamentoTable.getBinding("items");
            oItemsFaceamento.filter(aFilters);
            var oItemspesquisa = this._pesquisaTable.getBinding("items");
            oItemspesquisa.filter(aFilters);
        },
        onFilter: function (oEvent, oTable, oPrefix) {
            // var aFilters = [];
            // var iWerks = this.byId("_if" + oPrefix + "werks");
            // var iUF = this.byId("_if" + oPrefix + "uf");
            // var iBandeira = this.byId("_if" + oPrefix + "bandeira");
            // if (oEvent.getParameters("pressed").pressed) {
            // 	if (iWerks.getValue() !== "") {
            // 		var fWerks = new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.Contains, iWerks.getValue().toUpperCase());
            // 		aFilters.push(fWerks);
            // 	}

            // 	if (iUF.getValue() !== "") {
            // 		var fUF = new sap.ui.model.Filter("Uf", sap.ui.model.FilterOperator.Contains, iUF.getValue().toUpperCase());
            // 		aFilters.push(fUF);
            // 	}

            // 	if (iBandeira.getValue() !== "") {
            // 		var fBandeira = new sap.ui.model.Filter("Bandeira", sap.ui.model.FilterOperator.Contains, iBandeira.getValue().toUpperCase());
            // 		aFilters.push(fBandeira);
            // 	}
            // } else {
            // 	iWerks.setValue("");
            // 	iUF.setValue("");
            // 	iBandeira.setValue("");
            // }
            // var oItems = this.oTable.getBinding("items");
            // oItems.filter(aFilters);
        },
        resetSortIcons: function (oTable, oFirst) {
            var prefIcone = "";
            var oQtde = oTable.getAggregation("columns").length - 1;
            if (oTable === this._compraTable) {
                prefIcone = "_i_compra_"
            }
            if (oTable === this._vendaTable) {
                prefIcone = "_i_venda_"
            }
            if (oTable === this._faceamentoTable) {
                prefIcone = "_i_faceamento_"
            }
            if (oTable === this._pesquisaTable) {
                prefIcone = "_i_pesquisa_"
            }
            for (var i = 0; i < oQtde; i++) {
                let zIcon = this.byId(prefIcone + i.toString());
                zIcon.setColor("#808080");
                zIcon.setSrc("sap-icon://sort-ascending");
            }
            if (oFirst) {
                let zIcon = this.byId(prefIcone + "0");
                zIcon.setColor("#f00000");
                zIcon.setSrc("sap-icon://sort-ascending");
            }
        },
        // onChangeFilterColumn: function (oEvent) {
        // 	var oValue = oEvent.getParameter("value");
        // 	var oMultipleValues = oValue.split(",");
        // 	var aFilters = [];
        // 	for (var i = 0; i < oMultipleValues.length; i++) {
        // 		var oFilter = new Filter(this._oColumnFilterPopover.bindingValue, "Contains", oMultipleValues[i]);
        // 		aFilters.push(oFilter)
        // 	}
        // 	var oItems = this._oColumnFilterPopover.oTabela.getBinding("items");
        // 	oItems.filter(aFilters, "Application");
        // 	this._oColumnFilterPopover.close();
        // },
        // onAscending: function () {
        // 	var oItems = this._oColumnFilterPopover.oTabela.getBinding("items");
        // 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);

        // 	var oIcon = this.byId("_i_compra_"+this._oColumnFilterPopover.bindingValue);

        // 	oItems.sort(oSorter);
        // 	this._oColumnFilterPopover.close();
        // },
        // onDescending: function () {
        // 	var oItems = this._oColumnFilterPopover.oTabela.getBinding("items");
        // 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);
        // 	oSorter.bDescending = true;
        // 	oItems.sort(oSorter, true);
        // 	this._oColumnFilterPopover.close();
        // }, //FAFN - End				
        _onLiveChangeInput: function (oEvent) {
            var actualValue = oEvent.getParameter("value");
            var lastValue = oEvent.getSource()._lastValue;
            let isNum = /^\d+$/.test(actualValue);
            if (!isNum && actualValue.length > 0) {
                oEvent.getSource().setValue(actualValue.replace(/\D/g, ''));
                //actualValue = lastValue;
            }
            if (actualValue < 0) {
                actualValue = "0";
                oEvent.getSource().setValue(0);
            }
            if (actualValue !== lastValue) {
                var globalModel = this.getModel("globalModel");
                this.byId('botaoGravarSugestao').setEnabled(true);
                globalModel.setProperty("/Alterado", true);
            }
            this.updateTotalTelaLocal();
        },
        _onSavePress: function (oEvent) {
            var scompraTable = this.byId("compraTable");
            var oModel = scompraTable.getModel();
            var that = this;
            // faz o update na tabela via oData-PUT
            var sPath = oEvent.getSource().getBindingContext().sPath;
            var payLoad = {};
            payLoad.Ekgrp = oEvent.getSource().getBindingContext().getProperty("Ekgrp");
            payLoad.Lifnr = oEvent.getSource().getBindingContext().getProperty("Lifnr");
            payLoad.Matnr = oEvent.getSource().getBindingContext().getProperty("Matnr");
            payLoad.Werks = oEvent.getSource().getBindingContext().getProperty("Werks");
            payLoad.Requisicao = oEvent.getSource().getParent().getCells()[this._colInput].getValue();
            oModel.update(sPath, payLoad, {
                success: function (oData, oResponse) {
                    //sap.m.MessageToast.show(" updated Successfully");
                    that.updateTotalTela();
                },
                error: function (oError) {
                    //sap.m.MessageToast.show("  failure");
                }
            }); // apaga o refresh desse item
            //oEvent.getSource().getParent().getAggregation("cells")[this._colInput].setVisible(false);
        },
        _onGoToPedido: function (oEvent) {
            var globalModel = this.getModel("globalModel");
            var sEkgrp = globalModel.getProperty("/Ekgrp");
            var sLifnr = globalModel.getProperty("/Lifnr");

            this.getRouter().navTo("pedido", {
                Ekgrp: sEkgrp,
                Lifnr: sLifnr
            }, true);
        },
        onNavBack: function (oEvent) {
            //var oViewModel = this.getModel("detailView");
            let oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let globalModel = this.getModel("globalModel");
            let sEkgrp = globalModel.getProperty("/Ekgrp");
            let sLifnr = globalModel.getProperty("/Lifnr");
            let sAlterado = globalModel.getProperty("/Alterado");

            if (sAlterado) {
                MessageBox.confirm(oBundle.getText("sairDetalhe"), {
                    title: oBundle.getText("sairDetalheTitulo"),
                    actions: [
                        MessageBox.Action.YES,
                        MessageBox.Action.NO,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.YES,
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.YES) {
                            // Pergunta se deseja gravar
                            this.gravaValores(oEvent);
                        }
                        if (oAction === MessageBox.Action.NO) {

                            this.getRouter().navTo("pedido", {
                                Ekgrp: sEkgrp,
                                Lifnr: sLifnr
                            }, true);
                        }
                    }
                });
            } else {
                    this.getRouter().navTo("pedido", {
                    Ekgrp: sEkgrp,
                    Lifnr: sLifnr
                }, true);
            }
        },
        gravaValores: function (oEvent) {
            var oView = this.getView();
            var qtdeTotal = 0,
                qtdeRequisicao = 0;
            var hasChanges = false;
            var btnNavBack = ( oEvent.getId() !== 'press');
            var globalModel = this.getModel("globalModel");
            var sEkgrp = globalModel.getProperty("/Ekgrp");
            var sLifnr = globalModel.getProperty("/Lifnr");
            var sAlterado = globalModel.getProperty("/Alterado");
            if (sAlterado) {
                var scompraTable = this.byId("compraTable");
                var oModel = scompraTable.getModel();
                //"useBatch" : true,
                //"defaultBindingMode": "TwoWay",
                //"defaultCountMode" : "None",
                oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
                oModel.setUseBatch(true);
                oModel.setDeferredGroups(["dma1"]);
                for (var i = 0; i < scompraTable.getItems().length; i++) {
                    var colRequisicao = scompraTable.getItems()[i].getCells()[this._colInput];
                    qtdeRequisicao = colRequisicao.getValue() === "" ? "0" : colRequisicao.getValue();
                    if (qtdeRequisicao !== colRequisicao.getBindingInfo("value").binding.oValue) {
                        //qtdeRequisicao = colRequisicao.getValue() === "" ? "0" : colRequisicao.getValue();
                        //////// 	Enviando todos os dados todas as vezes
                        //					qtdeSugestao = scompraTable.getItems()[i].getAggregation("cells")[18].getProperty("number");
                        //					if (qtdeRequisicao !== qtdeSugestao) {
                        qtdeTotal += parseInt(qtdeRequisicao, 10);
                        var sPath = scompraTable.getItems()[i].getBindingContext().sPath;
                        var payLoad = {};
                        payLoad.Ekgrp = scompraTable.getItems()[i].getBindingContext().getProperty("Ekgrp");
                        payLoad.Lifnr = scompraTable.getItems()[i].getBindingContext().getProperty("Lifnr");
                        payLoad.Matnr = scompraTable.getItems()[i].getBindingContext().getProperty("Matnr");
                        payLoad.Werks = scompraTable.getItems()[i].getBindingContext().getProperty("Werks");
                        //conversao vazio para zero string
                        payLoad.Requisicao = qtdeRequisicao;
                        oModel.update(sPath, payLoad, {
                            groupId: "dma1"
                        });
                        hasChanges = true;
                    } else {
                        qtdeTotal += parseInt(colRequisicao.getBindingInfo("value").binding.oValue, 10);
                    }
                }
                if (hasChanges) {
                    sap.ui.core.BusyIndicator.show();
                    oModel.submitChanges({
                        groupId: "dma1",
                        success: (oData, oResponse) => {
                            oModel.setUseBatch(false);
                            sap.ui.core.BusyIndicator.hide();
                            if (btnNavBack) {
                                this.getRouter().navTo("pedido", {
                                    Ekgrp: sEkgrp,
                                    Lifnr: sLifnr
                                }, true);
                            }
                            this.byId("headerDetail").setNumber(qtdeTotal);
                            globalModel.setProperty("/Alterado", false);
                            this.byId('botaoGravarSugestao').setEnabled(false);
                        },
                        error: (oData, oResponse) => {
                            sap.ui.core.BusyIndicator.hide();
                            sap.m.MessageToast.show("error function");
                        }
                    });
                } else {
                    this.byId('botaoGravarSugestao').setEnabled(false);
                    if (btnNavBack) {
                        this.getRouter().navTo("pedido", {
                            Ekgrp: sEkgrp,
                            Lifnr: sLifnr
                        }, true);
                    }
                }
            }
        },
        reiniciaValores: function () {
            var scompraTable = this.byId("compraTable");
            var sObjectPath = scompraTable.getBindingInfo("items").path;
            scompraTable.bindItems({
                path: sObjectPath,
                template: scompraTable.getBindingInfo("items").template
            });
        },
        updateTotalTela: function () {
            var globalModel = this.getModel("globalModel");
            var localModel = this.getModel();
            var sObjectPath = localModel.createKey("/POItemsSum", {
                Ekgrp: globalModel.getProperty("/Ekgrp"),
                Lifnr: globalModel.getProperty("/Lifnr"),
                Matnr: globalModel.getProperty("/Matnr")
            });
            localModel.read(sObjectPath, {
                method: "GET",
                success: (oData2, oResponse) => {
                    this.byId("headerDetail").setNumber(oData2.Qtde);
                },
                error: function (oError) { }
            });
        },
        updateTotalTelaLocal: function () {
            var qtdeTotal = 0;
            var valorItem = 0;
            var scompraTable = this.byId("compraTable");
            for (var i = 0; i < scompraTable.getItems().length; i++) {
                valorItem = scompraTable.getItems()[i].getCells()[this._colInput].getValue();
                if (valorItem > 0) {
                    qtdeTotal += parseInt(valorItem, 10);
                }
            }
            this.byId("headerDetail").setNumber(qtdeTotal);
        },
        onTitleSelectorPress: function (oEvent) {
            var cabec = this.byId("headerDetail");
            cabec.setCondensed(!cabec.getCondensed());
        },
        compraUpdateFinished: function (oEvent) {
            this.updateTotalTela();
        },
        onSelValorCompra: function (oEvent) {
            var globalModel = this.getModel("globalModel");
            globalModel.setProperty("/colVlrCompra", this._segCompra.getProperty("selectedKey") === "real");
            //this._VendaMM
        },
        toPrint: function (oEvent) {
            var globalModel = this.getModel("globalModel");
            var localModel = this.getModel();
            var sEkgrp = globalModel.getProperty("/Ekgrp");
            var sLifnr = globalModel.getProperty("/Lifnr");
            var sMatnr = globalModel.getProperty("/Matnr");

            var sObjectPath = localModel.createKey("/PrnLojas", {
                Ekgrp: sEkgrp,
                Lifnr: sLifnr,
                Matnr: sMatnr
            });
            var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
            window.open(sURL);
        },

        onPressShowAnexo: function (oEvent) {
            var localModel = this.getModel();
            if (oEvent.getSource().getBindingContext().getObject().Anexo) {
                var sWerks = oEvent.getSource().getBindingContext().getObject().Werks;
                var sData = oEvent.getSource().getBindingContext().getObject().DataPesquisa;
                var sMatnr = oEvent.getSource().getBindingContext().getObject().Matnr;

                var sObjectPath = "/POPesqImagemSet(Werks='"+ sWerks + "',Matnr='" + sMatnr + "',DataPesquisa='" + sData + "')";
                var sURL = localModel.sServiceUrl + sObjectPath + "/$value";
                window.open(sURL);         
            }
        }        
    });
});