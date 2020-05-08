import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import Dropzone  from 'react-dropzone'
import 'bootstrap/dist/css/bootstrap.css'
import './UploadFile.css';
import axios from 'axios';
import 'bootstrap';


export class UploadFile extends Component {
    static displayName = UploadFile.name;
    
    constructor() {
        super()
        this.state = {
            accepted: [],
            rejected: [],
            url: "",
            uploading: []
        }

        this.handleClick = this.handleClick.bind(this)
        this.upload = this.upload.bind(this)
        this.removeFileUploading = this.removeFileUploading.bind(this)
        this.handleProgress = this.handleProgress.bind(this)
    }
 
    removeFileUploading(name) {
        var array = this.state.uploading
        var names = array.map(o => o.name)
        var index = names.indexOf(name)
        if (index !== -1) {
            array.splice(index, 1)
            this.setState({
                uploading: array
            })
        }
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleClick(e){
        e.preventDefault()
        this.uploadFromUrl(this.state.url)
    }

    handleProgress(progressEvent, name) {
        const { loaded, total } = progressEvent;
        let percent = Math.floor((loaded * 100) / total)
        console.log(`${loaded}kb of ${total}kb | ${percent}%`);

        var array = this.state.uploading
        var names = array.map(o => o.name)
        var index = names.indexOf(name)
        array[index].percentage = percent;
        this.setState({ uploadPercentage: array })
    }

    async upload(file) {
        let data = new FormData();
        const token = await authService.getAccessToken()
        data.append('files', file);
        
        const options = {
            onUploadProgress: (progressEvent) => {
                this.handleProgress(progressEvent, file.name)
            },
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }
        this.setState({
            uploading: this.state.uploading.concat(
                {
                    name: file.name,
                    percentage: 0,
                    method: "local"
                })
        })
        axios.post("FileUpload/Physical", data, options)
            .then(res => {
                setTimeout(() => {
                    this.removeFileUploading(file.name)
                    this.setState({ accepted: this.state.accepted.concat(file) })
                }, 1000)
            }).catch(err => {
                setTimeout(() => {
                    this.removeFileUploading(file.name)
                    this.setState({ rejected: this.state.rejected.concat(file) })
                }, 1000)
            })
    }

    async uploadFromUrl(url) {
        const token = await authService.getAccessToken()
        var urlArray = url.split('/')
        var name = urlArray[urlArray.length-1]
        const options = {           
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` },
            transformResponse: axios.defaults.transformResponse.concat((data) => {
                return data
            })
        }
        this.setState({
            uploading: this.state.uploading.concat(
                {
                    name: name,
                    method: "remote"
                })
        })
        axios.post(`FileUpload/Remote?url=${url}`, null, options)
            .then(response => {                
                setTimeout(() => {
                    this.removeFileUploading(name)
                    this.setState({
                        accepted: this.state.accepted.concat([
                            {
                                name: response.data.name,
                                size: response.data.size
                            }])
                    })
                }, 1000)
            })
            .catch(err => {
                setTimeout(() => {
                    this.removeFileUploading(name)
                    this.setState({
                        rejected: this.state.rejected.concat([
                            {
                                name: url,
                                size: 0
                            }])
                    })
                }, 1000)
            })
    }

    renderUploadingFiles() {
        if (!this.state.uploading.length) {
            return;
        }
        var remoteOrLocal = (file) => {
            if (file.method === "local") {
                return (
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped active" role="progressbar"
                            aria-valuenow={file.percentage} aria-valuemin="0" aria-valuemax="100" style={{ width: file.percentage + '%' }}>
                            {file.percentage}%
                        </div>
                    </div>
                )
            }
            // file remote
            return (
                <div class="spinner-border text-primary"></div>
            )
        }
        return (
            <div className="uploadingFiles">
                <h4>Uploading files:</h4>
                <ul>
                    {this.state.uploading.map(o =>
                        <li key={o.name}>{o.name}{remoteOrLocal(o)}</li>
                    )}
                </ul>
            </div>
        )
    }

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
                            accept.forEach(file => this.upload(file))
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
                    <div className="url-container">
                        <input type="text" name="url" className="login-input" placeholder="URL to upload file" onChange={this.onChange.bind(this)} />
                        <button type="button" class="btn btn-outline-primary" onClick={this.handleClick}>Upload</button>
                    </div>
                    {this.renderUploadingFiles()}
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



