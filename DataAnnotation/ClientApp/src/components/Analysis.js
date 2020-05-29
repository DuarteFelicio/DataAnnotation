import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'

export class Analysis extends Component {
    static displayName = Analysis.name;

    constructor(props) {
        super(props)
        this.state = {
           
           metadata:""
        }

    }

    async onLoadClick() {

    }

    async onSaveClick() {

    }

    async onDownloadClick() {

    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        let id = this.props.match.params.id

        fetch(`Workspace/ReturnAnalysis?fileId=${id}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            res.json().then(metadata => {
                console.log(metadata)
                this.setState({
                    metadata: metadata
                })
            })
        })
    }

    renderInfoData() {

    }

    render() {
        return (
            <div class="row">
                <div class="col-4">
                    {this.renderInfoData()}
                </div>
                <div class="col-8">
                    <div class="row">
                        <div class="col-10">
                            <h4>{this.state.metadata.Nome}</h4>
                        </div>
                        <div class="col-2">
                            <div class="dropdown">
                                <button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Options
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                                    <button class="dropdown-item" type="button" onClick={ () => this.onLoadClick() }>Load</button>
                                    <button class="dropdown-item" type="button" onClick={ () => this.onSaveClick() }>Save</button>
                                    <button class="dropdown-item" type="button" onClick={ () => this.onDownloadClick()}>Download</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
    }
}