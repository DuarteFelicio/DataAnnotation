import React from 'react';


export class UploadFile extends React.Component {

    constructor(props) {
        super(props);
        this.state = { file: '', msg: '' };
        this.onFileChange = this.onFileChange.bind(this);
        this.uploadFileData = this.uploadFileData.bind(this);
    }

    onFileChange = (event) => {
        this.setState({
            file: event.target.files[0]
        });
    }

    uploadFileData = (event) => {
        event.preventDefault();
        this.setState({ msg: '' });

        let data = new FormData();
        data.append('files', this.state.file);

        fetch('api/filepreview', {
            method: 'POST',
            body: data
        }).then(response => {
            return response.text();
            }).then(data => {
            console.log(data)
            this.setState({ msg: data });
        });
    }
    

    render() {
        return (
            <div id="container">
                <h1>File Upload Example using React</h1>
                <h3>Upload a File</h3>
                <h4>{this.state.msg}</h4>
                <input onChange={this.onFileChange} type="file"></input>
                <button disabled={!this.state.file} onClick={this.uploadFileData}>Upload</button>
            </div>
        )
    }

}
