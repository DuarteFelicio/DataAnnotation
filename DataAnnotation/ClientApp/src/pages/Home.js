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
            activeIndex: 0,
            render: false
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
                            activeIndexUploaded: 0,
                            render: true
                        })
                    })
                }
                else {
                    this.setState({render:true})
                }
            })            
        }
        else {
             this.setState({
                render : true
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
                    <h4 class="row justify-content-md-center" style={{ marginTop: 25, width: "100%" }}>Here is some general data about you:</h4>
                </div>
                <Container style={{ fontFamily: 'Open Sans' }}>
                    <div class="row" style={{ marginTop: 30 }}>
                        <div class="col-6" style={{ marginLeft: 161 }}> 
                            <CardComp
                                title='Previous Actions'
                                body={this.renderLastActions(this.state.lastActions)}
                                />
                        </div>
                        <div class="col-3"> 
                            <div class="row">
                                <CardComp
                                    title='Uploaded Files'
                                    body={this.state.currentUploadedFiles}
                                />
                            </div>
                            <div class="row" style={{marginTop:"15px"}}>
                                <CardComp
                                    title='Previous Login'
                                    body={this.state.lastLogin}
                                />
                            </div>
                        </div>
                    </div>
                    <div class="row" >
                        <div class="col-6">
                            <PieChartComp
                                width={700}
                                height={369}
                                activeIndex={this.state.activeIndexAnalysed}
                                data={analysedFilesData}
                                cx={300}
                                cy={200}
                                innerRadius={90}
                                outerRadius={120}
                                fill='Tomato'
                                dataKey="value"
                                onMouseEnter={this.onPieEnterAnalysed}
                            />
                        </div>
                        <div class="col-6">
                            <PieChartComp
                                width={700}
                                height={369}
                                activeIndex={this.state.activeIndexUploaded}
                                data={uploadedURL}
                                cx={300}
                                cy={200}
                                innerRadius={90}
                                outerRadius={120}
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
                <div>
                    <Carousel interval="10000">
                        <Carousel.Item>
                            <img src={gif1} width="100%"/>
                            <Carousel.Caption style={{color:"black"}}>

                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={gif2} width="100%" />
                            <Carousel.Caption style={{ color: "black" }}>

                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={gif3} width="100%" />
                            <Carousel.Caption style={{ color: "black" }}>

                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>
            </div>
        );
    }

    render() {
        if (this.state.render) {
            return (
                <div style={{ width: "100%", backgroundColor: "#F0F0F0", minHeight: "808px" }}>
                    {this.state.Auth ? this.renderAuth() : this.renderNotAuth()}
                </div>
            )
        }
        return <div></div>
    }
 }


/*
*/