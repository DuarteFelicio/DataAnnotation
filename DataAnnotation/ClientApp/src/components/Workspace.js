import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import 'bootstrap/dist/css/bootstrap.css'

export class Workspace extends Component {

    static displayName = Workspace.name;

    constructor(props) {
        super(props)
        this.state = {
            files: []
        }
    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        const response = await fetch('Workspace', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json();
        this.setState({ files: data });
    }


    render() {
       

        return (
            <div className="Container"> 
                <h1>My Workspace</h1>
                <ul class="list-group">
                    {this.state.files.map(function(item) {
                        return <li class="list-group-item" key={item}><svg class="bi bi-file-text" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clip-rule="evenodd" />
                            <path fill-rule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clip-rule="evenodd" />
                        </svg>{item}</li>;
                    })}
                </ul>
            </div>
        )
    }
}
