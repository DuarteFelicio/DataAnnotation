import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { DragDropContext } from "react-beautiful-dnd";
import DroppableComp from "../components/DroppableComp.js"
import ModalComp from '../components/ModalComp.js'
import { Form, Accordion } from 'react-bootstrap'
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import SvgIcon from '@material-ui/core/SvgIcon';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import Collapse from '@material-ui/core/Collapse';
import { successMessage, dangerMessage } from '../components/AlertComp'
import TableComp from '../components/TableComp.js'
import AccordionComp from '../components/AccordionComp'
import zIndex from '@material-ui/core/styles/zIndex';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const StyledTreeItem = withStyles((theme) => ({
    iconContainer: {
        '& .close': {
            opacity: 0.3,
        },
    },
    group: {
        width: 1000,
        marginLeft: 7,
        marginBottom: 10,
        marginTop:8,
        paddingLeft: 18,
        borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
    },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

function MinusSquare(props) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 16, height: 16 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
        </SvgIcon>
    );
}

function PlusSquare(props) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 16, height: 16 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
        </SvgIcon>
    );
}

function CloseSquare(props) {
    return (
        <SvgIcon className="close" fontSize="inherit" style={{ width: 16, height: 16 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
        </SvgIcon>
    );
}

function TransitionComponent(props) {
    return (
        
        <animated.div >
            <Collapse {...props} />
        </animated.div>
    );
}

export class Analysis extends Component {
    static displayName = Analysis.name;

    constructor(props) {
        super(props)
        this.state = {
            Nome: "",
            NumLinhas: 0,
            NumColunas: 0,
            DataGeracao: "",
            GeoDivisoes: [],
            Dimensoes: [],
            Metricas_Categorias: [],
            Metricas_Colunas: [],
            Niveis_De_Detalhe: undefined,
            onShowLoadModal: false,
            loadVersion: [],
            selectedVersion:'',
            requestVersion: true,
            openSidePanel: false,
            onShowWarningModal: false,
            panelColumn: "",
            dragResult: "",
            alertMessage: null,
            firstRows: undefined,
            currentVersion: ""
        }
        this.handleOnChange = this.handleOnChange.bind(this)
        this.handleOnToggleVersion = this.handleOnToggleVersion.bind(this)
        this.enableLoadModal = this.enableLoadModal.bind(this)        
        this.disableLoadModal = this.disableLoadModal.bind(this)    
        this.onLoadVersionClick = this.onLoadVersionClick.bind(this)
        this.onSaveClick = this.onSaveClick.bind(this)
        this.onDownloadClick = this.onDownloadClick.bind(this)
        this.enableSidePanel = this.enableSidePanel.bind(this)
        this.enableWarning = this.enableWarning.bind(this)
        this.disableWarning = this.disableWarning.bind(this)
        this.changeClassifier = this.changeClassifier.bind(this)
        this.showColumnDetails = this.showColumnDetails.bind(this)
        this.deleteVersion = this.deleteVersion.bind(this)
        this.closeAlert = this.closeAlert.bind(this)
    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        let id = this.props.match.params.id
        let paramsString = this.props.location.search
        const params = new URLSearchParams(paramsString);
        const version = params.get('Version');
        if (version === null) {
            fetch(`Workspace/ReturnAnalysis?fileId=${id}`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
                .then(metadata => {
                    this.newMetainformation(metadata, "most recent")
                })
        }
        else {
            fetch(`Workspace/ReturnAnalysisVersion?fileId=${id}&fileName=${version}`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
                .then(metadata => {
                    this.newMetainformation(metadata, version)
                })
        }
    }

    newMetainformation(metadata, version) {
        this.setState({
            Nome: metadata.Nome.split('.')[0],
            NumLinhas: metadata.NumLinhas,
            NumColunas: metadata.NumColunas,
            DataGeracao: metadata.DataGeracao,
            GeoDivisoes: metadata.GeoDivisoes,
            Dimensoes: metadata.Dimensoes,
            Metricas_Categorias: metadata.Metricas.Categorias,
            Metricas_Colunas: metadata.Metricas.Colunas,
            currentVersion: version
        }, this.generateDetailLevels)
    }

    enableSidePanel(elem) {
        this.setState({
            openSidePanel: true,
            panelColumn: elem
        })
    }

    async enableLoadModal() {
        let id = this.props.match.params.id
        const token = await authService.getAccessToken();
        if (this.state.requestVersion) {

            fetch(`Workspace/ListAnalysis?fileId=${id}`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
                .then(arrayRet => {
                    console.log(arrayRet)
                    this.setState({
                        onShowLoadModal: true,
                        loadVersion: arrayRet,
                        requestVersion: false
                    })
                })
        }
        else {
            this.setState({
                onShowLoadModal: true,
            })
        }
    }

    disableLoadModal() {
        this.setState({
            onShowLoadModal: false
        })
    }

    enableWarning() {
        this.setState({ onShowWarningModal:true })
    }

    disableWarning() {
        this.setState({ onShowWarningModal: false, dragResult: "" })
    }
        

    handleOnChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleOnToggleVersion(e) {
        this.setState({
            [e.target.name]: e.target.id,
        })
    }

    /*Gerar árvore*/
    generateDetailLevels() {       
        let array = []
        let columns = []      
        this.state.Metricas_Colunas.forEach(col => {
            if (col.CategoriaId !== null) {
                if (columns[col.CategoriaId] === undefined) {
                    columns[col.CategoriaId] = [col]
                }
                else {
                    columns[col.CategoriaId].push(col)
                }
            }            
        })

        let categories_copy = JSON.parse(JSON.stringify(this.state.Metricas_Categorias))
        categories_copy.forEach(c => {           
            c.columns = columns[c.CategoriaId]
            if (c.CategoriaPaiId === null) {
                array[0] = c
            }
            else {
                if (array[c.CategoriaPaiId] === undefined) {
                    array[c.CategoriaPaiId] = [c]
                }
                else {
                    array[c.CategoriaPaiId].push(c)
                }
            }
        })
        if (array[0] === undefined) return
        if (array[0].CategoriaId === undefined) return
        array[0].children = this.recursiveOrganize(array[0], array, columns)
        this.setState({
            Niveis_De_Detalhe: array[0]
        })
    }

    recursiveOrganize(categoria, array) {
        let children = array[categoria.CategoriaId]
        if (children === undefined) return []
        children.forEach(c => {
            c.children = this.recursiveOrganize(c, array)
        })
        return children
    }
    /**/

    /* Métodos auxiliares para onDragEnd*/
    id2List = {
        dimensoes: 'Dimensoes',
        metricas: 'Metricas_Colunas',
    };

    getList(id) {
        let list = this.id2List[id]
        if (list === undefined) {
            return this.getCategoryColumns(this.state.Niveis_De_Detalhe, id)
        }
        return this.state[this.id2List[id]]
    }

    getCategoryColumns(category, id) {
        if (category.CategoriaId === parseInt(id)) {
            return category.columns
        } else if (category.children !== undefined) {
            var i;
            var result = null;
            for (i = 0; result == null && i < category.children.length; i++) {
                result = this.getCategoryColumns(category.children[i], id);
            }
            return result;
        }
        return null;
    }

    setCategoryColumns(category, id, newColumns) {
        if (category.CategoriaId === parseInt(id)) {
            category.columns = newColumns
            return category
        }
        category.children.forEach(child => {
            this.setCategoryColumns(child, id, newColumns)
        })
        return category
    }

    async getDimension(IndiceColuna, NomeColuna) {
        let id = this.props.match.params.id
        const token = await authService.getAccessToken();
        let res = await (await fetch(`Workspace/MetricToDimension?fileId=${id}&colName=${NomeColuna}&colId=${IndiceColuna}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })).json()
        let typeValues = []
        res.tipoValores.forEach(elem => {
            let newElem = {
                Tipo: elem.tipo,
                Count: elem.count
            }
            typeValues.push(newElem)
        })
        console.log(typeValues)
        return {
            IndiceColuna: res.indiceColuna,
            NomeColuna: res.nomeColuna,
            NumValoresUnicos: res.numValoresUnicos,
            NumValoresNulos: res.numValoresNulos,
            TipoDominioGeo: res.tipoDominioGeo,
            TodosDiferentes: res.todosDiferentes,
            TipoValores: typeValues,
            ValoresUnicos: res.valoresUnicos
        }
    }

    async changeClassifier() {
        let source = this.state.dragResult.source
        let destination = this.state.dragResult.destination
        let cases = this.state.dragResult.case

        let sourceColumns = this.getList(source.droppableId)
        let destinationColumns = this.getList(destination.droppableId)
        const [removed] = sourceColumns.splice(source.index, 1);
        let index

        switch (cases) {
            case 'DM': 
                let newMetric = { IndiceColuna: removed.IndiceColuna, NomeColuna: removed.NomeColuna, CategoriaId: null, E_Total: false }
                destinationColumns.splice(destination.index, 0, newMetric);
                this.setState({ Dimensoes: sourceColumns, Metricas_Colunas: destinationColumns })
                break;
            case 'MD':        
                if (removed.CategoriaId !== null) {
                    let headCopy = this.state.Niveis_De_Detalhe
                    let categoryList = this.getList(removed.CategoriaId);
                    index = categoryList.findIndex(column => (column.NomeColuna === removed.NomeColuna))
                    categoryList.splice(index, 1)
                    headCopy = this.setCategoryColumns(headCopy, destination.droppableId, categoryList)
                    this.setState({ Niveis_De_Detalhe: headCopy })
                }
                let boob = await this.getDimension(removed.IndiceColuna, removed.NomeColuna)
                destinationColumns.splice(destination.index, 0, boob);
                this.setState({ Dimensoes: destinationColumns, Metricas_Colunas: sourceColumns })
                break;
            case 'ND':
                let metricasND = this.state.Metricas_Colunas
                index = metricasND.findIndex(column => (column.NomeColuna === removed.NomeColuna))
                metricasND.splice(index, 1)
                destinationColumns.splice(destination.index, 0, await this.getDimension(removed.IndiceColun, removed.NomeColuna));
                let headCopyND = this.state.Niveis_De_Detalhe
                headCopyND = this.setCategoryColumns(headCopyND, source.droppableId, sourceColumns)
                this.setState({ Dimensoes: destinationColumns, Metricas_Colunas: metricasND, Niveis_De_Detalhe: headCopyND })
                break;
            case 'DN':
                let newMetricDN = { IndiceColuna: removed.IndiceColuna, NomeColuna: removed.NomeColuna, CategoriaId: destination.droppableId, E_Total: false }
                destinationColumns.splice(destination.index, 0, newMetricDN);
                let metricas = this.state.Metricas_Colunas
                metricas.splice(0, 0, newMetricDN)
                let headCopyDN = this.state.Niveis_De_Detalhe
                headCopyDN = this.setCategoryColumns(headCopyDN, destination.droppableId, destinationColumns)
                this.setState({ Dimensoes: sourceColumns, Metricas_Colunas: metricas, Niveis_De_Detalhe: headCopyDN })
                break;
            default:
                break;
        }

        this.disableWarning()
    }

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let changedList = this.id2List[source.droppableId]
            if (changedList === undefined) {
                let headCopy = this.state.Niveis_De_Detalhe
                headCopy = this.setCategoryColumns(this.state.Niveis_De_Detalhe, source.droppableId, items)
                this.setState({
                    Niveis_De_Detalhe: headCopy
                })
            }
            else {
                this.setState({
                    [changedList]: items
                })
            }

        } else {
            let sourceList = this.id2List[source.droppableId]
            let destinationList = this.id2List[destination.droppableId]
            let headCopy = this.state.Niveis_De_Detalhe

            //cenário de Métrica -> Dimensão ou Dimensão -> Métrica
            if (sourceList !== undefined && destinationList !== undefined) {
                let dragResult
                if (sourceList === 'Dimensoes') {
                    dragResult = { source: source, destination: destination, case: 'DM' }
                }
                else {
                    dragResult = { source: source, destination: destination, case: 'MD' }
                }
                this.setState({ dragResult: dragResult })
                this.enableWarning()
                return
            }

            //cenário NíveisDD -> Métrica ou Dimensão
            if (sourceList === undefined && destinationList !== undefined) {
                //cenário NíveisDD -> Dimensão
                if (destinationList === 'Dimensoes') {
                    let dragResult = { source: source, destination: destination, case: 'ND'}
                    this.setState({ dragResult: dragResult })
                    this.enableWarning()
                    return
                }
                //cenário NíveisDD -> Métrica 
                if (destinationList === 'Metricas_Colunas') {
                    let sourceColumns = this.getList(source.droppableId)
                    //alterar o categoriaId da coluna para null
                    let metricas = this.state.Metricas_Colunas
                    metricas.forEach(item => {
                        if (item.NomeColuna === sourceColumns[source.index].NomeColuna) {
                            item.CategoriaId = null
                            return
                        }
                    })
                    //tirar o draggable do source
                    sourceColumns.splice(source.index, 1)                  
                    headCopy = this.setCategoryColumns(headCopy, source.droppableId, sourceColumns)
                    this.setState({ Metricas_Colunas: metricas, Niveis_De_Detalhe: headCopy })
                    return
                }
            }

            //cenário Dimensão ou Métrica -> NíveisDD
            if (sourceList !== undefined && destinationList === undefined) {
                //cenário Dimensão -> NíveisDD
                if (sourceList === 'Dimensoes') {
                    let dragResult = { source: source, destination: destination, case:'DN' }
                    this.setState({ dragResult: dragResult })
                    this.enableWarning()
                    return
                }
                //cenário Métrica -> NíveisDD
                if (sourceList === 'Metricas_Colunas') {
                    //verificar que categoriaId === null
                    let sourceColumns = this.getList(source.droppableId)
                    let addedColumn = sourceColumns[source.index]
                    if (addedColumn.CategoriaId !== null) {
                        //tirar o antigo
                        let oldColumns = this.getList(addedColumn.CategoriaId)
                        let index = oldColumns.findIndex(column => (column.NomeColuna === addedColumn.NomeColuna))
                        oldColumns.splice(index, 1)
                        headCopy = this.setCategoryColumns(headCopy, source.droppableId, oldColumns)
                    }
                    //adicionar ao droppable o novo draggable
                    let destinationColumns = this.getList(destination.droppableId)
                    addedColumn.CategoriaId = parseInt(destination.droppableId)
                    if (destinationColumns === undefined) {
                        destinationColumns = [sourceColumns[source.index]]
                    }
                    else {
                        destinationColumns.splice(destination.index, 0, sourceColumns[source.index]);
                    }
                    headCopy = this.setCategoryColumns(headCopy, destination.droppableId, destinationColumns)
                    this.setState({ Niveis_De_Detalhe: headCopy })
                    return 
                }
            }

            //cenário NíveisDD -> NíveisDD
            if (sourceList === undefined && destinationList === undefined) {
                let sourceColumns = this.getList(source.droppableId)
                let destinationColumns = this.getList(destination.droppableId)
                const [removed] = sourceColumns.splice(source.index, 1);
                removed.CategoriaId = parseInt(destination.droppableId)
                if (destinationColumns === undefined) {
                    destinationColumns = [removed]
                }
                else {
                    destinationColumns.splice(destination.index, 0, removed);
                }
                headCopy = this.setCategoryColumns(headCopy, source.droppableId, sourceColumns)
                headCopy = this.setCategoryColumns(headCopy, destination.droppableId, destinationColumns)
                this.setState({ Niveis_De_Detalhe: headCopy })
                return
            }
        }
    };
    /**/
    closeAlert() {
        console.log(this.state)
        this.setState({ alertMessage: null })
    }

    async deleteVersion() {
        if (this.state.selectedVersion === "") {
            this.disableLoadModal()
        }
        else {
            let selected = this.state.selectedVersion;
            if (selected.split('_v')[1] === '1') {
                this.setState({
                    alertMessage: dangerMessage("You can't delete the first analysis", this.closeAlert)
                })
            }
            else {
                let fileId = this.props.match.params.id
                const token = await authService.getAccessToken();
                //fazer pedido

                fetch(`Workspace/DeleteAnalysisVersion?fileId=${fileId}&analysisFile=${selected}`, {
                    method: 'DELETE',
                    headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
                }).then(res => {
                    if (res.status !== 200) {
                        this.setState({
                            alertMessage: dangerMessage("Delete analysis version was unsuccessful. Please try again later.", this.closeAlert)
                        })
                    } else {
                        this.setState({
                            alertMessage: successMessage("Analysis version successfully deleted!", this.closeAlert)
                        })
                    }
                })  
                //obrigar a fazer o pedido do load novamente
                this.setState({
                    requestVersion: true
                })
            }
            this.setState({
                selectedVersion: "",
                onShowLoadModal: false
            })
        }
    }


    /*Métodos para os quatro botões*/
    async onLoadVersionClick() {
        if (this.state.selectedVersion === "") {
            this.disableLoadModal()
        }
        else {
            let selected = this.state.selectedVersion;
            let fileId = this.props.match.params.id
            const token = await authService.getAccessToken();

            fetch(`Workspace/ReturnAnalysisVersion?fileId=${fileId}&fileName=${selected}`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json())
                .then(metadata => {
                    this.newMetainformation(metadata,selected)
                    this.setState({
                        selectedVersion: "",
                        onShowLoadModal: false
                    })
                })
        }
        
    }

    async onSaveClick() {
        //obrigar a fazer o pedido do load novamente
        this.setState({
            requestVersion: true
        })
        //save version
        let fileId = this.props.match.params.id
        const token = await authService.getAccessToken();
        //generate new metadata file

        let metadata = {
            Nome : this.state.Nome + '.csv',
            NumLinhas : this.state.NumLinhas,
            NumColunas : this.state.NumColunas,
            DataGeracao : this.state.DataGeracao,
            GeoDivisoes : this.state.GeoDivisoes,
            Dimensoes : this.state.Dimensoes,
            Metricas: {
                Categorias: this.state.Metricas_Categorias,
                Colunas : this.state.Metricas_Colunas
            }
        }

        fetch(`Workspace/SaveAnalysis?fileId=${fileId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(metadata)
        }).then(res => {
            if (res.status !== 201) {
                this.setState({
                    alertMessage: dangerMessage("There was an error saving. Please try again later.", this.closeAlert)
                })
            } else {
                this.setState({
                    alertMessage: successMessage("New version successfully saved!", this.closeAlert),
                    currentVersion: "most recent"
                })
            }

        })
    }

    async onDownloadClick() {
        let metadata = {
            Nome: this.state.Nome + '.csv',
            NumLinhas: this.state.NumLinhas,
            NumColunas: this.state.NumColunas,
            DataGeracao: this.state.DataGeracao,
            GeoDivisoes: this.state.GeoDivisoes,
            Dimensoes: this.state.Dimensoes,
            Metricas: {
                Categorias: this.state.Metricas_Categorias,
                Colunas: this.state.Metricas_Colunas
            }
        }
        const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = this.state.Nome.split('.')[0] + '_analysis' + '.json';
        a.click();
    }

    async getFirstRows(indiceColuna) {
        let fileId = this.props.match.params.id
        const token = await authService.getAccessToken();

        fetch(`Workspace/GetFirstValues?fileId=${fileId}&colId=${indiceColuna}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
            .then(rows => {
                let map = new Map()
                rows.forEach((elem,index) => {
                    map.set(index,elem)
                })
                this.setState({ firstRows : map })
            })
    }

/*Métodos de render*/

    showColumnDetails() {
        if (this.state.panelColumn === "") return
        let elem = this.state.panelColumn
        let map = new Map()
        if (elem.NumValoresUnicos === undefined) {
            map.set('Column Index', elem.IndiceColuna)
            map.set('Category', elem.CategoriaId === null ? "none" : this.state.Metricas_Categorias[elem.CategoriaId - 1].Nome)
            map.set('Is Total', elem.E_Total ? "true" : "false")
            return <div>
                <TableComp keyValues={map} title='Data' />
                <p>{this.state.firstRows === undefined ? <button type="button" class="btn btn-outline-primary" onClick={() => this.getFirstRows(elem.IndiceColuna)}>Get First Rows</button> : <TableComp keyValues={this.state.firstRows} title='First Rows'/>}</p>
            </div>
        }
        map.set('Column Index', elem.IndiceColuna)
        map.set('Number of unique values' ,  elem.NumValoresUnicos )
        map.set('Number of null values' ,  elem.NumValoresNulos )
        map.set('All different' , elem.TodosDiferentes ? "true" : "false" )
        map.set('Geo Type' , elem.TipoDominioGeo === null ? "null" : elem.TipoDominioGeo )
        return <div>
            <TableComp keyValues={map} title='Data'/>
            <p style={{ fontWeight: "bold" }}>Type of Values</p>  
            <ul>
            {elem.TipoValores.map(e => {                
                return <li>{e.Count} of type {e.Tipo}</li>
            })}
            </ul>
            <p style={{ fontWeight: "bold" }}>Unique values</p>
            <ul>
            {elem.ValoresUnicos.map(e => {
                return <li>{e}</li>
            })}
            </ul>
            <p>{this.state.firstRows === undefined ? <button type="button" class="btn btn-outline-primary" onClick={() => this.getFirstRows(elem.IndiceColuna)}>Get First Rows</button> : <TableComp keyValues={this.state.firstRows} title='First Rows' />}</p>
        </div>
    }

    renderDroppable(title, id, draggables) {
        return <DroppableComp
                    title={title}
                    id={id}
                    moreInfo={this.enableSidePanel}
                    draggables={draggables}
                />
    }

    recursiveDroppable(categoria) {
        if (categoria === undefined) return
        let children = []
        categoria.children.forEach(child => {
            children.push(
                <StyledTreeItem nodeId={'T' + child.CategoriaId} label={child.Nome}>
                    {this.renderDroppable('', child.CategoriaId, child.columns)}
                    <p></p>
                    {this.recursiveDroppable(child)}
                </StyledTreeItem>
            )
        })
        return <div>{children}</div>
    }

    renderDetailLevels() {
        
        if (this.state.Niveis_De_Detalhe === undefined)return 
        return (
            <TreeView
                className='tree'
                defaultExpanded={['T1']}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
            >
                <StyledTreeItem nodeId={'T' + this.state.Niveis_De_Detalhe.CategoriaId} label={this.state.Niveis_De_Detalhe.Nome}>
                    {this.renderDroppable('', this.state.Niveis_De_Detalhe.CategoriaId, this.state.Niveis_De_Detalhe.columns)}
                    <p></p>
                    {this.recursiveDroppable(this.state.Niveis_De_Detalhe)}
                </StyledTreeItem>
            </TreeView>
        )
    }
    /**/
    
    render() {
        return (
            <div style={{marginTop:"130px"}}>
                <div class="row justify-content-md-center">{this.state.alertMessage !== null && this.state.alertMessage}</div>
                <div class="row" style={{ maxHeight: '100%', maxWidth: '100%', paddingLeft: "25px" }}>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <div class="col-3">
                            {this.renderDroppable("Dimensions", "dimensoes", this.state.Dimensoes)}
                            <p></p>
                            {this.renderDroppable("Metrics", "metricas", this.state.Metricas_Colunas)}
                        </div>
                        <div class="col-9">
                            <div class="row">
                                <div class="col-10">
                                    <AccordionComp
                                        title={this.state.Nome}
                                        body={<div><p>Number of Lines : {this.state.NumLinhas} | Number of Columns : {this.state.NumColunas}</p><p>Current Version: {this.state.currentVersion}</p></div>}
                                    />
                                </div>
                                <div class="col-2">
                                    <div class="dropdown">
                                        <button class="btn btn-danger dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Options
                                        </button>
                                        <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                                            <button class="dropdown-item" type="button" onClick={this.enableLoadModal}>Manage Versions</button>
                                            <button class="dropdown-item" type="button" onClick={this.onSaveClick}>Save</button>
                                            <button class="dropdown-item" type="button" onClick={this.onDownloadClick}>Download</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p></p>
                            <div class="row" style={{ marginLeft: "1px" }}>
                                {this.renderDetailLevels()}
                            </div>
                        </div>
                    </DragDropContext>
                    <ModalComp
                        title="Manage versions"
                        body={
                            this.state.loadVersion.map(v => {
                                return (
                                    <Form.Check
                                        key={v.name}
                                        type='radio'
                                        id={v.name}
                                        label={v.name + ' | ' + v.lastEdit.split('T')[0] + ' at ' +v.lastEdit.split('T')[1].split('.')[0]}
                                        onChange={this.handleOnToggleVersion}
                                        name='selectedVersion'                                  
                                    />
                                )
                            })
                        }
                        removeButton={true}
                        removeButtonFunc={this.deleteVersion}
                        okButtonText="Load"
                        okButtonFunc={this.onLoadVersionClick}
                        cancelButtonFunc={this.disableLoadModal}
                        visible={this.state.onShowLoadModal}
                    />   
                    <ModalComp
                        removeButton={false}
                        title="Warning!"
                        body="You are changing the main classifier of the column. Are you sure?"
                        okButtonText="Yes"
                        okButtonFunc={async () => await this.changeClassifier()}
                        cancelButtonFunc={this.disableWarning}
                        visible={this.state.onShowWarningModal}
                    />   
                    <SlidingPane
                        isOpen={this.state.openSidePanel}
                        title={this.state.panelColumn.NomeColuna}
                        subtitle="Column details"
                        width="500px"
                        onRequestClose={() => {
                            // triggered on "<" on left top click or on outside click
                            this.setState({
                                openSidePanel: false,
                                panelColumn: "",
                                firstRows: undefined
                            });
                        }}
                    >
                        <div style={{ fontFamily: 'Open Sans'}}>{this.showColumnDetails()}</div>
                    </SlidingPane>
                    </div>
                </div>
        )
    }

    
}