import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
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
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    padding: grid,
    width: 250
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
        }

    }

    id2List = {
        droppable1: 'Dimensoes',
        droppable2: 'Metricas_Colunas'
    };

    getList = id => this.state[this.id2List[id]];

    async onLoadClick() {

    }

    async onSaveClick() {

    }

    async onDownloadClick() {

    }

    async componentDidMount() {

        const token = await authService.getAccessToken();
        let id = this.props.match.params.id

        var res = await fetch(`Workspace/ReturnAnalysis?fileId=${id}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })

        var metadata = await res.json()
            
        this.setState({
            Nome: metadata.Nome,
            NumLinhas: metadata.NumLinhas,
            NumColunas: metadata.NumColunas,
            DataGeracao: metadata.DataGeracao,
            GeoDivisoes: metadata.GeoDivisoes,
            Dimensoes: metadata.Dimensoes,
            Metricas_Categorias: metadata.Metricas.Categorias,
            Metricas_Colunas: metadata.Metricas.Colunas
        })
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

    onDragEnd = result => {
        const { source, destination } = result;

        // dropped outside the list
        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            /*const items = reorder(   //nao funciona nao sei é do reorder mas tb who cares de reordenar
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let changedList = this.getList(source.droppableId);

            if (changedList === 'Dimensoes') {
                this.setState({
                    Dimensoes: items
                });
            }
            else {
                this.setState({
                    Metricas_Colunas: items
                });
            }*/

        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            this.setState({
                Dimensoes: result.droppable1,
                Metricas_Colunas: result.droppable2
            });
        }
    };

    render() {
        return (
            <div class="row" style={{ height: '100vh', width: '100vw' }}>
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
                    </div>
                </DragDropContext>
            </div>
        )
    }
}