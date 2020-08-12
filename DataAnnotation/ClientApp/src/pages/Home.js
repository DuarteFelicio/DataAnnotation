import React, { Component } from 'react';
import { Container } from 'reactstrap';
import authService from './api-authorization/AuthorizeService'

export class Home extends Component {
    static displayName = Home.name;
    constructor(props) {
        super(props)
        this.state = {
            Auth : false
        }
    }

    async componentDidMount() {
        let auth = await authService.getAccessToken()        
        if (auth !== null) {
            this.setState({
                Auth : true
            })
        }
            
    }

    render() {
    return (
      <Container>
            <h1>Hello </h1>
            {this.state.Auth && <p>true</p>}
            
      </Container>
    );
  }
}
