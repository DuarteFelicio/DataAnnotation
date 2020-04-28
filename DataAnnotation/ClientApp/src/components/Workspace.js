import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap';

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
        const response = await fetch('Workspace/GetUserFiles', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        this.setState({ files: data })
    }

    async Analyze(id) {
        const token = await authService.getAccessToken();
        const response = await fetch(`Workspace/AnalyseFile?fileId=${id}`, {
            method : 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data =  await response.json()
      
    }

    async Remove(id) {
        const token = await authService.getAccessToken();
        const response = await fetch(`Workspace/RemoveFile?fileId=${id}`, {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
    }

    render() {
        const formatSize = (size, b = 2) => {
            if (0 === size) return "0 Bytes";
            const c = 0 > b ? 0 : b, d = Math.floor(Math.log(size) / Math.log(1024));
            return parseFloat((size / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        }


        return (
            <div className="Container"> 
                <h1>My Workspace</h1>
                <div class="row">
                    <div class = "col-sm-8">
                        <div class="list-group" id = "list-tab" role = "tablist">
                            {this.state.files.map(item => {
                                return <a class="list-group-item list-group-item-action" id={'list-' + item.csvFilesId} data-toggle="list" href={'#details-'+item.csvFilesId} role="tab">
                                    <svg class="bi bi-file-text" width="100" height="40" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fill-rule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clip-rule="evenodd" /></svg>
                                    {item.fileNameDisplay}</a>
                            })}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="tab-content" id="nav-tabContent">
                            {this.state.files.map(item => {
                                return <div class="tab-pane fade" id={'details-' + item.csvFilesId} role="tabpanel" aria-labelledby={'list-' + item.csvFilesId}>
                                    <h5>File details</h5>
                                    <p> Uploaded on: {item.uploadTime}</p>
                                    <p> Uploaded from: {item.origin}</p>
                                    <p> size: {formatSize(item.size)}</p>
                                    <button type="button" class="btn btn-outline-primary" onClick={()=> this.Analyze(item.csvFilesId)}>Analyze</button>
                                    <button type="button" class="btn btn-outline-danger" onClick={()=> this.Remove(item.csvFilesId)}>Remove</button>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
