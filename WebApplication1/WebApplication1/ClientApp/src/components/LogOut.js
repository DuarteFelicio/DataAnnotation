
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

export class LogOut extends Component {
    displayName = LogOut.name

    constructor(props) {
        super(props)
    }

    logOut(e) {
        e.preventDefault()
        localStorage.removeItem("token")
        window.location.reload()
    }

    render() {
        if (localStorage.getItem("token") === null) {
            return <Redirect to="/LogIn" /> 
        }
        return (
            <div className="container">
                <button type="button" className="logout-btn" onClick={this.logOut.bind(this)}>LogOut</button>
            </div>
        )
    }

}