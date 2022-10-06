sap.ui.define([
    "dma/zcockpit/controller/BaseController",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    'sap/m/Token',
    "dma/zcockpit/model/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel" 
], function (BaseController, Device, History, Fragment, Token, formatter, MessageBox, JSONModel, Filter, FilterOperator) {
    "use strict";
    return BaseController.extend("dma.zcockpit.controller.Busca", {
        formatter: formatter,
        _hieraquiaInput: null,
        onInit: function () {
            this._hieraquiaInput = this.getView().byId('hieraquiaInput');
            this.getRouter().getRoute("busca").attachPatternMatched(this._onMasterMatched, this);
            //this.habilitaBotaoPedido();
        },
        initSearchHelHierarquia: function () {
            this.oColHierarquiaSearchModel = new sap.ui.model.json.JSONModel({
                "cols": [{
                    "label": this.getText("node"),
                    "template": "Node6",
                    "width": "20%"
                }, {
                    "label": this.getText("descricao"),
                    "template": "Ltext",
                    "width": "80%"
                }]
            });

            //if (!this._oHierarquiaSearchHelpDialog) {
            this._oHierarquiaSearchHelpDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.HierarquiaSearchHelp", this);
            this.getView().addDependent(this._oHierarquiaSearchHelpDialog);
            //}

        },
        onValueHelpHierarquiaSearchOkPress: function (oEvent) {
            let aTokens = oEvent.getParameter("tokens");
            this._hieraquiaInput.setTokens(aTokens);
            this.habilitaBotaoPedido();
            oEvent.oSource.close();
        },
        onF4Hierarquia: function () {

            let sEkgrp = this.byId("compradorInput").getValue();
            let sLifnr = this.byId("fornecedorInput").getValue();
            let aFilters = [];
            if (sEkgrp && sEkgrp.length > 0) {
                aFilters.push(new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp));
            }
            if (sLifnr && sLifnr.length > 0) {
                aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr));
            }

            this.initSearchHelHierarquia();
            this._oHierarquiaSearchHelpDialog.getTable().setModel(this.oColHierarquiaSearchModel, "columns");
            if (this._oHierarquiaSearchHelpDialog.getTable().bindRows) {
                this._oHierarquiaSearchHelpDialog.getTable().bindAggregation("rows", "/Hierarquia");
                this._oHierarquiaSearchHelpDialog.getTable().getBinding("rows").filter(aFilters);
            }

            if (this._oHierarquiaSearchHelpDialog.getTable().bindItems) {

                this._oHierarquiaSearchHelpDialog.getTable().bindAggregation("items", {
                    path: "/Hierarquia"
                }, function () {
                    let aCols = this._oHierarquiaSearchHelpDialog.getTable().getModel("columns").getData().cols;
                    return new ColumnListItem({
                        cells: aCols.map(function (column) {
                            return new Label({
                                text: "{" + column.template + "}"
                            });
                        })
                    });
                });

            }

            //let oToken = new Token();
            //oToken.setKey(this._hieraquiaInput.getSelectedKey());
            //oToken.setText(this._hieraquiaInput.getValue());

            //this._oHierarquiaSearchHelpDialog.setTokens([oToken]);

            //if (this._hieraquiaInput.getTokens().length > 0) {
            //  this._oHierarquiaSearchHelpDialog.setTokens(this._hieraquiaInput.getTokens());
            //}
            this._oHierarquiaSearchHelpDialog.setTokens(this._hieraquiaInput.getTokens());

            this._oHierarquiaSearchHelpDialog.open();
            this._oHierarquiaSearchHelpDialog.update();

            this._oHierarquiaSearchHelpDialog.getTable().addEventDelegate({
                onAfterRendering: (oEvt) => {
                    if (this._oHierarquiaSearchHelpDialog.update) {
                        this._oHierarquiaSearchHelpDialog.update();
                    }
                }
            });

            this._oHierarquiaSearchHelpDialog.getTable().getBinding("rows").attachDataReceived(function (oEvt) {
                //this._oHierarquiaSearchHelpDialog.setTokens([]);
                //this._oHierarquiaSearchHelpDialog.setTokens(this._hieraquiaInput.getTokens());
                if (this._oHierarquiaSearchHelpDialog.update) {
                    this._oHierarquiaSearchHelpDialog.update();
                }
            }.bind(this));

        },
        onFilterSearchHierarquia: function (oEvent) {

            let sEkgrp = this.byId("compradorInput").getValue();
            let sLifnr = this.byId("fornecedorInput").getValue();
            let aFilters = this._createFilterForSelectionSet(oEvent.mParameters.selectionSet);
            if (sEkgrp && sEkgrp.length > 0) {
                aFilters.push(new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp));
            }
            if (sLifnr && sLifnr.length > 0) {
                aFilters.push(new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr));
            }
            this._oHierarquiaSearchHelpDialog.getTable().getBinding("rows").filter(aFilters);
        },
        _onMasterMatched: function (oEvent) {
            var globalModel = this.getModel("globalModel");

            // this.byId("idDtRemessa").setDateValue(globalModel.getProperty("/DtRemessa"));
            // this.byId("idComboPedido").setValue(globalModel.getProperty("/TpPedido"));
            // this.byId("idTpEntrada").setValue(globalModel.getProperty("/TpEntrada"));

            var sEkgrp = oEvent.getParameter("arguments").Ekgrp;
            var sLifnr = oEvent.getParameter("arguments").Lifnr;
            var compradorInput = this.byId("compradorInput");
            var fornecedorInput = this.byId("fornecedorInput");
            if (sEkgrp && sEkgrp.length > 0) {
                this.getOwnerComponent().getModel().read(`/Comprador(Ekgrp='${sEkgrp}')`, {
                    success: (res) => {
                        compradorInput.setDescription(res.Nome);
                        compradorInput.setValue(res.Ekgrp);
                        if (sLifnr && sLifnr.length > 0) {
                            this.getOwnerComponent().getModel().read(`/Fornecedor(Ekgrp='${sEkgrp}',Lifnr='${sLifnr}')`, {
                                success: (res) => {
                                    fornecedorInput.setDescription(res.Mcod1);
                                    fornecedorInput.setValue(res.Lifnr);
                                    this.habilitaBotaoPedido();
                                },
                                error: (err) => {
                                    sap.m.MessageBox.error(err.responseText, {
                                        title: "Erro",
                                    });
                                }
                            });
                        }
                    },
                    error: (err) => {
                        sap.m.MessageBox.error(err.responseText, {
                            title: "Erro",
                        });
                    }
                });
            } else {
                compradorInput.setDescription("");
                compradorInput.setValue("");
            }
            if (sLifnr == undefined) {
                this.clearFornecedor(oEvent);
                this.clearHierarquia();
                this.clearUF(oEvent);
                this.clearContrato(oEvent);
            }
            this.clearSelectedProduto();
            this.habilitaBotaoPedido();
        },
        habilitaBotaoPedido: function () {
            this.filtraProdutos(true);

            var localModel = this.getModel();
            var globalModel = this.getModel("globalModel");
            var btnPedido = this.byId("botaoPedido");
            // Filtros
            // var sWerks = this.byId("lojasInput").getValue();
            var sEkgrp = this.byId("compradorInput").getValue();
            var sLifnr = this.byId("fornecedorInput").getValue();
            // var sEbeln = this.byId("contratoInput").getValue();
            // Configurações
            var sDtRemessa = this.byId("idDtRemessa").getDateValue();
            // if (sDtRemessa === "") {
            //     this.byId("idDtRemessa").addStyleClass("campoObrigatorio");
            // } else {
            //     this.byId("idDtRemessa").removeStyleClass("campoObrigatorio");
            // }
            var sComboPedido = this.byId("idComboPedido").getValue();
            // if (sComboPedido === "") {
            //     this.byId("idComboPedido").addStyleClass("campoObrigatorio");
            // } else {
            //     this.byId("idComboPedido").removeStyleClass("campoObrigatorio");
            // }
            // var sTpEntrada = globalModel.getProperty("/TpEntrada");

            btnPedido.setEnabled(
                (sDtRemessa !== null) &&
                (sComboPedido !== "") &&
                (sEkgrp !== "") &&
                (sLifnr !== "")
            );

            // var aFilters = [];
            // this.byId("botaoRecupera").setEnabled(false);
            // // Habilita botão Recupera Pedido
            // if ((sEkgrp !== "") && (sLifnr !== "")) {
            //     var sObjectPath = this.getModel().createKey("/RecuperaPedido", {
            //         Ekgrp: sEkgrp,
            //         Lifnr: sLifnr
            //     });            
            //     localModel.read(sObjectPath, {
            //         method: "GET",
            //         // filters: aFilters,
            //         success: (oData2, oResponse) => {
            //             // if (oData2.results)
            //             this.byId("botaoRecupera").setEnabled((sDtRemessa !== null) &&
            //                                                   (sComboPedido !== ""));
            //             this._recupera_valor = oData2.Valor;
            //             this._recupera_qtde = oData2.Requisicao;
            //         },
            //         error: function (oError) {
            //             this.byId("botaoRecupera").setEnabled(false);
            //         }
            //     });          
            // // Filtro Comprador
            // if (sEkgrp !== "") {
            //     var fEkgrp = new sap.ui.model.Filter({
            //         path: "Ekgrp",
            //         operator: sap.ui.model.FilterOperator.EQ,
            //         value1: sEkgrp.toUpperCase()
            //     });
            // 	aFilters.push(fEkgrp);
            // }
            // // Filtro Fornecedor
            // if (sLifnr !== ""){
            //     var fLifnr = new sap.ui.model.Filter({
            //         path: "Lifnr",
            //         operator: sap.ui.model.FilterOperator.EQ,
            //         value1: sLifnr.toUpperCase()
            //     });
            //     aFilters.push(fLifnr);
            // }
            // }
        },
        // onRecuperaPressed: function (oEvent) {
        // 	var localModel = this.getModel();
        // 	var globalModel = this.getModel("globalModel");

        // 	globalModel.setProperty("/DtRemessa", this.byId("idDtRemessa").getDateValue());
        // 	globalModel.setProperty("/TpPedido", this.byId("idComboPedido").getValue());
        // 	// globalModel.setProperty("/TpEntrada", this.byId("idTpEntrada").getValue());

        //     var sEkgrp = this.byId("compradorInput").getValue();
        //     var sLifnrName = this.byId("fornecedorInput").getDescription();
        //     var sLifnr = this.byId("fornecedorInput").getValue();

        //     MessageBox.confirm(this.getText("msg_recupera1") + " " + sLifnrName +
        //                        " (" + sLifnr + ") " +
        //                        this.getText("msg_recupera2") + " " + this._recupera_qtde + " " + 
        //                        this.getText("msg_recupera3") + " " + formatter.fullNumberStr(this._recupera_valor) + " " + 
        //                        this.getText("msg_recupera4") , {
        //         title: this.getText("msg_recupera_title"),
        //         actions: [
        //             MessageBox.Action.YES,
        //             MessageBox.Action.NO
        //         ],
        //         emphasizedAction: MessageBox.Action.YES,
        //         initialFocus: MessageBox.Action.YES,
        //         onClose: (oAction) => {
        //             if (oAction === MessageBox.Action.YES) {
        //                 // agrupa todos os filtros da tela
        //                 var aFilters = [];
        //                 this.montaFiltros(aFilters, true);

        //                 // executa busca dos produtos na ficha técnica
        //                 sap.ui.core.BusyIndicator.show();
        //                 localModel.read("/PORecupera", {
        //                     method: "GET",
        //                     filters: aFilters,
        //                     success: (oData2, oResponse) => {
        //                         sap.ui.core.BusyIndicator.hide();
        //                         this.getRouter().navTo("pedido", {
        //                             Ekgrp: sEkgrp,
        //                             Lifnr: sLifnr
        //                         }, true);
        //                     },
        //                     error: (oError) => {
        //                         sap.ui.core.BusyIndicator.hide();
        //                         // mensagem de erro !!!!!!!!!!!!!!!!!!!!!!!
        //                     }
        //                 });
        //             }
        //         }
        //     });            
        // },
        onPedidoPressed: function (oEvent) {
            var localModel = this.getModel();
            var globalModel = this.getModel("globalModel");

            globalModel.setProperty("/DtRemessa", this.byId("idDtRemessa").getDateValue());
            globalModel.setProperty("/TpPedido", this.byId("idComboPedido").getValue());
            // globalModel.setProperty("/TpEntrada", this.byId("idTpEntrada").getValue());

            var sEkgrp = this.byId("compradorInput").getValue();
            var sLifnr = this.byId("fornecedorInput").getValue();
            var sLifnrName = this.byId("fornecedorInput").getDescription();
            var sSobsl = this.byId("idFsuprimentos").getValue();

            // agrupa todos os filtros da tela
            var aFilters = [];
            this.montaFiltros(aFilters, true);

            var sObjectPath = this.getModel().createKey("/RecuperaPedido", {
                Ekgrp: sEkgrp,
                Lifnr: sLifnr
            });
            sap.ui.core.BusyIndicator.show();
            localModel.read(sObjectPath, {
                method: "GET",
                // filters: aFilters,
                success: (oData2, oResponse) => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.confirm(this.getText("msg_recupera1") + " " + sLifnrName +
                        " (" + sLifnr + ") " +
                        this.getText("msg_recupera2") + " " + oData2.Requisicao + " " +
                        this.getText("msg_recupera3") + " " + formatter.fullNumberStr(oData2.Valor) + " " +
                        this.getText("msg_recupera4"), {
                        title: this.getText("msg_recupera_title"),
                        actions: [
                            MessageBox.Action.YES,
                            MessageBox.Action.NO,
                            MessageBox.Action.CANCEL
                        ],
                        emphasizedAction: MessageBox.Action.YES,
                        initialFocus: MessageBox.Action.YES,
                        onClose: (oAction) => {
                            if (oAction === MessageBox.Action.YES) {
                                // executa busca dos produtos na ficha técnica
                                sap.ui.core.BusyIndicator.show();
                                localModel.read("/PORecupera", {
                                    method: "GET",
                                    filters: aFilters,
                                    success: (oData2, oResponse) => {
                                        sap.ui.core.BusyIndicator.hide();
                                        this.getRouter().navTo("pedido", {
                                            Ekgrp: sEkgrp,
                                            Lifnr: sLifnr
                                        }, true);
                                    },
                                    error: (oError) => {
                                        sap.ui.core.BusyIndicator.hide();
                                    }
                                });
                            }
                            if (oAction === MessageBox.Action.NO) {
                                // executa busca dos produtos na ficha técnica
                                sap.ui.core.BusyIndicator.show();
                                localModel.read("/POBusca", {
                                    method: "GET",
                                    filters: aFilters,
                                    success: (oData2, oResponse) => {
                                        sap.ui.core.BusyIndicator.hide();

                                        let orNodes = [];
                                        for (let item of this._hieraquiaInput.getTokens()) {
                                            orNodes.push(item.mProperties.key);
                                        }

                                        this.getRouter().navTo("pedido", {
                                            Ekgrp: sEkgrp,
                                            Lifnr: sLifnr,
                                            Node6 : orNodes && orNodes.length > 0 ? orNodes.toString() : ''
                                        }, true);
                                    },
                                    error: (oError) => {
                                        sap.ui.core.BusyIndicator.hide();
                                        // mensagem de erro !!!!!!!!!!!!!!!!!!!!!!!
                                    }
                                });
                            }
                            // if (oAction === MessageBox.Action.CANCEL) {}
                        }
                    });
                },
                error: (oError) => {
                    // executa busca dos produtos na ficha técnica
                    localModel.read("/POBusca", {
                        method: "GET",
                        filters: aFilters,
                        success: (oData2, oResponse) => {
                            sap.ui.core.BusyIndicator.hide();
                            this.getRouter().navTo("pedido", {
                                Ekgrp: sEkgrp,
                                Lifnr: sLifnr
                            }, true);
                        },
                        error: (oError) => {
                            sap.ui.core.BusyIndicator.hide();
                            // mensagem de erro !!!!!!!!!!!!!!!!!!!!!!!
                        }
                    });
                }
            });
        },
        /* Configurações */
        onExpand: function (oEvent) {
            var globalModel = this.getModel("globalModel");
            var sValue = oEvent.getParameter("expand");
            // if (sValue) {
            // 	this.byId("idDtRemessa").setDateValue(globalModel.getProperty("/DtRemessa"));
            // 	this.byId("idComboPedido").setValue(globalModel.getProperty("/TpPedido"));
            // 	this.byId("idTpEntrada").setValue(globalModel.getProperty("/TpEntrada"));
            // } else {
            // 	globalModel.setProperty("/DtRemessa", this.byId("idDtRemessa").getDateValue());
            // 	globalModel.setProperty("/TpPedido", this.byId("idComboPedido").getValue());
            // 	globalModel.setProperty("/TpEntrada", this.byId("idTpEntrada").getValue());
            // }
        },
        onNavBack: function (oEvent) {
            this.getRouter().navTo("home", true); //}
        },
        deletePressLojas: function (oEvent) {
            this.clearUF(oEvent);
        },
        onTipoPedido: function (oEvent) {
            this.habilitaBotaoPedido();
        },
        onFsuprimentos: function (oEvent) {
            this.habilitaBotaoPedido();
        },
        onDtRemessa: function (oEvent) {
            this.habilitaBotaoPedido();
        },
        /* Value Help UF */
        onF4UF: function (oEvent) {
            if (!this._F4UFDialog) {
                this._F4UFDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.uf", this);
                this.getView().addDependent(this._F4UFDialog);
            }

            var aInput = this.byId("UFInput").getTokens();
            var aUFItems = this._F4UFDialog._oList.getItems();
            for (var iTk = 0; iTk < aInput.length; iTk++) {
                for (var type = 0; type < aUFItems.length; type++) {
                    if (aUFItems[type].getTitle() === aInput[iTk].getKey()) {
                        aUFItems[type].setSelected(true);
                    }
                }
            }
            this._F4UFDialog.open();
        },
        _openF4UFDialog: function (oEvent) {
            var sInputValue = oEvent.getSource().getDescription();
            // create a filter for the binding
            this._F4UFDialog.getBinding("items").filter([new sap.ui.model.Filter(
                "Bland",
                sap.ui.model.FilterOperator.Contains,
                sInputValue
            )]);

            // open value help dialog filtered by the input value
            this._F4UFDialog.open(sInputValue);
        },
        _handleF4UFSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter(
                "Bland",
                sap.ui.model.FilterOperator.Contains,
                sValue.toUpperCase()
            );
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },
        _handleF4UFClose: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems"),
                oMultiInput = this.byId("UFInput");

            //FAFN - Begin
            oMultiInput.removeAllTokens();
            //FAFN - End

            if (aSelectedItems && aSelectedItems.length > 0) {
                aSelectedItems.forEach(function (oItem) {
                    oMultiInput.addToken(new Token({
                        key: oItem.getTitle(),
                        text: oItem.getDescription()
                    }));
                });
            }
            this.cleargrupoLojas(oEvent);
            this.clearLojas(oEvent);
            //this.habilitaBotaoPedido();
        },
        _handleF4UFCancel: function (oEvent) {
        },
        onF4UFTokenUpdate: function (oEvent) {
            this.cleargrupoLojas(oEvent);
            this.clearLojas(oEvent);
            this.habilitaBotaoPedido();
        },
        clearUF: function (oEvent) {
            var UFInput = this.byId("UFInput");
            UFInput.removeAllTokens();
            this.cleargrupoLojas(oEvent);
            this.clearLojas(oEvent);
            this.habilitaBotaoPedido();
        },
        /* Value Help Grupo Lojas - Bandeira */
        onF4grupoLojas: function (oEvent) {
            // create value help dialog
            if (!this._F4grupoLojasDialog) {
                this._F4grupoLojasDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.grupoLojas", this);
                this.getView().addDependent(this._F4grupoLojasDialog);
            }

            var aInput = this.byId("grupoLojasInput").getTokens();
            var aglItems = this._F4grupoLojasDialog._oList.getItems();
            for (var iTk = 0; iTk < aInput.length; iTk++) {
                for (var type = 0; type < aglItems.length; type++) {
                    if (aglItems[type].getTitle() === aInput[iTk].getKey()) {
                        aglItems[type].setSelected(true);
                    }
                }
            }
            this._openF4grupoLojasDialog(oEvent);
        },
        _openF4grupoLojasDialog: function (oEvent) {
            var sInputValue = oEvent.getSource().getDescription();
            var aFilters = [];
            this._filtroF4grupoLojas(aFilters);

            if (sInputValue !== "") {
                aFilters.push(new sap.ui.model.Filter(
                    "Bandeira",
                    sap.ui.model.FilterOperator.Contains,
                    sInputValue.toUpperCase()
                ));
            }
            // open value help dialog filtered by the input value
            this._F4grupoLojasDialog.getBinding("items").filter(aFilters);
            this._F4grupoLojasDialog.open(sInputValue);
        },
        _filtroF4grupoLojas: function (aFilters) {
            // Filtro UF
            var sUF = this.byId("UFInput");
            if (sUF.getTokens().length > 0) {
                var orArrayUF = [];
                for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
                    orArrayUF.push(new sap.ui.model.Filter(
                        "UF",
                        sap.ui.model.FilterOperator.EQ,
                        sUF.getTokens()[iUF].getText()
                    ));
                }
                var orFilterUF = new sap.ui.model.Filter({
                    filters: orArrayUF,
                    and: false
                });
                aFilters.push(orFilterUF);
            }
            return aFilters;
        },
        _handleF4grupoLojasSearch: function (oEvent) {
            var aFilters = [];
            this._filtroF4grupoLojas(aFilters);
            // filtro Bandeira
            var sBandeira = oEvent.getParameter("value");
            if (sBandeira !== "") {
                aFilters.push(new sap.ui.model.Filter(
                    "Bandeira",
                    sap.ui.model.FilterOperator.Contains,
                    sBandeira.toUpperCase()
                ));
            }
            // Grava todos filtros
            oEvent.getSource().getBinding("items").filter(aFilters);
        },
        _handleF4grupoLojasClose: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems"),
                oMultiInput = this.byId("grupoLojasInput");
            //FAFN - Begin
            oMultiInput.removeAllTokens();
            //FAFN - End
            if (aSelectedItems && aSelectedItems.length > 0) {
                aSelectedItems.forEach(function (oItem) {
                    oMultiInput.addToken(new Token({
                        key: oItem.getDescription(),
                        text: oItem.getTitle()
                    }));
                });
                this.clearLojas(oEvent);
            }
            //this.habilitaBotaoPedido();
        },
        _handleF4grupoLojasCancel: function (oEvent) {
        },
        onF4grupoLojasTokenUpdate: function (oEvent) {
            this.clearLojas(oEvent);
            this.habilitaBotaoPedido();
        },
        cleargrupoLojas: function (oEvent) {
            var grupoLojasInput = this.byId("grupoLojasInput");
            grupoLojasInput.removeAllTokens();
            this.clearLojas(oEvent);
            this.habilitaBotaoPedido();
        },
        /* Value Help Lojas */
        onF4Lojas: function (oEvent) {
            // create value help dialog
            if (!this._F4LojasDialog) {
                this._F4LojasDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.lojas", this);
                this.getView().addDependent(this._F4LojasDialog);
            }

            var aInput = this.byId("lojasInput").getTokens();
            var aLojasItems = this._F4LojasDialog._oList.getItems();
            for (var iTk = 0; iTk < aInput.length; iTk++) {
                for (var type = 0; type < aLojasItems.length; type++) {
                    if (aLojasItems[type].getTitle() === aInput[iTk].getKey()) {
                        aLojasItems[type].setSelected(true);
                    }
                }
            }
            this._openF4LojasDialog(oEvent);
        },
        _openF4LojasDialog: function (oEvent) {
            var aFilters = [];
            var sInputValue = oEvent.getSource().getDescription();
            this._filtroF4Lojas(aFilters);
            // create a filter for the binding
            aFilters.push(new sap.ui.model.Filter(
                "Nome",
                sap.ui.model.FilterOperator.Contains,
                sInputValue
            ));
            // open value help dialog filtered by the input value
            this._F4LojasDialog.getBinding("items").filter(aFilters);
            this._F4LojasDialog.open(sInputValue);
        },
        _filtroF4Lojas: function (aFilters) {
            // Filtro UF
            var sUF = this.byId("UFInput");
            if (sUF.getTokens().length > 0) {
                for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
                    aFilters.push(new sap.ui.model.Filter({
                        path: "UF",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sUF.getTokens()[iUF].getText()
                    }));
                }
            }
            // Filtro Bandeira
            var sBandeira = this.byId("grupoLojasInput");
            if (sBandeira.getTokens().length > 0) {
                for (var iBand = 0; iBand < sBandeira.getTokens().length; iBand++) {
                    aFilters.push(new sap.ui.model.Filter({
                        path: "Bandeira",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: sBandeira.getTokens()[iBand].getText()
                    }));
                }
            }
        },
        _handleF4LojasSearch: function (oEvent) {
            var aFilters = [];
            this._filtroF4Lojas(aFilters);

            //Filtro Nome
            var sNomeLoja = oEvent.getParameter("value");
            aFilters.push(new sap.ui.model.Filter(
                "Nome",
                sap.ui.model.FilterOperator.Contains,
                sNomeLoja.toUpperCase()
            ));
            // Grava todos filtros
            oEvent.getSource().getBinding("items").filter(aFilters);

        },
        _handleF4LojasClose: function (oEvent) {
            var aSelectedItems = oEvent.getParameter("selectedItems"),
                oMultiInput = this.byId("lojasInput");

            oMultiInput.removeAllTokens();
            if (aSelectedItems && aSelectedItems.length > 0) {
                aSelectedItems.forEach(function (oItem) {
                    oMultiInput.addToken(new Token({
                        key: oItem.getDescription(),
                        text: oItem.getTitle()
                    }));
                });
            }
            this.habilitaBotaoPedido();
        },
        _handleF4LojasCancel: function (oEvent) {
        },
        onF4LojasTokenUpdate: function (oEvent) {
            this.habilitaBotaoPedido();
        },
        clearLojas: function (oEvent) {
            var lojasInput = this.byId("lojasInput");
            lojasInput.removeAllTokens();
            this.habilitaBotaoPedido();
        },
        /* Value Help Ekgrp */
        onF4Comprador: function (oEvent) {
            var sInputValue = oEvent.getSource().getDescription();
            this.inputId = oEvent.getSource().getId();
            // create value help dialog
            if (!this._F4compradorDialog) {
                this._F4compradorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.comprador", this);
                this.getView().addDependent(this._F4compradorDialog);
            }
            // open value help dialog filtered by the input value
            this._F4compradorDialog.open(sInputValue);
        },
        clearComprador: function (oEvent) {
            var compradorInput = this.byId("compradorInput");
            compradorInput.setValue("");
            compradorInput.setDescription("");
            this.clearFornecedor(oEvent);
            this.clearHierarquia();
            this.clearContrato(oEvent);
            this.habilitaBotaoPedido();
        },
        _handleF4compradorSearch: function (oEvent) {
            var globalModel = this.getModel("globalModel");
            var aFilters = [];
            // Filtrar compradores associados com o usuário SAP
            var sUname = globalModel.getProperty("/Uname")
            var fUname = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, sUname);
            aFilters.push(fUname);
            // no backend a busca é feita usando OR para Código (FVAL) e Nome (NAME_TEXTC)
            var sValue = oEvent.getParameter("value");
            var fNome = new sap.ui.model.Filter("Nome", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
            aFilters.push(fNome);
            oEvent.getSource().getBinding("items").filter(aFilters);
        },
        _handleF4compradorClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var compradorInput = this.getView().byId(this.inputId);
                var sEkgrp = oSelectedItem.getTitle();
                var sObjectPath = this.getModel().createKey("/Comprador", {
                    Ekgrp: sEkgrp
                });

                compradorInput.bindElement(sObjectPath);
                this.clearFornecedor(oEvent);
                this.clearHierarquia();
                this.clearContrato(oEvent);
            }
            oEvent.getSource().getBinding("items").filter([]);
            this.habilitaBotaoPedido();
        },
        /* Value Help Fornecedor */
        onF4Fornecedor: function (oEvent) {
            var sInputValue = oEvent.getSource().getDescription();
            var sEkgrp = this.byId("compradorInput").getValue();
            this.inputId = oEvent.getSource().getId();
            // create value help dialog
            if (!this._F4fornecedorDialog) {
                this._F4fornecedorDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.fornecedor", this);
                this.getView().addDependent(this._F4fornecedorDialog);
            }
            // set previous filter - if comprador is filled
            var oFilter = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
            // open value help dialog filtered by the input value
            this._F4fornecedorDialog.getBinding("items").filter([oFilter]);
            this._F4fornecedorDialog.open(sInputValue);
        },
        clearFornecedor: function (oEvent) {
            var fornecedorInput = this.byId("fornecedorInput");
            fornecedorInput.setValue("");
            fornecedorInput.setDescription("");
            this.clearContrato(oEvent);
            this.habilitaBotaoPedido();
        },
        clearHierarquia: function (oEvent) {
            this._hieraquiaInput.removeAllTokens();
            this.habilitaBotaoPedido();
        },
        onUpdateTokenHierarquia: function (oEvt) {
            this.habilitaBotaoPedido();
        },
        _handleF4fornecedorSearch: function (oEvent) {
            var aFilters = [];
            var sValue = oEvent.getParameter("value");
            // Filtro Fornecedor - Nome
            // no backend a busca é feita usando OR para Código (LIFNR) e Nome (Mcod1)
            var oForn = new sap.ui.model.Filter("Mcod1", sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
            aFilters.push(oForn);
            // Filtro Comprador
            var sEkgrp = this.byId("compradorInput").getValue();
            var oCompr = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
            aFilters.push(oCompr);
            oEvent.getSource().getBinding("items").filter(aFilters);
        },
        _handleF4fornecedorClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var fornecedorInput = this.getView().byId(this.inputId);
                fornecedorInput.setValue(oSelectedItem.getTitle());
                fornecedorInput.setDescription(oSelectedItem.getDescription());
                this.clearHierarquia();
                this.clearContrato(oEvent);

            }

            oEvent.getSource().getBinding("items").filter([]);
            this.habilitaBotaoPedido();
        },
        /* Value Help Contrato */
        onF4Contrato: function (oEvent) {
            var aFilters = [];
            var sInputValue = oEvent.getSource().getDescription();
            var sEkgrp = this.byId("compradorInput").getValue();
            var sLifnr = this.byId("fornecedorInput").getValue();
            this.inputId = oEvent.getSource().getId();
            // create value help dialog
            if (!this._F4contratoDialog) {
                this._F4contratoDialog = sap.ui.xmlfragment("dma.zcockpit.view.fragment.contrato", this);
                this.getView().addDependent(this._F4contratoDialog);
            }
            // Filtro Comprador - Codigo
            var fEkgrp = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
            aFilters.push(fEkgrp);
            // Filtro Fornecedor - Codigo
            var fLifnr = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr.toUpperCase());
            aFilters.push(fLifnr);
            // open value help dialog filtered by the input value
            this._F4contratoDialog.getBinding("items").filter(aFilters);
            this._F4contratoDialog.open(sInputValue);
        },
        clearContrato: function (oEvent) {
            var contratoInput = this.byId("contratoInput");
            contratoInput.setValue("");
            contratoInput.setDescription("");
            this.habilitaBotaoPedido();
        },
        _handleF4contratoSearch: function (oEvent) {
            var aFilters = [];
            // Filtro Contrato
            var sEbeln = oEvent.getParameter("value");
            var oContr = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sEbeln.toUpperCase());
            aFilters.push(oContr);
            // Filtro Comprador - Codigo
            var sEkgrp = this.byId("compradorInput").getValue();
            var oCompr = new sap.ui.model.Filter("Ekgrp", sap.ui.model.FilterOperator.EQ, sEkgrp.toUpperCase());
            aFilters.push(oCompr);
            // Filtro Fornecedor - Codigo
            var sLifnr = this.byId("fornecedorInput").getValue();
            var oFornec = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.EQ, sLifnr.toUpperCase());
            aFilters.push(oFornec);
            // Grava Filtros
            this._F4contratoDialog.getBinding("items").filter(aFilters);
        },
        _handleF4contratoClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var contratoInput = this.getView().byId(this.inputId);
                contratoInput.setValue(oSelectedItem.getTitle());
                contratoInput.setDescription(oSelectedItem.getDescription());
            }
            oEvent.getSource().getBinding("items").filter([]);
            this.habilitaBotaoPedido();
        },
        montaFiltros: function (aFilters, sPedido) {
            // Filtro Comprador
            var sEkgrp = this.byId("compradorInput").getValue();
            var sLifnr = this.byId("fornecedorInput").getValue();

            if ((sEkgrp === "") || (sLifnr === "")) {
                aFilters = null;
            } else {


                let orNodes = [];
                for (let item of this._hieraquiaInput.getTokens()) {
                    orNodes.push(new sap.ui.model.Filter("Node6", sap.ui.model.FilterOperator.EQ, item.mProperties.key));
                }
                let orFilterNodes = new sap.ui.model.Filter({
                    filters: orNodes,
                    and: false
                });
                if (orNodes.length > 0) {
                    aFilters.push(orFilterNodes);
                }

                // Filtro Comprador
                var fEkgrp = new sap.ui.model.Filter({
                    path: "Ekgrp",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sEkgrp.toUpperCase()
                });
                aFilters.push(fEkgrp);
                // Filtro Fornecedor
                var fLifnr = new sap.ui.model.Filter({
                    path: "Lifnr",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sLifnr.toUpperCase()
                });
                aFilters.push(fLifnr);
                // Filtro UF
                var sUF = this.byId("UFInput");
                if (sUF.getTokens().length > 0) {
                    for (var iUF = 0; iUF < sUF.getTokens().length; iUF++) {
                        aFilters.push(new sap.ui.model.Filter({
                            path: "UF",
                            operator: sap.ui.model.FilterOperator.EQ,
                            value1: sUF.getTokens()[iUF].getText()
                        }));
                    }
                }

                // Filtro Bandeira
                var sBandeira = this.byId("grupoLojasInput");
                if (sBandeira.getTokens().length > 0) {
                    for (var iBand = 0; iBand < sBandeira.getTokens().length; iBand++) {
                        aFilters.push(new sap.ui.model.Filter({
                            path: "Bandeira",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sBandeira.getTokens()[iBand].getText()
                        }));
                    }
                }
                // // Filtro Loja
                var sLojas = this.byId("lojasInput");
                if (sLojas.getTokens().length > 0) {
                    for (var iLojas = 0; iLojas < sLojas.getTokens().length; iLojas++) {
                        aFilters.push(new sap.ui.model.Filter(
                            "Werks",
                            sap.ui.model.FilterOperator.EQ,
                            sLojas.getTokens()[iLojas].getText()
                        ));
                    }
                }
                // Filtro Contrato
                var sEbeln = this.byId("contratoInput").getValue();
                if (sEbeln !== "") {
                    var fEbeln = new sap.ui.model.Filter({
                        path: "Ebeln",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sEbeln.toUpperCase()
                    });
                    aFilters.push(fEbeln);
                }

                // Filtro Fonte de suprimentos
                var sSobsl = this.byId("idFsuprimentos").getValue();
                if (sSobsl !== "") {
                   var fSobsl = new sap.ui.model.Filter({
                       path: "Sobsl",
                       operator: sap.ui.model.FilterOperator.EQ,
                       value1: sSobsl.toUpperCase()
                   });
                   aFilters.push(fSobsl);
                }
                
                // Filtro Produtos 
                if (sPedido) {
                    var sMatnr = this.byId("idProdutos").getSelectedContexts(true);
                    if (sMatnr && sMatnr.length > 0) {
                        var globalModel = this.getModel("globalModel");
                        globalModel.setProperty("/Matnr", sMatnr);
                        var orArray = [];
                        for (var i = 0; i < sMatnr.length; i++) {
                            orArray.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, sMatnr[i].getProperty('Matnr')));
                        }
                        var orFilter = new sap.ui.model.Filter({
                            filters: orArray,
                            and: false
                        });
                        aFilters.push(orFilter);
                    }
                } else {
                    var sBusca = this.byId("buscaProduto").getValue();
                    if (sBusca !== "") {
                        var fMaktx = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, sBusca.toUpperCase());
                        aFilters.push(fMaktx);
                    }
                }
            }
        },
        /* Busca de Produtos */
        filtraProdutos: function (bNoRefresh) {
            // update list binding
            var oList = this.byId("idProdutos");

            // add filter for search
            var aFilters = [];
            this.montaFiltros(aFilters, false);
            oList.getBinding("items").filter(aFilters);

            // // update list binding
            oList.getModel().refresh(true);

            // if (!bNoRefresh) {
            // 	oList.getModel().updateBindings(true);
            // }
        },
        setCheckProduto: function (oEvent) {
            let oList = this.byId("idProdutos");
            var listItems = oList.getItems();
            for (let i = 0; i < listItems.length; i++) {
                listItems[i].setSelected(true);
            }
            var oLabel = this.byId("idCountSelected");
            var oInfoToolbar = this.byId("idInfoToolbar");
            var aContexts = oList.getSelectedContexts(true);
            var bSelected = aContexts && aContexts.length > 0;
            var sText = bSelected ? aContexts.length + " produtos selecionados" : null;
            oInfoToolbar.setVisible(bSelected);
            oLabel.setText(sText);
        },
        clearSelectedProduto: function (oEvent) {
            var oList = this.byId("idProdutos");
            this.byId("buscaProduto").setValue("");
            oList.removeSelections(true);
            this.byId("idCountSelected").setText('');
            this.byId("idInfoToolbar").setVisible(false);
        },
        onSearchProduto: function (oEvent) {
            this.habilitaBotaoPedido();
        },
        onSelectionChangeProduto: function (oEvent) {
            var oList = oEvent.getSource();
            var oLabel = this.byId("idCountSelected");
            var oInfoToolbar = this.byId("idInfoToolbar");
            // With the 'getSelectedContexts' function you can access the context paths
            // of all list items that have been selected, regardless of any current
            // filter on the aggregation binding.
            var aContexts = oList.getSelectedContexts(true);
            // update UI
            var bSelected = aContexts && aContexts.length > 0;
            var sText = bSelected ? aContexts.length + " produtos selecionados" : null;
            oInfoToolbar.setVisible(bSelected);
            oLabel.setText(sText);
        },
    });
});