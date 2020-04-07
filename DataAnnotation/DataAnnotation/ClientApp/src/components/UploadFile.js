import React, { Component } from 'react';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'

export class UploadFile extends Component {
    static displayName = UploadFile.name;

    constructor(props) {
        super(props)
    }

    render() {
        const getUploadParams = ({ meta }) => { return { url: 'api/filepreview' } }

        // called every time a file's `status` changes
        const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }

        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = (files, allFiles) => {
            console.log(files.map(f => f.meta))
            allFiles.forEach(f => f.remove())
        }
        return (
            <Dropzone
                getUploadParams={getUploadParams}
                onChangeStatus={handleChangeStatus}
                onSubmit={handleSubmit}
                accept=".csv"
            />
        )
        
    }


    

}
