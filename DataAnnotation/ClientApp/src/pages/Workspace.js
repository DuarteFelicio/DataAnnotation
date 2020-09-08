import React, { Component } from 'react';
import { Container } from 'reactstrap';
import authService from './api-authorization/AuthorizeService'
import 'bootstrap/dist/css/bootstrap.css'
import { Form, Col, InputGroup, FormControl } from 'react-bootstrap'
import 'bootstrap';
import './Workspace.css'
import ModalComp from '../components/ModalComp.js'
import titleBackground from '../assets/titleBackgroundWorkspace.jpg'

export class Workspace extends Component {

    static displayName = Workspace.name;

    constructor(props) {
        super(props)
        this.state = {
            files: new Map(),
            requestLoops: [],
            onShowDeleteModal: false,
            searchByName: '',
            idToRemove: -1
        }
        this.enableDeleteModal = this.enableDeleteModal.bind(this)
        this.disableDeleteModal = this.disableDeleteModal.bind(this)
        this.removeFile = this.removeFile.bind(this)
        this.Remove = this.Remove.bind(this)
        this.handleOnChange = this.handleOnChange.bind(this)
    }

    handleOnChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        const response = await fetch('Workspace/GetUserFiles', {
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()  
        var allFiles = new Map()
        data.forEach(file => {
            allFiles.set(file.csvFileId, file)
        })
        this.setState({ files: allFiles })
        data.forEach(f => {
            if (f.isAnalysing === true) {
                this.checkAnalysisStatus(f.csvFileId,token)
            }
        })
    }

    async componentWillUnmount() {
        this.state.requestLoops.forEach(rl => {
            clearInterval(rl)
        })
    }

    removeFile(Id) {
        var mapAux = this.state.files
        mapAux.delete(Id)
        this.setState({
            files: mapAux
        })
    }

    async Analyze(id) {
        const token = await authService.getAccessToken();
        var map = this.state.files
        fetch(`Workspace/AnalyseFile?fileId=${id}`, {
            method : 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
        .then(newFile => {
            map.set(id, newFile)
            this.setState({ files: map })
        })
        this.checkAnalysisStatus(id,token) 
    }

    async checkAnalysisStatus(id, token) {
        var map = this.state.files
        var requestLoop = setInterval(function () {
            fetch(`Workspace/IsAnalysisComplete?fileId=${id}`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (res.status !== 204) { //204 = empty response -> not yet completed analysis
                    res.json().then(newFile => {
                        map.set(id, newFile)
                        stopLoop(map)
                    })
                }
            })
        }, 5000); //5 seconds
        this.setState({ requestLoops: this.state.requestLoops.concat(requestLoop) })

        var stopLoop = (newMap) => {
            this.setState({ files: newMap })
            this.forceUpdate()
            clearInterval(requestLoop)
        }
    }

    //redirect to Analysis
    async Analyzis(id) {
        this.props.history.push(`/workspace/analysis/${id}`)        
    }

    async DownloadAnalyzis(id,fileName) {
        const token = await authService.getAccessToken();

        fetch(`Workspace/DownloadAnalysis?fileId=${id}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(response => {
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = fileName.split('.')[0] + '_analysis' + '.json';
                a.click();
            });
        });

    }

    enableDeleteModal(id) { this.setState({ onShowDeleteModal: true, idToRemove: id }) }
    
    disableDeleteModal() { this.setState({ onShowDeleteModal: false }) }

    //delete a file from workspacce
    async Remove() {
        const token = await authService.getAccessToken();
        let id = this.state.idToRemove
        fetch(`Workspace/RemoveFile?fileId=${id}`, {
            method: 'DELETE',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            this.removeFile(id)
            this.disableDeleteModal()
        })                   
    }

    showTime(value) {        
        let str = ""
        let time = value.split(':')
        let milliseconds = time[2].split('.')[1]
        let newValue = new Object()
        newValue.hours = time[0]
        newValue.minutes = time[1]
        newValue.seconds = time[2].split('.')[0]
        newValue.milliseconds = milliseconds
        if (newValue.hours !== '00')
            str += newValue.hours + "h "
        if (newValue.minutes !== '00')
            str += newValue.minutes + "m "
        if (newValue.seconds !== '00')
            str += newValue.seconds +  "s "
        str += newValue.milliseconds + "ms "
        return str
    }

    renderAnalysis(item) {
        var isAnalysing = item.isAnalysing;
            return (
                <div>
                    {!isAnalysing && <button type="button" class="btn btn-outline-primary" onClick={() => this.Analyze(item.csvFileId)}>Analyse</button>}
                    {isAnalysing && <div><p>Analysing</p><div class="spinner-border text-primary"></div></div>}
                </div>
            )        
    }

    renderAnalysisInfo(item) {
        let array = []
        array.push(<tr><th>Analysis Duration</th><td>{this.showTime(item.analysisDuration)}</td></tr>)    
        array.push(<tr><th>Analysis Completed on</th><td>{item.analysisCompletionTime.split("T")[0]}</td></tr> )
        return array                                    
    }

    renderAnalysisButton(item) {
        return (
            <div>
                <button type="button" class="btn btn-outline-primary" style={{ marginRight: "8px"}} onClick={() => this.Analyzis(item.csvFileId)}>Go to Analysis</button>
                <button type="button" class="btn btn-outline-primary" onClick={() => this.DownloadAnalyzis(item.csvFileId, item.fileNameDisplay)}>Download Analysis</button> 
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
            <div style={{ backgroundColor: "#F0F0F0", minHeight:"808px" }}>
                <div style={{ backgroundImage: "url(" + titleBackground + ")", padding: "10px 0px 10px 0px" }}>
                    <h1 class="row justify-content-md-center" style={{ width: "100%" }}>My Workspace</h1>
                    <h4 class="row justify-content-md-center" style={{ marginTop: 25, width: "100%" }}>Search, Analyse and Visualize.</h4>
                </div>
                <Container style={{ marginTop: "20px", fontFamily:'Open Sans'}}>      
                    <div class="row">
                        <Col sm={6}>
                            <InputGroup className="mb-2">
                                <InputGroup.Prepend>
                                    <InputGroup.Text id="basic search">{
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z" />
                                            <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
                                        </svg>
                                    }</InputGroup.Text>
                                </InputGroup.Prepend>
                                <FormControl placeholder="Search by name ..." name="searchByName" type="text" onChange={this.handleOnChange} />
                            </InputGroup>
                        </Col>
                    </div>
                    <div class="row">
                        <div class = "col-sm-6">
                            <div class="list-group" id="list-tab" role="tablist">
                                {Array.from(this.state.files).map(([key, item]) => {
                                    if (item.fileNameDisplay.split('.')[0].toLowerCase().includes(this.state.searchByName.toLowerCase()))
                                        return <a class="list-group-item list-group-item-action" id={'list-' + item.csvFileId} data-toggle="list" href={'#details-' + item.csvFileId} role="tab" >
                                        <div class="row" style={{ height:30 }}>
                                            <div class="column">
                                                <svg class="bi bi-file-text" width="100" height="35" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" ><path fill-rule="evenodd" d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm0 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1H4z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M4.5 10.5A.5.5 0 015 10h3a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 8h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 6h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5zm0-2A.5.5 0 015 4h6a.5.5 0 010 1H5a.5.5 0 01-.5-.5z" clip-rule="evenodd" /></svg>
                                            </div>
                                            <div class="column">
                                                    {item.fileNameDisplay.split('.')[0].length > 55 ? item.fileNameDisplay.split('.')[0].substring(0, 52)+'...' : item.fileNameDisplay.split('.')[0]}
                                            </div>
                                        </div>
                                    </a>
                                })}
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="tab-content" id="nav-tabContent" >
                                {Array.from(this.state.files).map(([key, item]) => {
                                    return <div style={{ borderColor: "#45ABD1", borderStyle:"solid", borderRadius: "20px", padding:7 }} class="tab-pane fade" id={'details-' + item.csvFileId} role="tabpanel" aria-labelledby={'list-' + item.csvFileId}>
    
                                        <table class="table table-striped">
                                            <tbody>
                                                <tr><th>Uploaded on</th><td>{item.uploadTime.split("T")[0]}</td></tr>
                                                <tr><th>Uploaded from</th><td>{item.origin === 'local' ? 'local' : 'URL'}</td></tr>
                                                <tr><th>Size</th><td>{formatSize(item.size)}</td></tr>
                                                {item.analysisDuration !== null && this.renderAnalysisInfo(item)}
                                            </tbody>
                                        </table>
                                        <div class="row" style={{ paddingLeft:"24px" }}>
                                            {item.analysisDuration !== null && this.renderAnalysisButton(item)}
                                            {item.analysisDuration === null && this.renderAnalysis(item)}
                                            <button type="button" class="btn btn-outline-danger" style={{marginLeft:"8px"}} onClick={() => this.enableDeleteModal(item.csvFileId)}>Remove</button>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                    <ModalComp
                        title="Delete File"
                        body="Are you sure you want to delete this file. This will delete every analysis (if any) as well as the file itself."
                        okButtonText="Delete"
                        okButtonFunc={this.Remove}
                        cancelButtonFunc={this.disableDeleteModal}
                        visible={this.state.onShowDeleteModal}
                    />
                </Container>
            </div>
        )
    }
}
