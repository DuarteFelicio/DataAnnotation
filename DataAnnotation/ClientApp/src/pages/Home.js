import React, { Component } from 'react';
import { Container } from 'reactstrap';
import authService from './api-authorization/AuthorizeService'
import { Accordion, Card, Button, Carousel, Jumbotron } from 'react-bootstrap'
import CardComp from '../components/CardComp'
import { PieChart, Pie, Sector } from 'recharts';
import PieChartComp from '../components/PieChartComp'
import gif1 from '../assets/uploadFile.gif'
import gif2 from '../assets/workspace.gif'
import gif3 from '../assets/analysis.gif'
import analyseFileImage from '../assets/analysefile.png'
import uploadFileImage from '../assets/uploadfile.png'
import workspaceImage from '../assets/workspace.png'
import titleBackground from '../assets/titleBackground.jpg'
import './Home.css';

export class Home extends Component {

    static displayName = Home.name;

    constructor(props) {
        super(props)
        this.state = {
            Auth: false,
            userName: "",
            currentUploadedFiles: 0,
            lastActions: [],
            currentAnalysedFiles: 0,
            localUploaded: 0,
            urlUploaded: 0,
            lastLogin: "",
            activeIndex: 0
        }
    }

    async componentDidMount() {
        let token = await authService.getAccessToken()        
        if (token !== null) {
            //fetch para saber os dados do user
            fetch(`Home/GetUserDetails`, {
                method: 'GET',
                headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (res.status !== 204) {
                    res.json().then(details => {
                        let lastLoginString = details.lastLogin.split('T')
                        let finalString = lastLoginString[0] + ' ' + lastLoginString[1].split('.')[0]
                        this.setState({
                            Auth: true,
                            userName: details.userName,
                            currentUploadedFiles: details.currentUploadedFiles,
                            lastActions: details.lastActions,
                            currentAnalysedFiles: details.currentAnalysedFiles,
                            localUploaded: details.localUploaded,
                            urlUploaded: details.urlUploaded,
                            lastLogin: finalString,
                            activeIndexAnalysed: 0,
                            activeIndexUploaded: 0
                        })

                    })
                }
            })
                
        }
    }

    onPieEnterUploaded = (data, index) => {
        this.setState({
            activeIndexUploaded: index,
        });
    };

    onPieEnterAnalysed = (data, index) => {
        this.setState({
            activeIndexAnalysed: index,
        });
    };

    renderLastActions(lastActions) {
        return lastActions.map(action => {
            if (action.Action === 'Analyze') {
                return <div class="row" style={{ paddingLeft: 10 }}><a href={'/workspace/analysis/' + action.CsvFileId}>The analysis for the file {action.FileName} is finished!</a></div>
            }
            return <div class="row" style={{ paddingLeft: 10 }}><a href={'/workspace/analysis/' + action.CsvFileId + '?Version=' + action.Version}>You were working on {action.FileName} (version {action.Version})</a></div>
        })
    }

