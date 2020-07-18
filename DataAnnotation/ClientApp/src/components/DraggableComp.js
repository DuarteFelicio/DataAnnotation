import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

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

export default class DraggableComp extends React.Component {
    render() {
        let coluna = this.props.coluna
        let index = this.props.index

        return <Draggable key={coluna.NomeColuna} draggableId={coluna.NomeColuna} index={index} >
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
                   {coluna.NomeColuna}
                   </div>
                   )}
                </Draggable>
    }
}
