import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { Button } from 'react-bootstrap'


const extraStyle = (droppableId, categoryId) => {
    if (droppableId === "metricas") {
        if (categoryId === null) return 'Tomato'
        return 'lightblue'
    }
    if (droppableId === "dimensoes")return 'khaki'
    return 'lightgrey'
}

const getItemStyle = (isDragging, draggableStyle, droppableId, categoryId) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: 8,
    margin: `0 0 0 0`,


    // change background colour if dragging
    background: isDragging ? 'grey' : extraStyle(droppableId, categoryId),

    // styles we need to apply on draggables
    ...draggableStyle
});

export default class DraggableComp extends React.Component {
    render() {
        let coluna = this.props.coluna
        let droppableId = this.props.droppableId
        let index = this.props.index
        let moreInfo = this.props.moreInfo
        let categoryId = coluna.CategoriaId

        return <Draggable key={coluna.NomeColuna + droppableId} draggableId={coluna.NomeColuna + droppableId} index={index} >
                   {(draggableProvided, draggableSnapshot) => (
                   <div
                       ref={draggableProvided.innerRef}
                       {...draggableProvided.draggableProps}
                       {...draggableProvided.dragHandleProps}
                       style={getItemStyle(
                           draggableSnapshot.isDragging,
                           draggableProvided.draggableProps.style,
                           droppableId,
                           categoryId
                       )}
                   >
                    {coluna.NomeColuna}
                    <button style={{ float: "right", background: "none", border: "none", margin: 0, padding: 0, cursor:"pointer" }} onClick={() => moreInfo(coluna)}>. . .</button>
                   </div>
                   )}
                </Draggable>
    }
}
