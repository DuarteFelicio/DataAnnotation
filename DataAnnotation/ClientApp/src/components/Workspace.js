﻿import React, { Component } from 'react';
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
        const response = await fetch('Workspace/GetUserFiles', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json();
        this.setState({ files: data });
    }

    showDetail(file) {
        alert(document.getElementById('1').href)
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
                                return <a class="list-group-item list-group-item-action" id={item.csvFilesId} data-toggle="list" role="tab">
                                    <svg class="bi bi-file-text" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fill-rule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clip-rule="evenodd" /></svg>
                                    {item.fileNameDisplay}</a>
                            })}
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="tab-content" id="nav-tabContent">
                            {this.state.files.map(item => {
                                return <div class="tab-pane fade " id={item.csvFlesId} role="tabpanel" aria-labelledby={item.csvFilesId}>
                                    <p> size: {item.size}</p>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
                <script>
                    $(".Container .row .col-sm-8 .list-group").on("click", function(){
                    $(".nav").find(".active").removeClass("active");
                    $(this).addClass("active");
                    });
                    </script>

            </div>
        )
    }
}
