import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import "./LogIn.css"

export class LogIn extends Component {
    displayName = LogIn.name

    constructor(props) {
        super(props)

        this.state = {
            username: "",
            password: "",
            isLoginOpen: true,
            isRegisterOpen: false,
        }
    }

    showRegisterBox() {
        this.setState({
            isRegisterOpen: true,
            isLoginOpen: false
        })
    }

    showLoginBox() {
        this.setState({
            isRegisterOpen: false,
            isLoginOpen: true
        })
    }


    submitForm(x) {
        
    }

    render() {
        if (this.state.loggedIn) {
            return <Redirect to = "/Home"/>
        }
        return (
            <div className="root-container">

                <div className="box-controller">
                    <div className="controller" onClick={this.showLoginBox.bind(this)} >
                        Login
                    </div>
                    <div className="controller" onClick={this.showRegisterBox.bind(this)}>
                        Register
                    </div>
                </div>

                <div className="box-container">

                    {this.state.isLoginOpen && <LoginBox />}
                    {this.state.isRegisterOpen && <RegisterBox />}

                    </div>
                </div>
       
    );
  }
}

class LoginBox extends Component {

    constructor(props) {
        super(props)
        let loggedIn = false
        this.state = {
            username: "",
            password: "",
            loggedIn
        }
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    submitLogin(e) {
        e.preventDefault()
        const { username, password } = this.state
        //login magic
        if (username === "cafe" && password === "cafe") {
            localStorage.setItem("token", "sdfghjk")
            this.setState({
                loggedIn: true
            })
        }
    }

    render() {
        if (this.state.loggedIn == true) {
            return <Redirect to="/home" />
        }

        return (
            <div className="inner-container">
                <div className="header">
                    Login
                </div>
                <div className="box">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" className="login-input" placeholder="username" onChange={this.onChange.bind(this)} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="login-input" placeholder="Password" onChange={this.onChange.bind(this)} />
                    </div>

                    <div className="footer">
                    <button type="button" className="login-btn" onClick={this.submitLogin.bind(this)}>Login</button>
                    </div>
                </div>
            </div>
        )
    }
}


class RegisterBox extends Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    submitRegister(e) {

    }

    render() {
        return (
            <div className="inner-container">
                <div className="header">
                    Register
                </div>
                <div className="box">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" className="login-input" placeholder="username" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="login-input" placeholder="Password" />
                    </div>

                    <div className="footer">
                        <button type="button" className="register-btn" onClick={this.submitRegister.bind(this)}>Register</button>
                    </div>
                </div>
            </div>
        )
    }
}
