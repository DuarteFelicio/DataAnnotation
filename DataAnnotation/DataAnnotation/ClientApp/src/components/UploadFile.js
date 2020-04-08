import React, { Component } from 'react';
import 'react-dropzone-uploader/dist/styles.css'
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
        
    
        const getUploadParams = ({ file, meta }) => {
            return {
                url: 'api/filepreview', method: 'POST', file
            }
        }

        // called every time a file's `status` changes
        const handleChangeStatus = ({ meta, file }, status) => {
            if (status == 'rejected_file_type') {
                this.state.msg = "incorrect extension file, please upload .csv files"
            }
            else if (status == 'done') {
                this.state.msg = ""                 
                }
            }
        

        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = (files, allFiles) => {
            console.log(files.map(f => f.meta))
            allFiles.forEach(f => f.remove())
        }
        return (
            <div className="drag-container">
            <Dropzone
                getUploadParams={getUploadParams}
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                accept=".csv"
                />
                <div className="url-container">
                    <input type="text" name="url" className="login-input" placeholder="URL to upload file" onChange={this.onChange.bind(this)} />
                    <button type="button" className="submit-btn" onClick={handleClick}>Upload</button>
                    </div>
            </div >

        )
        
    }


    

}
