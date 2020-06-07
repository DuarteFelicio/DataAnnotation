import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Container } from 'reactstrap'

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

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'grey' : 'lightgrey',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'white' : 'white',
    padding: grid,
    width: '100%',
    border: "5px solid lightgrey",
    borderRadius: "5px"
});

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
            Niveis_De_Detalhe: undefined
        }

    }

    async componentDidMount() {

        const token = await authService.getAccessToken();
        let id = this.props.match.params.id

        fetch(`Workspace/ReturnAnalysis?fileId=${id}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
            .then(metadata => {
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
            })

    }

    id2List = {
        droppable1: 'Dimensoes',
        droppable2: 'Metricas_Colunas',        
    };

    getList(id) {        
        let list = this.id2List[id]
        if (list === undefined) {             
            return this.getCategoryColumns(this.state.Niveis_De_Detalhe,id)
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
        }, () => console.log(this.state))
    }

    recursiveOrganize(categoria, array) {
        let children = array[categoria.CategoriaId]      
        if (children === undefined)return []
        children.forEach(c => {
            c.children = this.recursiveOrganize(c, array)
        })
        return children
    }

    async onLoadVersionClick() {

    }

    async onSaveClick() {

    }

    async onDownloadClick() {

    }

    recursiveDroppable(categoria) {
        if (categoria === undefined) return
        let children = []
        categoria.children.forEach(child => {
            children.push(
                <div class="col" style={{
                    border: "5px solid black",
                    borderRadius: "5px"}}>
                    <p>{child.Nome}</p>
                    <Droppable droppableId={"" + child.CategoriaId}>
                        {(droppableProvided, droppableSnapshot) => (
                            <div ref={droppableProvided.innerRef} style={getListStyle(droppableSnapshot.isDraggingOver)}>
                                {child.columns !== undefined && child.columns.map((col, index) => (
                                    <Draggable key={col.NomeColuna} draggableId={col.NomeColuna} index={index}>
                                        {(draggableProvided, draggableSnapshot) => (
                                            <div
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                                style={getItemStyle(
                                                    draggableSnapshot.isDragging,
                                                    draggableProvided.draggableProps.style
                                                )}
                                            >
                                                {col.NomeColuna}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    {this.recursiveDroppable(child)}
                </div>
            )
        })
        return (
            <div>
                {children}
            </div>
        )
    }

    renderMetricsAndDimensions() {
        return (
            <div>
                <h3>Dimensions</h3>
                <div class="row">
                    <Droppable droppableId="droppable1">
                        {(droppableProvided, droppableSnapshot) => (
                            <div
                                ref={droppableProvided.innerRef}
                                style={getListStyle(droppableSnapshot.isDraggingOver)}
                               >
                                {this.state.Dimensoes.map((dimensoes, index) => (
                                    <Draggable key={dimensoes.NomeColuna} draggableId={dimensoes.NomeColuna} index={index}>
                                        {(draggableProvided, draggableSnapshot) => (
                                            <div
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                                style={getItemStyle(
                                                    draggableSnapshot.isDragging,
                                                    draggableProvided.draggableProps.style
                                                )}
                                            >
                                                {dimensoes.NomeColuna}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
                <h3>Metrics</h3>
                <div class="row">
                    <Droppable droppableId="droppable2">
                        {(droppableProvided, droppableSnapshot) => (
                            <div
                                ref={droppableProvided.innerRef}
                                style={getListStyle(droppableSnapshot.isDraggingOver)}
                            >
                                {this.state.Metricas_Colunas.map((metrica_coluna, index) => (
                                    <Draggable key={metrica_coluna.NomeColuna} draggableId={metrica_coluna.NomeColuna} index={index}>
                                        {(draggableProvided, draggableSnapshot) => (
                                            <div
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                                style={getItemStyle(
                                                    draggableSnapshot.isDragging,
                                                    draggableProvided.draggableProps.style
                                                )}
                                            >
                                                {metrica_coluna.NomeColuna}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        )
    }

    renderDetailLevels() {
        if (this.state.Niveis_De_Detalhe === undefined)return 
        return (
            <div class="col" style={{
                marginLeft: "15px",
                border: "5px solid black",
                borderRadius: "5px"
            }}>
                <p>{this.state.Niveis_De_Detalhe.Nome}</p>
                <Droppable droppableId={"" + this.state.Niveis_De_Detalhe.CategoriaId}>
                    {(droppableProvided, droppableSnapshot) => (
                        <div ref={droppableProvided.innerRef} style={getListStyle(droppableSnapshot.isDraggingOver)}>
                            {this.state.Niveis_De_Detalhe.columns !== undefined && this.state.Niveis_De_Detalhe.columns.map((col, index) => (
 
                                <Draggable key={col.NomeColuna} draggableId={col.NomeColuna} index={index}>
                                    {(draggableProvided, draggableSnapshot) => (
                                        <div
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            style={getItemStyle(
                                                draggableSnapshot.isDragging,
                                                draggableProvided.draggableProps.style
                                            )}
                                        >
                                            {col.NomeColuna}
                                        </div>
                                    )}
                                </Draggable>              
                            ))}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
                {this.recursiveDroppable(this.state.Niveis_De_Detalhe)}
            </div>   
        )
    }

    render() {
        return (
            <div class="row" style={{ maxHeight: '100%', maxWidth: '100%', paddingLeft: "25px"}}>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <div class="col-3">
                        {this.renderMetricsAndDimensions()}
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
                                        <button class="dropdown-item" type="button" onClick={ () => this.onLoadVersionClick() }>Load Version</button>
                                        <button class="dropdown-item" type="button" onClick={ () => this.onSaveClick() }>Save</button>
                                        <button class="dropdown-item" type="button" onClick={ () => this.onDownloadClick()}>Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            {this.renderDetailLevels()}
                        </div>
                    </div>
                </DragDropContext>
                </div>
        )
    }
}