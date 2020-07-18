import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap';

export default class ListGroup extends Component {

    render() {
        let title = this.props.title
        let files = this.props.files
        let symbol = this.props.symbol
        let toShow = this.props.toShow

        return (
            <div>
                <h4>{title}</h4>
                <ul class="list-group">
                    {
                        files.map(f => <li class="list-group-item">
                            <div class="row">
                                <div class="column">
                                    {symbol}
                                </div>
                                {toShow(f)}
                            </div>
                        </li>)
                    }
                </ul>
            </div>
        )
    }
}