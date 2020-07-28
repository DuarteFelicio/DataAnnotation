import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { DragDropContext } from "react-beautiful-dnd";
import DroppableComp from "../components/DroppableComp.js"
import ModalComp from '../components/ModalComp.js'
import { Form } from 'react-bootstrap'
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const updateDroppables = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

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
            openSidePanel: false
        }
        this.handleOnChange = this.handleOnChange.bind(this)
        this.handleOnToggleVersion = this.handleOnToggleVersion.bind(this)
        this.enableLoadModal = this.enableLoadModal.bind(this)        
        this.disableLoadModal = this.disableLoadModal.bind(this)    
        this.onLoadVersionClick = this.onLoadVersionClick.bind(this)
        this.onSaveClick = this.onSaveClick.bind(this)
        this.onDownloadClick = this.onDownloadClick.bind(this)
        this.enableSidePanel = this.enableSidePanel.bind(this)
    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        let id = this.props.match.params.id

        fetch(`Workspace/ReturnAnalysis?fileId=${id}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
            .then(metadata => {
                this.newMetainformation(metadata)
            })
    }

    newMetainformation(metadata) {
        this.setState({
            Nome: metadata.Nome.split('.')[0],
            NumLinhas: metadata.NumLinhas,
            NumColunas: metadata.NumColunas,
            DataGeracao: metadata.DataGeracao,
            GeoDivisoes: metadata.GeoDivisoes,
            Dimensoes: metadata.Dimensoes,
            Metricas_Categorias: metadata.Metricas.Categorias,
            Metricas_Colunas: metadata.Metricas.Colunas
        })
        this.generateDetailLevels()
    }

    enableSidePanel() {
        this.setState({ openSidePanel: true })
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
        let metrics = []
        this.state.Metricas_Colunas.forEach(col => {
            if (col.CategoriaId !== null) {
                if (columns[col.CategoriaId] === undefined) {
                    columns[col.CategoriaId] = [col]
                }
                else {
                    columns[col.CategoriaId].push(col)
                }
            }
            else {
                metrics.push(col)
            }

        })
        this.state.Metricas_Categorias.forEach(c => {
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
        if (array[0].CategoriaId === undefined) return
        array[0].children = this.recursiveOrganize(array[0], array, columns)
        this.setState({
            Niveis_De_Detalhe: array[0],
            Metricas_Colunas: metrics
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

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
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
            const result = updateDroppables(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            let sourceList = this.id2List[source.droppableId]
            let destinationList = this.id2List[destination.droppableId]
            let headCopy = this.state.Niveis_De_Detalhe
            let needUpdate = false

            if (sourceList === undefined) {
                headCopy = this.setCategoryColumns(headCopy, source.droppableId, result[source.droppableId])
                needUpdate = true

            }

            if (destinationList === undefined) {
                headCopy = this.setCategoryColumns(headCopy, destination.droppableId, result[destination.droppableId])
                needUpdate = true
            }

            if (needUpdate) {
                this.setState({
                    Niveis_De_Detalhe: headCopy,
                });
            }

            if (sourceList !== undefined) {
                this.setState({
                    [sourceList]: result[source.droppableId],
                });
            }

            if (destinationList !== undefined) {
                this.setState({
                    [destinationList]: result[destination.droppableId]
                });
            }
        }
    };
    /**/

    /*Métodos para os três botões*/
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
                    this.newMetainformation(metadata)
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
        console.log(this.state.Niveis_De_Detalhe)
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
            //fazer aparecer qquer coisa
        })
    }

    async onDownloadClick() {

    }

    
    /*Métodos de render*/
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
                <div class="col" style={{
                    border: "5px solid black",
                    borderRadius: "5px"
                }}>
                    {this.renderDroppable(child.Nome, child.CategoriaId, child.columns)}
                    {this.recursiveDroppable(child)}
                </div>
            )
        })
        return <div>{children}</div>
    }

    renderDetailLevels() {
        if (this.state.Niveis_De_Detalhe === undefined)return 
        return (
            <div class="col" style={{
                marginLeft: "15px",
                border: "5px solid black",
                borderRadius: "5px"
            }}>
                {this.renderDroppable(this.state.Niveis_De_Detalhe.Nome, this.state.Niveis_De_Detalhe.CategoriaId, this.state.Niveis_De_Detalhe.columns)}
                {this.recursiveDroppable(this.state.Niveis_De_Detalhe)}
            </div>   
        )
    }
    /**/

    render() {
        return (
            <div class="row" style={{ maxHeight: '100%', maxWidth: '100%', paddingLeft: "25px"}}>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <div class="col-3">
                        {this.renderDroppable("Dimensions", "dimensoes", this.state.Dimensoes)}
                        {this.renderDroppable("Metrics", "metricas", this.state.Metricas_Colunas)}
                    </div>
                    <div class="col-9">
                        <div class="row">
                            <div class="col-10">
                                <h3>{this.state.Nome}</h3>
                            </div>
                            <div class="col-2">
                                <div class="dropdown">
                                    <button class="btn btn-danger dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        Options
                                    </button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                                        <button class="dropdown-item" type="button" onClick={this.enableLoadModal}>Load Version</button>
                                        <button class="dropdown-item" type="button" onClick={this.onSaveClick}>Save</button>
                                        <button class="dropdown-item" type="button" onClick={this.onDownloadClick}>Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            {this.renderDetailLevels()}
                        </div>
                    </div>
                </DragDropContext>
                <ModalComp
                    title="Load Analysis"
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
                    okButtonText="Load"
                    okButtonFunc={this.onLoadVersionClick}
                    cancelButtonFunc={this.disableLoadModal}
                    visible={this.state.onShowLoadModal}
                />   
                <SlidingPane
                    className="some-custom-class"
                    overlayClassName="some-custom-overlay-class"
                    isOpen={this.state.openSidePanel}
                    title="Hey, it is optional pane title.  I can be React component too."
                    subtitle="Optional subtitle."
                    width="1000px"
                    onRequestClose={() => {
                        // triggered on "<" on left top click or on outside click
                        this.setState({ openSidePanel: false });
                    }}
                >
                    <div>And I am pane content. BTW, what rocks?</div>
                </SlidingPane>
            </div>
        )
    }
}