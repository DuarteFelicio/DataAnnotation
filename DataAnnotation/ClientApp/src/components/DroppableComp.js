﻿import React from 'react'
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
        if (draggables !== undefined && draggables.length > 0 && draggables[0].CategoriaId !== undefined) {
            //reordenar
            draggables.forEach((item, i) => {
            if (item.CategoriaId === null) {
                    draggables.splice(i, 1)
                    draggables.unshift(item)
                }
            })
        }

        return (
            <div>
                <h4>{title}</h4>
                <Droppable droppableId={"" + id} key={""+id}>
                    {(droppableProvided, droppableSnapshot) => (
                        <div ref={droppableProvided.innerRef} style={getListStyle(droppableSnapshot.isDraggingOver)}>
                            {draggables !== undefined && draggables.map((col, index) => (
                                <Draggable
                                    droppableId={id}
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