    renderAuth() {
        const analysedFilesData = [
            { name: 'Not Analysed', value: this.state.currentUploadedFiles - this.state.currentAnalysedFiles },
            { name: 'Analysed', value: this.state.currentAnalysedFiles}
        ];

        const uploadedURL = [
            { name: 'Files Uploaded Locally', value: this.state.localUploaded },
            { name: 'Files Uploaded URL', value: this.state.urlUploaded }
        ];

        return (
            <div>
                <div style={{ backgroundImage: "url(" + titleBackground + ")", padding: "10px 0px 10px 0px" }}>
                    <h1 class="row justify-content-md-center" style={{width:"100%"}}>Welcome back {this.state.userName}!</h1>
                    <h4 class="row justify-content-md-center" style={{ marginTop: 50, width: "100%" }}>Here is some general data about you:</h4>
                </div>
                <Container style={{ fontFamily: 'Open Sans' }}>
                    <div class="row" style={{ marginTop:30 }}>
                        <div class="col-3"> 
                            <CardComp 
                                title='Uploaded Files'
                                body={this.state.currentUploadedFiles}
                                />
                        </div>
                        <div class="col-6"> 
                            <CardComp
                                title='Previous Actions'
                                body={this.renderLastActions(this.state.lastActions)}
                                />
                        </div>
                            <div class="col-3"> 
                                <CardComp
                                    title='Last Login'
                                    body={this.state.lastLogin}
                                />
                        </div>
                    </div>
                    <div class="row" style={{ marginTop: 30 }}>
                        <div class="col-6">
                            <PieChartComp
                                width={600}
                                height={400}
                                activeIndex={this.state.activeIndexAnalysed}
                                data={analysedFilesData}
                                cx={300}
                                cy={200}
                                innerRadius={100}
                                outerRadius={140}
                                fill='Tomato'
                                dataKey="value"
                                onMouseEnter={this.onPieEnterAnalysed}
                                />
                        </div>
                        <div class="col-6">
                            <PieChartComp
                                width={600}
                                height={400}
                                activeIndex={this.state.activeIndexUploaded}
                                data={uploadedURL}
                                cx={300}
                                cy={200}
                                innerRadius={100}
                                outerRadius={140}
                                fill='Tomato'
                                dataKey="value"
                                onMouseEnter={this.onPieEnterUploaded}
                            />
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    renderNotAuth() {
        return (
            <div>
                <div style={{ borderBottom: 2, borderTop: 2, borderLeft: 0, borderRight:0, borderStyle: 'solid' }}>
                    <Carousel interval="11000">
                        <Carousel.Item>
                            <img src={gif1} width="100%" height={500}/>
                            <Carousel.Caption style={{color:"black"}}>

                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={gif2} width="100%" height={500}/>
                            <Carousel.Caption style={{ color: "black" }}>

                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={gif3} width="100%" height={500}/>
                            <Carousel.Caption style={{ color: "black" }}>

                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>
                <div class="row" style={{ backgroundColor: "#F5F5F5", maxWidth:"1919px"}}>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>                                     
                        <img src={uploadFileImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />                       
                    </div>
                    <div class="col-4" style={{ padding: "150px 150px 100px 75px" }}>
                        <Jumbotron>
                            <h3>Upload File</h3>
                            <p></p>
                            <p>In order for us to analyse the files, you need to first upload them, that's where this page comes in hand!</p>
                            <p>In our <strong>Upload File</strong> page you can upload files in two different ways, locally or trough an URL you can supply us.</p>
                            <p>Simply drag over, browse or supply the link and the file will be uploaded automatically!</p>
                        </Jumbotron>
                    </div>
                </div>
                <div class="row" style={{ maxWidth: "1919px" }}>
                    <div class="col-4" style={{ padding: "150px 75px 100px 150px" }}>
                        <Jumbotron>
                            <h3>Workspace</h3>
                            <p></p>
                            <p>After uploading your file you can begin the automated analysis!</p>
                            <p>Just head over to the <strong>My Workspace</strong> page, select the file you want to analyse and press the <strong>Analyse</strong> button to begin the automated analysis.</p>
                            <p>The analysis may take a while, however, you can start multiple analysis at the same time.</p>
                            <p>Once the analysis completes, you can download it or check it out and customize it in our visualization.</p>
                        </Jumbotron>
                    </div>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <img src={workspaceImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                    </div>
                </div>
                <div class="row" style={{ backgroundColor: "#F5F5F5", maxWidth: "1919px" }}>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <img src={analyseFileImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                    </div>
                    <div class="col-4" style={{ padding: "150px 150px 100px 75px" }}>
                        <Jumbotron>
                            <h3>Analyse File</h3>
                            <p></p>
                            <p>Our analysis can have some unwanted errors, that's where you come in.</p>
                            <p>Simply <strong>Go to Analysis</strong> and begin your customization!</p>
                            <p>With our simple and interactive drag & drop tecnology you can customize our analysis in any way you want!</p>
                            <p>You can even save the new changes and download the new and improved analysis, don't worry, if you save or change anything by accident we always keep track of the versions.</p>
                        </Jumbotron>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div style={{ width: "100%", backgroundColor: "#F0F0F0", minHeight: "1080px" }}>
                {this.state.Auth ? this.renderAuth() : this.renderNotAuth()}
            </div>
    );
  }
}

//<div style={{ backgroundImage: `url(${background})`, width: "100%", height:"100%" }}>