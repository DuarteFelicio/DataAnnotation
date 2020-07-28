import React from 'react'
import Draggable from './DraggableComp.js'
import { Droppable } from 'react-beautiful-dnd'

const grid = 8;

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'white' : 'white',
    padding: grid,
    width: '100%',
    border: "5px solid lightgrey",
    borderRadius: "5px"
});

export default class DroppableComp extends React.Component {
    render() {
        let title = this.props.title
        let id = this.props.id
        let draggables = this.props.draggables
        let moreInfo = this.props.moreInfo

        return (
            <div>
                <p>{title}</p>
                <Droppable droppableId={"" + id}>
                    {(droppableProvided, droppableSnapshot) => (
                        <div ref={droppableProvided.innerRef} style={getListStyle(droppableSnapshot.isDraggingOver)}>
                            {draggables !== undefined && draggables.map((col, index) => (
                                <Draggable
                                    coluna={col}
                                    index={index}
                                    moreInfo={moreInfo}
                                    history={this.props.history}
                                />
                            ))}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
        )
    }
}