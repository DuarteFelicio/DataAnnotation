﻿import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default class ModalComp extends React.Component {
    render() {
        let title = this.props.title
        let body = this.props.body
        let okButtonText = this.props.okButtonText
        let okButtonFunc = this.props.okButtonFunc
        let cancelButtonFunc = this.props.cancelButtonFunc
        let visible = this.props.visible

        return (
            <div>
                <Modal show={visible} onHide={cancelButtonFunc}>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {body}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-primary" onClick={okButtonFunc}>
                            {okButtonText}
                            </Button>
                        <Button variant="outline-danger" onClick={cancelButtonFunc}>
                            Close
                            </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}