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
    width: '100vw',
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
            Niveis_De_Detalhe: ""
        }

    }

    id2List = {
        droppable1: 'Dimensoes',
        droppable2: 'Metricas_Colunas'
    };

    getList = id => this.state[this.id2List[id]];


    generateDetailProLevels() {
        let array = []
        this.state.Metricas_Categorias.forEach(c => {
            if (c.CategoriaPaiId === null) {
                array[0] = c
            }
            else {
                array[c.CategoriaPaiId].push(c)
            }
        })
        array[0].children = recursiveOrganize(array[0], array)
        this.setState({
            Niveis_De_Detalhe: array[0]
        }, () => console.log(this.state.Niveis_De_Detalhe))
    }

    recursiveOrganize(categoria, array) {
        let children = array[categoria.CategoriaId]
        children.forEach(c => {
            c.children = recursiveOrganize(c, array)
        })
        return children
    }

    generateDetailLevels() {
        let head
        this.state.Metricas_Categorias.map(categoria => {
            if (categoria.CategoriaPaiId === null) {
                head = categoria
            }
        })
        head.ChildrenCategories = this.findCategorieChildren(head)
        this.setState({ Niveis_De_Detalhe : head })
    }

    findCategorieChildren(category) {
        let children = []
        this.state.Metricas_Categorias.map(categoria => {
            if (categoria.CategoriaPaiId === category.CategoriaId) {
                children.push(categoria)
            }
        })
        //recursive
        children.map(child => {
            child.ChildrenCategories = this.findCategorieChildren(child)
        })
        return children
    }

    async onLoadClick() {

    }

    async onSaveClick() {

    }

    async onDownloadClick() {

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

            this.generateDetailProLevels()
        })
        
    }

    renderMetricsAndDimensions() {
        return (
            <div>
                <h3>Dimensions</h3>
                <div class="row" style={{
                    border: "5px solid lightgrey",
                    borderRadius: "5px"}}>
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
                <div class="row" style={{
                    border: "5px solid lightgrey",
                    borderRadius: "5px"
                }}>
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
        return (
            <div style={{ borderStyle : 'solid' }}>
                <Droppable droppableId="droppable3">
                    {(droppableProvided, droppableSnapshot) => (
                        <div ref={droppableProvided.innerRef} style={getListStyle(droppableSnapshot.isDraggingOver)}>
                            {droppableProvided.placeholder}
                            {this.state.Nome}
                        </div>
                    )}
                </Droppable>
            </div>   
        )
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

            this.setState({
                [changedList]: items
            }, () => console.log(this.state.dimensoes))

        } else {
            const result = updateDroppables(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            let sourceList = this.id2List[source.droppableId]
            let destinationList = this.id2List[destination.droppableId]

            this.setState({
                [sourceList]: result[source.droppableId],
                [destinationList]: result[destination.droppableId]
            });
        }
    };

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
                                <h4>{this.state.Nome}</h4>
                            </div>
                            <div class="col-2">
                                <div class="dropdown">
                                    <button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        Options
                                    </button>
                                    <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                                        <button class="dropdown-item" type="button" onClick={ () => this.onLoadClick() }>Load</button>
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