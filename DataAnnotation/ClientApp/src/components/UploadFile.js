import React, { Component } from 'react';
import 'react-dropzone-uploader/dist/styles.css'
import authService from './api-authorization/AuthorizeService'
import Dropzone from 'react-dropzone-uploader'

export class UploadFile extends Component {
    static displayName = UploadFile.name;

    constructor(props) {
        super(props)
        this.state = {
            msg: "",
            Url: "",
            files:[]
        }
    }

    onChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    async getUploadParams ({ file, meta }) {
        let data = new FormData();
        const token = await authService.getAccessToken()
        data.append('files', file);
        return {
            url: 'FilePreview', method: 'POST', body: data, headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }
    }

    render() {

        const handleClick = (e) => {
            e.preventDefault()
            const { msg, url } = this.state
            fetch(url).then(res => {
                res.arrayBuffer().then(buf => {
                    const file = new File([buf], url, { type: '.csv' })
                    this.state.files.add(file)

                })
            })
        }

        // called every time a file's `status` changes
        const handleChangeStatus = ({ meta, file }, status) => {
            if (status === 'rejected_file_type') {
                alert("Incorrect extension file, please upload .csv files");
            }
            else if (status === 'done') {
                this.setState({ msg: "" });                 
            }
        }

        // receives array of files that are done uploading when submit button is clicked
        //pus em comentário pois este era o código do butão submit, mas sabendo que o botão submit
        //era aquela trolada que não fazia nada achei melhor simplesmente tirar
        /*const handleSubmit = (files, allFiles) => {
            console.log(files.map(f => f.meta))
            allFiles.forEach(f => f.remove())
        }*/

        return (                                    
            <div className="drag-container">
                <Dropzone
                    getUploadParams={this.getUploadParams}
                    onChangeStatus={handleChangeStatus}
                    //onSubmit={handleSubmit}
                    accept=".csv"
                    maxSizeBytes={1024 * 1024 * 500}  // max 500 MB
                    inputContent={(files, extra) => (extra.reject ? '.csv files only' : 'Drag CSV Files' )}
                    styles={{
                            dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                            inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                    }}
                />
                <div className="url-container">
                    <input type="text" name="url" className="login-input" placeholder="URL to upload file" onChange={this.onChange.bind(this)} />
                    <button type="button" className="submit-btn" onClick={handleClick}>Upload</button>
                </div>
            </div >
        )
    }
}
