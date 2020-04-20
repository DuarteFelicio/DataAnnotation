import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import Dropzone  from 'react-dropzone'
import 'bootstrap/dist/css/bootstrap.css'
import './UploadFile.css';


export class UploadFile extends Component {
    static displayName = UploadFile.name;

    constructor() {
        super()
        this.state = {
            accepted: [],
            rejected: []
        }
    }


    async upload(files) {
        files.foreach(file => {
            let data = new FormData();
            const token = await authService.getAccessToken()
            data.append('files', file);
            const response = await fetch('FileUpload/Physical', {
                method: 'POST',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
                body: data
            })
            if (response.status != 200) {
                this.setState({ rejected: this.state.rejected.push(file) })
            }
            else {
                this.setState({ accepted: this.state.accepted.push(file) })
            }
        })
    }

    /**
     * 
     * @param {any} param0
     
    async getUploadParams ({ file, meta }) {
        let data = new FormData();
        const token = await authService.getAccessToken()
        data.append('files', file);
        return {
            url: 'FileUpload', method: 'POST', body: data, headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }
    }
*/
    render() {
        const formatSize = (size, b = 2) => {
            if (0 === size) return "0 Bytes";
            const c = 0 > b ? 0 : b, d = Math.floor(Math.log(size) / Math.log(1024));
            return parseFloat((size / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        }

        return (
            <section className = "container">
                <div className="root-dropzone">
                    <Dropzone                
                        accept=".csv"
                        onDrop={(accept, reject) => {
                            this.setState({ rejected: this.state.rejected.concat(reject) })
                            this.upload(accept)
                            
                        }}
                    >
                        {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} className="dropzone">
                                <input {...getInputProps()} />
                                <p>Try dropping some files here, or click to select files to upload.</p>
                                <p>Only csv files will be accepted</p>
                            </div>
                        )}
                    </Dropzone>
                </div>
                <aside>
                    <h4>Accepted files:</h4>
                    <ul>
                        {
                            this.state.accepted.map(f => <li key={f.name}>{f.name} - {formatSize(f.size)} </li>)
                        }
                    </ul>
                    <h4>Rejected files:</h4>
                    <ul>
                        {
                            this.state.rejected.map(f => <li key={f.name}>{f.name} - {formatSize(f.size)} </li>)
                        }
                    </ul>
                </aside>
            </section>
        );
    }
}
