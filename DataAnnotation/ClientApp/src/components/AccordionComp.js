import React, { Component } from 'react'
import { Accordion, Card, Button } from 'react-bootstrap'

export default class AccordionComp extends Component {
    render() {
        let title = this.props.title
        let body = this.props.body

        return(
        <Accordion>
            <Card border="info">
                <Card.Header>
                    <Accordion.Toggle as={Button} variant="link" eventKey="0">
                        <h3>{title}</h3>
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        <Card.Text>{body}</Card.Text>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
            )
    }
}