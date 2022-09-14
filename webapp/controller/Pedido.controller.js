sap.ui.define(
    [
        'dma/zcockpit/controller/BaseController',
        'sap/ui/model/json/JSONModel',
        'dma/zcockpit/model/formatter',
        'sap/m/MessageToast',
        'sap/m/Dialog',
        'sap/m/DialogType',
        'sap/m/ButtonType',
        'sap/m/MessageBox',
        'sap/ui/core/routing/History',
        'sap/ui/model/Sorter',
        'sap/ui/model/Filter',
        'sap/ui/model/FilterOperator',
    ],
    function (
        BaseController,
        JSONModel,
        formatter,
        MessageToast,
        Dialog,
        DialogType,
        ButtonType,
        MessageBox,
        History,
        Sorter,
        Filter,
        FilterOperator
    ) {
        'use strict';
        var sResponsivePaddingClasses =
            'sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer';
        return BaseController.extend('dma.zcockpit.controller.Pedido', {
            _oTablePedidoHeader: null,
            _segVenda: null,
            _segPedido: null,
            _oTablePedido: null,
            formatter: formatter,
            onInit: function () {
                this.initWSocket();

                this.getRouter()
                    .getRoute('pedido')
                    .attachPatternMatched(this.onObjectMatched, this);

                this._oTablePedidoHeader = this.getView().byId('tablePedidoHeader');
                this._oTablePedido = this.getView().byId('tablePedido');
                this._segVenda = this.getView().byId('_segVenda');
                this._segPedido = this.getView().byId('_segPedido');
                this.initModelView();
                //FAFN - Begin
                if (!this._oColumnFilterPopover) {
                    this._oColumnFilterPopover = sap.ui.xmlfragment(
                        'dma.zcockpit.view.fragment.FilterColumn',
                        this
                    );
                    this._oColumnFilterPopover.setModel(this.getView().getModel());
                }
                this._oTablePedidoHeader.addEventDelegate({
                    onAfterRendering: () => {
                        var oHeader = this._oTablePedidoHeader
                            .$()
                            .find('.sapMListTblHeaderCell');
                        for (var i = 0; i < oHeader.length; i++) {
                            var oID = oHeader[i].id;
                            this.onClickColumnHeader(oID);
                        }
                    },
                },
                    this._oTablePedidoHeader
                );
            
              $(`#${this._oTablePedido.sId}`).scroll(()=> { 
                    this.checkSelectedRow(null) 
              });

              $(`#content`).scroll(()=> { 
                    this.checkSelectedRow(null) 
              });

               this._oTablePedido.addEventDelegate({
                    onAfterRendering: () => {
                   
                       this.checkSelectedRow(null) 
                    },
                },
                    this._oTablePedido
                );

                //FAFN - End
                this.getView().byId('_i_pedido_0').setColor('#f00000');
            },
            initModelView: function () {
                this.getView().setModel(
                    new JSONModel({ isNodeLevel: false, isProductLevel: false }),
                    'pedidoView'
                );
            },
            setTableLevelNode: function (bIsNode) {
                this.getView()
                    .getModel('pedidoView')
                    .setProperty('/isNodeLevel', bIsNode);
                this.getView()
                    .getModel('pedidoView')
                    .setProperty('/isNodeLevel', !bIsNode);
            },
            //FAFN - Begin
            onClickColumnHeader: function (oID) {
                let sID = oID;
                $('#' + oID).click((oEvent) => {
                    //Attach Table Header Element Event
                    let sBinding = sap.ui
                        .getCore()
                        .byId(
                            oEvent.currentTarget.childNodes[0].childNodes[0].childNodes[0].id
                        )
                        .data('binding');
                    // let bfilter = sap.ui.getCore().byId(oEvent.currentTarget.childNodes[0].id).data('filter') === "true";
                    // sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({showFilter: bfilter }),"columnFilter");
                    // this._oColumnFilterPopover.bindingValue = sBinding; //Save the key value to property
                    // this._oColumnFilterPopover.showFilter = bfilter; //Save the key value to property
                    // this._oColumnFilterPopover.openBy(oEvent.currentTarget);
                    this.onClickOrder(oEvent, this._oTablePedido, sBinding);
                });
            },
            _getDialogLojaSum: function () {
                if (!this._oDialogLojaSum) {
                    this._oDialogLojaSum = sap.ui.xmlfragment(
                        'idLojasSum',
                        'dma.zcockpit.view.fragment.lojasSum',
                        this
                    );
                    this.getView().addDependent(this._oDialogLojaSum);
                }
                return this._oDialogLojaSum;
            },
            closeLojaSumDialog: function () {
                this._oDialogLojaSum.close();
                this.updateTable();
                this.updateTotal();
            },
            onOpenDialogLojaSum: function () {
                let aFilters = [];
                this._getDialogLojaSum().open();
                var globalModel = this.getModel('globalModel');
                let sEkgrp = globalModel.getProperty('/Ekgrp');
                let sLifnr = globalModel.getProperty('/Lifnr');
                aFilters.push(
                    new sap.ui.model.Filter(
                        'Ekgrp',
                        sap.ui.model.FilterOperator.EQ,
                        sEkgrp
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'Lifnr',
                        sap.ui.model.FilterOperator.EQ,
                        sLifnr
                    )
                );
                var oTable = sap.ui.getCore().byId('idLojasSum--idLojaSumTabela');
                var oItems = oTable.getBinding('items');
                oItems.filter(aFilters);
            },
            onDeleteLojaSum: function (oEvent) {
                let sBindContext = oEvent.getParameter('listItem').getBindingContext();
                let oTable = sap.ui.getCore().byId('idLojasSum--idLojaSumTabela');

                MessageBox.confirm(this.getText('eliminaLoja'), {
                    title: this.getText(sBindContext.getProperty('Werks')),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.YES,
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.YES) {
                            oTable.setBusy(true);
                            this.getView()
                                .getModel()
                                .remove(sBindContext.sPath, {
                                    success: (res) => {
                                        oTable.setBusy(false);
                                        MessageToast.show(
                                            this.getText('msg_loja_removida_success'), {}
                                        );
                                    },
                                    error: (err) => {
                                        oTable.setBusy(false);
                                        MessageToast.show(
                                            this.getText('msg_loja_removida_error'), {}
                                        );
                                    },
                                });
                        }
                    },
                });
            },
            recoverSortConfig: function () {
                let oConfigSort = localStorage.getItem('sortConfig') ?
                    JSON.parse(localStorage.getItem('sortConfig')) :
                    null;
                let oItems = this._oTablePedido.getBinding('items');

                if (oConfigSort) {
                    let oIcon = sap.ui.getCore().byId(oConfigSort.sId);
                    if (oIcon) {
                        oIcon.setColor('#f00000');
                        oIcon.setSrc(
                            oConfigSort.isAsc ?
                                'sap-icon://sort-ascending' :
                                'sap-icon://sort-descending'
                        );
                        let oSorter = new Sorter(oConfigSort.field);
                        oSorter.bDescending = !oConfigSort.isAsc;
                        oItems.sort(oSorter, !oConfigSort.isAsc);
                    }
                }
            },
            setSortConfig: function (sField, bIsAsc, sId) {
                let oConfigSort = localStorage.getItem('sortConfig') ?
                    JSON.parse(localStorage.getItem('sortConfig')) :
                    null;
                /*			let oConfigSort = aConfigSort.find((item) => {
                    				return item.field === sField;
                    			})*/
                /*			if (oConfigSort) {
                    				oConfigSort.isAsc = bIsAsc;
                    			} else {*/
                oConfigSort = {
                    field: sField,
                    isAsc: bIsAsc,
                    sId: sId,
                };
                localStorage.setItem('sortConfig', JSON.stringify(oConfigSort));
                //}
            },
            onClickOrder: function (oEvent, oTable, oBinding) {
                let oIcon = sap.ui
                    .getCore()
                    .byId(
                        oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id
                    );
                let sId =
                    oEvent.currentTarget.childNodes[0].childNodes[1].childNodes[0].id;
                let oItems = oTable.getBinding('items');
                let oSorter = new Sorter(oBinding);
                let oColor = oIcon.getColor();
                let oSrc = oIcon.getSrc();

                this.reiniciaIconesSort(false);
                if (oColor === '#808080') {
                    oIcon.setColor('#f00000');
                    oIcon.setSrc('sap-icon://sort-ascending');
                    oItems.sort(oSorter);
                    this.setSortConfig(oBinding, true, sId);
                } else {
                    if (oSrc === 'sap-icon://sort-ascending') {
                        oIcon.setColor('#f00000');
                        oIcon.setSrc('sap-icon://sort-descending');
                        oSorter.bDescending = true;
                        oItems.sort(oSorter, true);
                        this.setSortConfig(oBinding, false, sId);
                    } else {
                        this.reiniciaIconesSort(true);
                        let oSortInitial = new Sorter('Matnr');
                        oItems.sort(oSortInitial);
                        this.setSortConfig('Matnr', true, sId);
                    }
                }
            },
            onFilterPress: function (oEvent) {
                var aFilters = [];
                var iMatnr = this.byId('_input_filter_matnr');
                var iMaktx = this.byId('_input_filter_maktx');
                if (oEvent.getParameters('pressed').pressed) {
                    if (iMatnr.getValue() !== '') {
                        var fMatnr = new sap.ui.model.Filter(
                            'Matnr',
                            sap.ui.model.FilterOperator.Contains,
                            iMatnr.getValue().toUpperCase()
                        );
                        aFilters.push(fMatnr);
                    }

                    if (iMaktx.getValue() !== '') {
                        var fMaktx = new sap.ui.model.Filter(
                            'Maktx',
                            sap.ui.model.FilterOperator.Contains,
                            iMaktx.getValue().toUpperCase()
                        );
                        aFilters.push(fMaktx);
                    }
                } else {
                    iMatnr.setValue('');
                    iMaktx.setValue('');
                }
                var oItems = this._oTablePedido.getBinding('items');
                oItems.filter(aFilters);
            },
            reiniciaIconesSort: function (oFirst) {
                var oQtde = 19; //this._oTablePedido.getAggregation("columns").length;
                for (var i = 0; i < oQtde; i++) {
                    let zIcon = this.byId('_i_pedido_' + i.toString());
                    zIcon.setColor('#808080');
                    zIcon.setSrc('sap-icon://sort-ascending');
                }
                if (oFirst) {
                    let zIcon = this.byId('_i_pedido_0');
                    zIcon.setColor('#f00000');
                    zIcon.setSrc('sap-icon://sort-ascending');
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
            // 	var oItems = this._oTablePedido.getBinding("items");
            // 	oItems.filter(aFilters, "Application");
            // 	this._oColumnFilterPopover.close();
            // },

            // onAscending: function () {
            // 	var oItems = this._oTablePedido.getBinding("items");
            // 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);
            // 	oItems.sort(oSorter);
            // 	this._oColumnFilterPopover.close();
            // },
            // onDescending: function () {
            // 	var oItems = this._oTablePedido.getBinding("items");
            // 	var oSorter = new Sorter(this._oColumnFilterPopover.bindingValue);
            // 	oSorter.bDescending = true;
            // 	oItems.sort(oSorter, true);
            // 	this._oColumnFilterPopover.close();
            // }, //FAFN - End
            //		handleSwipe: function(e) {
            //			// register swipe event
            //			var
            //			//oSwipeListItem = e.getParameter("listItem"),    // get swiped list item from event
            //				oSwipeContent = e.getParameter("swipeContent");
            //			// get swiped content from event
            //			oSwipeContent.setText("Delete").setType("Reject");
            //		},
            onObjectMatched: function (oEvent) {
                
                
                let oPedidoNav = JSON.parse(localStorage.getItem('pedidoNavList'));
                let aPedidoModel = this.getView().getModel('pedidoListModel');
                let aPOSet = aPedidoModel && aPedidoModel.getData ? aPedidoModel.getData().root.parentNode.POSet : [] ; ;
                let pedidoList = [];
                for (let i = 0; i < aPOSet.length; i++) {

                    for (let indexChild = 0; indexChild < aPOSet[i].POSet.length; indexChild++) {
                        for (let itemPO of aPOSet[i].POSet[indexChild].POSet) {

                            pedidoList.push({
                                ...itemPO
                            });
                        }
                    }

                }


                if (oPedidoNav && oPedidoNav.current) {
                    //this.indexPressedItem = oPedidoNav.current - 1;
                    let indexRowMaterial = 0;
                    let itemSelected = pedidoList && pedidoList.length > 0 ? pedidoList[oPedidoNav.current - 1] : [] ;
                    if (itemSelected && this._oTablePedido && this._oTablePedido.getRows) {
                        for (let itemRowTable of this._oTablePedido.getRows()) {
                            let rowData = itemRowTable.getBindingContext('pedidoListModel') ? this.getView().getModel('pedidoListModel').getProperty(itemRowTable.getBindingContext('pedidoListModel').sPath) : null;
                            if (rowData && rowData.Matnr && itemSelected.Matnr === rowData.Matnr) {
                                this.indexPressedItem = indexRowMaterial;
                              
                            }
                              indexRowMaterial++;
                        }



                    }
                }

                localStorage.removeItem('pedidoNavList');
                var localModel = this.getModel();
                var globalModel = this.getModel('globalModel');

                globalModel.setProperty(
                    '/colVlrPedido',
                    this._segPedido.getProperty('selectedKey') === 'real'
                );
                globalModel.setProperty(
                    '/Ekgrp',
                    oEvent.getParameter('arguments').Ekgrp
                );
                globalModel.setProperty(
                    '/Lifnr',
                    oEvent.getParameter('arguments').Lifnr
                );

                globalModel.setProperty(
                    '/Node6',
                    oEvent.getParameter('arguments').Node6
                );

                

                this.updateTable();
                this.updateTotal();
                // this.reiniciaIconesSort();
                this.recoverSortConfig();
                this.getFornecedorInfo();
            },
            getFornecedorInfo: function () {
                var globalModel = this.getModel('globalModel');
                this.getView()
                    .getModel()
                    .read(`/Titulos('${globalModel.getProperty('/Lifnr')}')`, {
                        success: (res) => {
                            this.getView().setModel(new JSONModel(res), 'fornecedorInfo');
                        },
                    });
            },
            // _getDialog: function () {
            // 	// create a fragment with dialog, and pass the selected data
            // 	if (!this.dialog) {
            // 		// This fragment can be instantiated from a controller as follows:
            // 		this.dialog = sap.ui.xmlfragment("idPedCriado", "dma.zcockpit.view.fragment.ped_criado", this);
            // 	}
            // 	return this.dialog;
            // },
            // closeDialog: function () {
            // 	this._getDialog().close();
            // 	this.getRouter().navTo("home", true);
            // },
            updateTable: function () {
                var localModel = this.getModel();
                var globalModel = this.getModel('globalModel');
                var sEkgrp = globalModel.getProperty('/Ekgrp');
                var sLifnr = globalModel.getProperty('/Lifnr'); 
                var sNode6 = globalModel.getProperty('/Node6');

                let aNode6 = sNode6 && sNode6.length > 0 ? sNode6.split(',') : null;

                var sObjectPath = localModel.createKey('/Fornecedor', {
                    Ekgrp: sEkgrp,
                    Lifnr: sLifnr,
                });
                //this._oTablePedido.bindItems({
                /*                this._oTablePedido.bindRows({
                                   //path: sObjectPath + "/PO",
                                   path: sObjectPath + '/POHierarq3',
                                   parameters: { expand: 'POHierarq6Set/POSet' },
                                   template: this._oTablePedido.getBindingInfo('rows').template,
                               }); */
                this.getView()
                    .getModel()
                    .read(sObjectPath + '/POHierarq3', {
                        urlParameters: {
                            $expand: 'POHierarq6Set/POSet'
                        },
                        success: (res) => {

                            let pedidoList = { root: { parentNode: { POSet: [...res.results] } } };
                            let aArrayIndices = [];
                            let indice = 1;
                            let indicePO = 0;

                            for (let index = 0; index < pedidoList.root.parentNode.POSet.length; index++) {
                                pedidoList.root.parentNode.POSet[index].hasNav = false;
                                pedidoList.root.parentNode.POSet[index].Matnr = pedidoList.root.parentNode.POSet[index].Node3;
                                pedidoList.root.parentNode.POSet[index].Maktx = pedidoList.root.parentNode.POSet[index].Node3Text;
                                pedidoList.root.parentNode.POSet[index].POSet = [...pedidoList.root.parentNode.POSet[index].POHierarq6Set.results];

                                for (let indexChild = 0; indexChild < pedidoList.root.parentNode.POSet[index].POSet.length; indexChild++) {

                                    /*if(aNode6 && aNode6.length >0){
                                       if(!aNode6.includes(pedidoList.root.parentNode.POSet[index].POSet[indexChild].Node6)){
                                        continue;
                                       }
                                    }*/

                                    aArrayIndices.push(indice);
                                    indice++;
                                pedidoList.root.parentNode.POSet[index].POSet[indexChild].Matnr = pedidoList.root.parentNode.POSet[index].POSet[indexChild].Node6;
                                pedidoList.root.parentNode.POSet[index].POSet[indexChild].Maktx = pedidoList.root.parentNode.POSet[index].POSet[indexChild].Node6Text;
                                    pedidoList.root.parentNode.POSet[index].POSet[indexChild].hasNav = false;
                                    pedidoList.root.parentNode.POSet[index].POSet[indexChild].POSet = [...pedidoList.root.parentNode.POSet[index].POSet[indexChild].POSet.results];
                                    for (let itemPOIndex of pedidoList.root.parentNode.POSet[index].POSet[indexChild].POSet) {
                                        itemPOIndex.index = indicePO;
                                        indicePO++;
                                    }
                                }

                            }

                            this.setPedidoTableModel(pedidoList, aArrayIndices);
                        },
                    });

                //this._oTablePedido.getBinding("items").refresh();
                //this._oTablePedido.getBinding("rows").refresh();
            },
            setPedidoTableModel: function (oData, aArrayIndices) {
                this.getView().setModel(new JSONModel(oData), 'pedidoListModel');
               // if(this.pathSelectedItem){
                 //this.getView().getModel('pedidoListModel').setProperty(`${this.pathSelectedItem}/isSelected`,true);
                 //this.getView().getModel('pedidoListModel').setProperty(`${this.pathSelectedItem}/sClass`,'selectMaterial');
                 
                //}
                this._oTablePedido.getBinding('rows').refresh();

                this.checkSelectedRow();
                for (let indexNode of aArrayIndices) {
                    this._oTablePedido.expandToLevel(indexNode);
                }

            },
            updateTotal: function () {
                var page = this.byId('fullPage');
                var cabec = this.byId('headerCabecalho');
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var sObjectPath = localModel.createKey('/POSum', {
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Lifnr: globalModel.getProperty('/Lifnr'),
                });

                localModel.read(sObjectPath, {
                    method: 'GET',
                    success: function (oData2, oResponse) {
                        //cabec.setNumber({ path: oData2.Total, formatter: '.format.currencyValue' });
                        globalModel.setProperty('/Total', oData2.Total);
                        globalModel.setProperty('/Fornecedor', oData2.Mcod1);
                    },
                    error: function (oError) { },
                });
            },
            handleDialogFornecedorInfoCancelButton: function () {
                this._oPopoverFornecedorInfo.close();
            },
            onShowSupplierAddtionalInfo: function (oEvent) {
                let globalModel = this.getModel('globalModel');
                if (!this._oPopoverFornecedorInfo) {
                    this._oPopoverFornecedorInfo = sap.ui.xmlfragment(
                        'dma.zcockpit.view.fragment.FornecedorInfo',
                        this
                    );
                    this.getView().addDependent(this._oPopoverFornecedorInfo);
                }
                this._oPopoverFornecedorInfo.openBy(oEvent.getSource());
            },
            onNavBack: function (oEvent) {
                var globalModel = this.getModel('globalModel');

                delete this.indexPressedItem;
                delete this.pathSelectedItem;

                MessageBox.confirm(this.getText('sairPedido'), {
                    title: this.getText('sairPedidoTitulo'),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.YES,
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.YES) {
                            this.getRouter().navTo(
                                'busca', {
                                Ekgrp: globalModel.getProperty('/Ekgrp'),
                                Uname: globalModel.getProperty('/Uname'),
                                Lifnr: '',
                            },
                                true
                            );
                        }
                    },
                });
            },
            onTitleSelectorPress: function (oEvent) {
                var cabec = this.byId('headerCabecalho');
                cabec.setCondensed(!cabec.getCondensed());
            },
            toDetail: function (oEvent) {
                //Prepare list for the next screen navigate between materials
                let pedidoList = [];
                let index = 0;
                this.pathSelectedItem = oEvent.oSource.getBindingContext('pedidoListModel').sPath;
                let aPOSet = this.getView().getModel('pedidoListModel').getData().root.parentNode.POSet;
                let indexBinding = oEvent.oSource.getBindingContext('pedidoListModel').getModel('pedidoListModel').getProperty(oEvent.oSource.getBindingContext('pedidoListModel').sPath).index;
                
                this.getView().getModel('pedidoListModel').setProperty(`${this.pathSelectedItem}/isSelected` ,true);
                //for (let item of this._oTablePedido.getItems()) {
                /*for (let item of this._oTablePedido.getRows()) {
                    index++;
                    pedidoList.push({
                        index: index,
                        ...this.getView()
                            .getModel()
                            .getProperty(item.getBindingContext().sPath),
                    });
                }*/


                for (let i = 0; i < aPOSet.length; i++) {

                    for (let indexChild = 0; indexChild < aPOSet[i].POSet.length; indexChild++) {
                        for (let itemPO of aPOSet[i].POSet[indexChild].POSet) {
                            index++;
                            pedidoList.push({
                                index: index,
                                ...itemPO
                            });
                        }
                    }

                }

                //highlight kinha pressionada
                /*this.indexPressedItem = oEvent
                    .getSource()
                    .getParent()
                    //.getItems()
                    .getRows()
                    .findIndex((item) => {
                        return item.sId === oEvent.mParameters.id;
                    });*/
                this.indexPressedItem = this._oTablePedido.getRows()
                    .findIndex((item) => {
                        return item.sId === oEvent.oSource.getParent().sId;
                    });

                let pedidoNavList = {
                    current: indexBinding + 1,//this.indexPressedItem + 1,
                    list: pedidoList,
                    currentRow: this.indexPressedItem + 1,
                    size: pedidoList.length,
                };
                localStorage.setItem('pedidoNavList', JSON.stringify(pedidoNavList));

                var globalModel = this.getModel('globalModel');
                //var sMatnr = oEvent.getSource().getAggregation('cells')[0].getTitle();
                var sMatnr = pedidoList[indexBinding].Matnr;
                globalModel.setProperty('/Matnr', sMatnr);
                //var sMaabc = oEvent.getSource().getAggregation('cells')[19].getText();
                var sMaabc = pedidoList[indexBinding].Maabc;
                globalModel.setProperty('/codABC', sMaabc);
                this.getRouter().navTo(
                    'detail', {
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Lifnr: globalModel.getProperty('/Lifnr'),
                    Matnr: sMatnr,
                    Werks: globalModel.getProperty('/Werks'),
                },
                    true
                );
            },
            onUpdateFinished: function (oEvt) {
                if (!oEvt.getSource().sId.includes('tablePedido')) {
                    return;
                }
                for (
                    let index = 0; index < oEvt.getSource().getItems().length; index++
                ) {
                    const element = oEvt.getSource().getItems()[index];
                    element.removeStyleClass('selecetMaterial');
                    if (this.indexPressedItem >= 0 && this.indexPressedItem === index) {
                        element.addStyleClass('selecetMaterial');
                        // oEvt.getSource().setFirstVisibleRow(index);
                        //element.getDomRef().scrollIntoView();
                    }
                }
            },
            checkSelectedRow: function (oEvt) {
                return;
                //this.pathSelectedItem = oEvent.oSource.getBindingContext('pedidoListModel').sPath;

                for (
                    let index = 0; index < this._oTablePedido.getRows().length; index++
                ) {
                    const element = this._oTablePedido.getRows()[index];
                    const elementRow = $(`#${element.sId}`);
                     element.getCells()[0].removeStyleClass('selectMaterial');
                    elementRow.removeClass('selectMaterial');
                    if (this.pathSelectedItem && this.pathSelectedItem === element.getBindingContext('pedidoListModel').sPath) {
                    //if (this.indexPressedItem >= 0 && this.indexPressedItem === index) {
                        elementRow.addClass('selectMaterial');
                          element.getCells()[0].addStyleClass('selectMaterial');   
                        // oEvt.getSource().setFirstVisibleRow(index);
                        //element.getDomRef().scrollIntoView();
                    }
                }
            },
            onDeletePress: function (oEvent) {
                var //oTable = oEvent.getSource(),
                    oTable = this.getView().byId('tablePedido'),
                    oItem = oEvent.getParameter('listItem'),
                    sPath = oEvent.oSource.getBindingContext('pedidoListModel').sPath;
                //oTable.attachEventOnce("updateFinished", oTable.focus, oTable);
                var oModel = this.getView().getModel('pedidoListModel');
                //oModel.remove(sPath);
                //oModel.remove(sPath);
                /* update tela */
                oModel.oData.root.parentNode.POSet[sPath.split('/')[4]].POSet[sPath.split('/')[6]].POSet.splice(sPath.split('/')[8],1);
                oModel.refresh();

                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var sObjectPath = localModel.createKey('/Fornecedor', {
                    Ekgrp: oModel.getProperty(sPath+'/Ekgrp'),
                    Lifnr: oModel.getProperty(sPath+'/Lifnr'),
                });
                this.updateTotal();
            },
            onResetPedido: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var sObjectPath = localModel.createKey('/Fornecedor', {
                    Werks: globalModel.getProperty('/Werks'),
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Lifnr: globalModel.getProperty('/Lifnr'),
                });
                localModel.read(sObjectPath + '/POReset', {
                    method: 'GET',
                    success: function (oData2, oResponse) {
                        this.updateTotal();
                        localModel.setRefreshAfterChange(true);
                        this._oTablePedido.getBinding('items').refresh();
                    },
                    error: function (oError) { },
                });
            },
            onSelValorPedido: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                globalModel.setProperty(
                    '/colVlrPedido',
                    this._segPedido.getProperty('selectedKey') === 'real'
                );
                //this._VendaMM
            },
            onOpenPedidoProgressDialog: function (oEvent) {
                this.getView().setModel(
                    new sap.ui.model.json.JSONModel({ text: '' }),
                    'pedidoProgress'
                );
                // instantiate dialog
                if (!this._pedidoBusyDialog) {
                    this._pedidoBusyDialog = sap.ui.xmlfragment(
                        'dma.zcockpit.view.fragment.PedidoProgressBusyDialog',
                        this
                    );
                    this.getView().addDependent(this._pedidoBusyDialog);
                }

                // open dialog
                jQuery.sap.syncStyleClass(
                    'sapUiSizeCompact',
                    this.getView(),
                    this._pedidoBusyDialog
                );
                this._pedidoBusyDialog.open();

                // simulate end of operation
                /*_timeout = jQuery.sap.delayedCall(10000, this, function () {
                        this._pedidoBusyDialog.close();
                    });*/
            },
            setMessagePedidoProgressDialog: function (sText) {
                this.getView().getModel('pedidoProgress').setProperty('/text', sText);
            },
            onPedidoProgressDialogClosed: function (oEvent) { },
            initWSocket: function () {
                let hostLocation = window.location,
                    socket,
                    socketHostURI,
                    webSocketURI;
                if (hostLocation.protocol === 'https:') {
                    socketHostURI = 'wss:';
                } else {
                    socketHostURI = 'ws:';
                }
                socketHostURI += '//' + hostLocation.host;
                webSocketURI = socketHostURI + '/sap/bc/apc/sap/zcockpit_comercial';

                try {
                    socket = new WebSocket(webSocketURI);
                    socket.onopen = (e) => {
                        console.log('Socket Connected');
                    };
                    socket.onerror = (e) => {
                        console.log('Socket Erro');
                    };

                    //Create function for handling websocket messages
                    socket.onmessage = (oMsg) => {
                        let oMessage = JSON.parse(oMsg.data);
                        if (oMessage.idMessage !== this.idMessage) {
                            return;
                        }

                        if (
                            oMessage.message &&
                            oMessage.message.length > 0 &&
                            oMessage.failed
                        ) {
                            sap.m.MessageBox.error(
                                this.getText('erro_criacao_pedido') + '\n' + oMessage.message, {
                                title: this.getText('pedido_nao_criado'),
                                actions: [MessageBox.Action.OK],
                                initialFocus: MessageBox.Action.OK,
                                styleClass: sResponsivePaddingClasses,
                            }
                            );
                            return;
                        }

                        if (oMessage.complete) {
                            this._pedidoBusyDialog.close();
                            this.dialogoCriaPedido(oMessage.list, null);
                        } else {
                            this.setMessagePedidoProgressDialog(
                                this.getTextWithParams('pedido_status', [
                                    oMessage.createdCount.toString(),
                                    oMessage.totalCount.toString(),
                                ])
                            );
                        }
                    };
                    socket.onclose = (e) => {
                        console.log('Socket Closed');
                    };
                } catch (exception) { }
            },
            onCriaPedido: function (oEvent) {
                var oView = this.getView();
                //sap.ui.core.BusyIndicator.show();
                this.onOpenPedidoProgressDialog();
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var dt_remessa = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: 'YYYYMMdd',
                }).format(globalModel.getProperty('/DtRemessa'));

                var sObjectPath = localModel.createKey('/POCria', {
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Lifnr: globalModel.getProperty('/Lifnr'),
                    TpPedido: globalModel.getProperty('/TpPedido'),
                    DtRemessa: dt_remessa,
                });
                var that = this;
                localModel.read(sObjectPath, {
                    method: 'GET',
                    success: (oData2, oResponse) => {
                        sap.ui.core.BusyIndicator.hide();
                        this.idMessage = oData2.Mensagem;
                        return;
                        if (oData2.Nroseq > 0) {
                            this.dialogoCriaPedido(oData2, oData2.Nroseq);
                            // sap.m.MessageBox.success("Número de pedidos criados: " + oData2.Ebeln.toString() + "\n" +
                            // 	oData2.Mensagem, {
                            // 		title: "Pedido Criado com sucesso",
                            // 		onClose: that.getRouter().navTo("busca", {
                            // 			Ekgrp: globalModel.getProperty("/Ekgrp"),
                            // 			Uname: globalModel.getProperty("/Uname"),
                            // 			Lifnr: ""
                            // 		}, true),
                            // 		//details: oData2.Mensagem,
                            // 		actions: [MessageBox.Action.OK],
                            // 		initialFocus: MessageBox.Action.OK,
                            // 		styleClass: sResponsivePaddingClasses
                            // 	});
                        } else {
                            sap.m.MessageBox.error(
                                this.getText('erro_criacao_pedido') + '\n' + oData2.Mensagem, {
                                title: this.getText('pedido_nao_criado'),
                                actions: [MessageBox.Action.OK],
                                initialFocus: MessageBox.Action.OK,
                                //details: oData2.Mensagem,
                                styleClass: sResponsivePaddingClasses,
                            }
                            );
                        }
                    },
                    error: (oError) => {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.error('Erro', {
                            title: this.getText('pedido_nao_criado'),
                            initialFocus: null,
                            styleClass: sResponsivePaddingClasses,
                        });
                    },
                });
            },
            /* Diálogo Pedidos Criados */
            dialogoCriaPedido: function (oData2, pNroSeq) {
                this.getView().setModel(
                    new sap.ui.model.json.JSONModel(oData2),
                    'PedCriado'
                );
                var aFilters = [];
                if (!this._PedCriadoDialog) {
                    this._PedCriadoDialog = sap.ui.xmlfragment(
                        'dma.zcockpit.view.fragment.ped_criado',
                        this
                    );
                    this.getView().addDependent(this._PedCriadoDialog);
                }
                /*aFilters.push(new sap.ui.model.Filter(
                        "Nroseq",
                        sap.ui.model.FilterOperator.EQ,
                        pNroSeq
                    ));
                    this._PedCriadoDialog.getContent()[0].getBinding("items").filter(aFilters);*/
                this._PedCriadoDialog.open();
            },
            _handlePedCriadoPrint: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();

                var tbl_items = this._PedCriadoDialog.getContent()[0].getItems();
                var sEbeln = '';
                for (var i = 0; i < tbl_items.length; i++) {
                    if (i !== 0) {
                        sEbeln = sEbeln + ',';
                    }
                    sEbeln =
                        sEbeln +
                        tbl_items[i].getAggregation('cells')[0].getProperty('text');
                }
                var sObjectPath = localModel.createKey('/PrnPedido', {
                    Ebeln: sEbeln,
                });
                var sURL = localModel.sServiceUrl + sObjectPath + '/$value';
                window.open(sURL, '_blank');
            },
            _handlePedCriadoEmail: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var aFilters = [];

                var tbl_items = this._PedCriadoDialog.getContent()[0].getItems();
                var sEbeln = '';
                for (var i = 0; i < tbl_items.length; i++) {
                    if (i !== 0) {
                        sEbeln = sEbeln + ',';
                    }
                    sEbeln =
                        sEbeln +
                        tbl_items[i].getAggregation('cells')[0].getProperty('text');
                }
                aFilters.push(
                    new sap.ui.model.Filter(
                        'Ebeln',
                        sap.ui.model.FilterOperator.EQ,
                        sEbeln
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'emailComprador',
                        sap.ui.model.FilterOperator.EQ,
                        sap.ui.getCore().byId('idPopoverEmail--emailComprador').getValue()
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'ckbComprador',
                        sap.ui.model.FilterOperator.EQ,
                        sap.ui.getCore().byId('idPopoverEmail--ckbComprador').getSelected()
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'emailFornecedor',
                        sap.ui.model.FilterOperator.EQ,
                        sap.ui.getCore().byId('idPopoverEmail--emailFornecedor').getValue()
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'ckbFornecedor',
                        sap.ui.model.FilterOperator.EQ,
                        sap.ui.getCore().byId('idPopoverEmail--ckbFornecedor').getSelected()
                    )
                );
                aFilters.push(
                    new sap.ui.model.Filter(
                        'ckbLojas',
                        sap.ui.model.FilterOperator.EQ,
                        sap.ui.getCore().byId('idPopoverEmail--ckbLojas').getSelected()
                    )
                );
                sap.ui.core.BusyIndicator.show();
                localModel.read('/MailPedidoSend', {
                    method: 'GET',
                    filters: aFilters,
                    success: function (oData2, oResponse) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageBox.success(this.getText('email_sucesso'), {
                            title: 'Email',
                            actions: [MessageBox.Action.OK],
                            initialFocus: MessageBox.Action.OK,
                            styleClass: sResponsivePaddingClasses,
                        });
                    },
                    error: function (oError) { },
                });
            },
            _openPedCriadoEmail: function (oEvent) {
                var oButton = oEvent.getSource();
                if (!this._popoverEmail) {
                    this._popoverEmail = sap.ui.xmlfragment(
                        'idPopoverEmail',
                        'dma.zcockpit.view.fragment.popoverEmail',
                        this
                    );
                    this.getView().addDependent(this._popoverEmail);
                }

                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var sObjectPath = localModel.createKey('/MailPedidoGet', {
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Lifnr: globalModel.getProperty('/Lifnr'),
                });

                localModel.read(sObjectPath, {
                    method: 'GET',
                    success: function (oData2, oResponse) {
                        //cabec.setNumber({ path: oData2.Total, formatter: '.format.currencyValue' });
                        sap.ui
                            .getCore()
                            .byId('idPopoverEmail--emailComprador')
                            .setValue(oData2.Comprador);
                        sap.ui
                            .getCore()
                            .byId('idPopoverEmail--emailFornecedor')
                            .setValue(oData2.Fornecedor);
                    },
                    error: function (oError) { },
                });

                this._popoverEmail.openBy(oButton);
            },
            _handlePedCriadoClose: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                this.getRouter().navTo('busca', {
                    Ekgrp: globalModel.getProperty('/Ekgrp'),
                    Uname: globalModel.getProperty('/Uname'),
                    Lifnr: '',
                });
            },
            toPrint: function (oEvent) {
                var globalModel = this.getModel('globalModel');
                var localModel = this.getModel();
                var sEkgrp = globalModel.getProperty('/Ekgrp');
                var sLifnr = globalModel.getProperty('/Lifnr');

                MessageBox.confirm(this.getText('deseja_espelho'), {
                    title: this.getText('espelho_pedido'),
                    actions: [
                        this.getText('analitico'),
                        this.getText('sintetico'),
                        MessageBox.Action.CANCEL,
                    ],
                    emphasizedAction: this.getText('analitico'),
                    initialFocus: this.getText('analitico'),
                    onClose: (oAction) => {
                        if (oAction === this.getText('analitico')) {
                            var sObjectPath = localModel.createKey('/PrnMateriaisLojas', {
                                Ekgrp: sEkgrp,
                                Lifnr: sLifnr,
                            });
                            var sURL = localModel.sServiceUrl + sObjectPath + '/$value';
                            window.open(sURL, '_blank');
                        }
                        if (oAction === this.getText('sintetico')) {
                            var sObjectPath = localModel.createKey('/PrnMaterial', {
                                Ekgrp: sEkgrp,
                                Lifnr: sLifnr,
                            });
                            var sURL = localModel.sServiceUrl + sObjectPath + '/$value';
                            window.open(sURL, '_blank');
                        }
                    },
                });
            },
        });
    }
);