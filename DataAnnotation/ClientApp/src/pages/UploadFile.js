import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import Dropzone from '../components/Dropzone'
import ListGroup from '../components/ListGroup'
import 'bootstrap/dist/css/bootstrap.css'
import './UploadFile.css';
import axios from 'axios';
import 'bootstrap';
import titleBackground from '../assets/titleBackgroundUpload.jpg'
import { Accordion, Card, Button, Carousel, Jumbotron } from 'react-bootstrap'

const acceptedSymbol = <svg class="bi bi-file-earmark-arrow-down" width="50" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 1h5v1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6h1v7a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2z" />
    <path d="M9 4.5V1l5 5h-3.5A1.5 1.5 0 019 4.5z" />
    <path fill-rule="evenodd" d="M5.646 9.146a.5.5 0 01.708 0L8 10.793l1.646-1.647a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 010-.708z" clip-rule="evenodd" />
    <path fill-rule="evenodd" d="M8 6a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4A.5.5 0 018 6z" clip-rule="evenodd" />
</svg>;

const rejectedSymbol = <svg class="bi bi-x-circle" width="50" height="25" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm0 1A8 8 0 108 0a8 8 0 000 16z" clip-rule="evenodd" />
    <path fill-rule="evenodd" d="M11.854 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708-.708l7-7a.5.5 0 01.708 0z" clip-rule="evenodd" />
    <path fill-rule="evenodd" d="M4.146 4.146a.5.5 0 000 .708l7 7a.5.5 0 00.708-.708l-7-7a.5.5 0 00-.708 0z" clip-rule="evenodd" />
</svg>;

const uploadingSymbol = <svg class="bi bi-download" width="50" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M.5 8a.5.5 0 01.5.5V12a1 1 0 001 1h12a1 1 0 001-1V8.5a.5.5 0 011 0V12a2 2 0 01-2 2H2a2 2 0 01-2-2V8.5A.5.5 0 01.5 8z" clip-rule="evenodd" />
    <path fill-rule="evenodd" d="M5 7.5a.5.5 0 01.707 0L8 9.793 10.293 7.5a.5.5 0 11.707.707l-2.646 2.647a.5.5 0 01-.708 0L5 8.207A.5.5 0 015 7.5z" clip-rule="evenodd" />
    <path fill-rule="evenodd" d="M8 1a.5.5 0 01.5.5v8a.5.5 0 01-1 0v-8A.5.5 0 018 1z" clip-rule="evenodd" />
</svg>;

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

        this.handleUploadFromUrlClick = this.handleUploadFromUrlClick.bind(this)
        this.upload = this.upload.bind(this)
        this.uploadFromUrl = this.uploadFromUrl.bind(this)
        this.formatSize = this.formatSize.bind(this)
        this.onDrop = this.onDrop.bind(this)
        this.toShow = this.toShow.bind(this)
        this.remoteOrLocal = this.remoteOrLocal.bind(this)
    }

    //remove file from uploading area when the upload completes
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

    //callback for dropzone
    onDrop(accept, reject) {
        this.setState({ rejected: this.state.rejected.concat(reject) })
        accept.forEach(file => this.upload(file))
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    //callback for upload URL button
    handleUploadFromUrlClick(e) {
        e.preventDefault()
        this.uploadFromUrl(this.state.url)
    }

    formatSize(size, b = 2){
        if (0 === size) return "0 Bytes";
        const c = 0 > b ? 0 : b, d = Math.floor(Math.log(size) / Math.log(1024));
        return parseFloat((size / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
    }

    //upload local file
    async upload(file) {
        let data = new FormData();
        const token = await authService.getAccessToken()
        data.append('files', file);
        
        const options = {
            onUploadProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;
                let percent = Math.floor((loaded * 100) / total)
                var array = this.state.uploading
                var names = array.map(o => o.name)
                var index = names.indexOf(file.name)
                array[index].percentage = percent;
                this.setState({ uploadPercentage: array })
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

    //upload file from URL
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

    toShow(file) {
        return (<div class="column">{file.name} - { this.formatSize(file.size) }</div> )
    }

    remoteOrLocal(file) {
        if (file.method === "local") {
            return (
                <div class="column" style={{ width: '100%' }}>
                    {file.name}
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped active" role="progressbar"
                            aria-valuenow={file.percentage} aria-valuemin="0" aria-valuemax="100" style={{ width: file.percentage + '%' }}>
                            {file.percentage}%
                                </div>
                    </div>
                </div>
            )
        }
        return (
            <div class="column" style={{ width: '100%' }}>{file.name}<div class="spinner-border text-primary"></div></div>
        )
    }

    renderFiles(fileList, title, symbol, toShow, classDiv, backgroundColor) {
        if (!fileList.length) {
            return
        }
        return (
            <div class={classDiv} style={{ backgroundColor: backgroundColor, borderRadius: "20px"}}>
                <div style={{ padding:"10px 10px 10px 10px" }}>
                    <ListGroup
                        title={title}
                        files={fileList}
                        symbol={symbol}
                        toShow={toShow}
                        history={this.props.history}
                    />
                </div>
            </div>
        )
    }

    render() {        
        return (
            <div style={{ minHeight: "808px", backgroundColor:"#F0F0F0" }}>
                <div style={{ backgroundImage: "url(" + titleBackground + ")", padding: "10px 0px 10px 0px" }}>
                    <h1 class="row justify-content-md-center" style={{ width: "100%" }}>Upload File</h1>
                    <h4 class="row justify-content-md-center" style={{ marginTop: 25, width: "100%" }}>Upload your files here</h4>
                </div>
                <section className="container" style={{ marginTop: "20px", fontFamily:'Open Sans'}}>
                    <div className="root-dropzone">
                        <Dropzone                
                            accept=".csv"
                            onDrop={this.onDrop}
                            history={this.props.history}
                            text={
                                <div align="center">
                                    <p>Try dropping some files here, or click to select files to upload.</p>
                                    <p>Only csv files will be accepted</p>
                                </div>}
                        />
                    </div>
                    <aside>
                        <div className="url-container">
                            <input type="text" name="url" size="75" className="login-input" placeholder="URL to upload file" onChange={this.onChange.bind(this)} />
                            <button type="button" class="btn btn-outline-primary" onClick={this.handleUploadFromUrlClick}>Upload</button>
                        </div>
                        <div class="row">
                            {this.renderFiles(this.state.uploading, "Uploading files:", uploadingSymbol, this.remoteOrLocal, "col-12", "#60AAEB")}
                        </div>
                        <div class="row" style={{ marginTop: "15px" }}>
                            {this.renderFiles(this.state.accepted, "Accepted Files:", acceptedSymbol, this.toShow, "col-6", "#B6EF8E")}
                            {this.renderFiles(this.state.rejected, "Rejected Files:", rejectedSymbol, this.toShow, "col-6", "#EB5C5C")}
                        </div>                    
                    </aside>
                </section>
            </div>
        );
    }
}



