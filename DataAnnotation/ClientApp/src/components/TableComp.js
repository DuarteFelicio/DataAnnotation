import React, { Component } from 'react'

 export default class TableComp extends Component
{
    render() {
        let keyValues = this.props.keyValues
        let title = this.props.title
        let array = []

        keyValues.forEach((value, key) => {
            array.push(
                <tr>
                    <th scope="row">{key}</th>
                    <td>{value}</td>
                </tr>
            )
        })

        return <div>
                <h2>{title}</h2>
                <table class="table table-striped">
                    <tbody>
                        {array}
                    </tbody>
                </table>
            </div>
    }
}