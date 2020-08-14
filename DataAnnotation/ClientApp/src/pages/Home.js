import React, { Component } from 'react';
import { Container } from 'reactstrap';
import authService from './api-authorization/AuthorizeService'
import { Accordion, Card, Button, Carousel } from 'react-bootstrap'
import CardComp from '../components/CardComp'
import { PieChart, Pie, Sector } from 'recharts';
import PieChartComp from '../components/PieChartComp'
import gif1 from '../assets/cafe.gif'
import gif2 from '../assets/tenor.gif'
import gif3 from '../assets/yo.gif'
import image1 from '../assets/analysefile.png'
import image2 from '../assets/uploadfile.png'
import image3 from '../assets/workspace.png'
import background from '../assets/background.jpeg'

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
        let auth = await authService.getAccessToken()        
        if (auth !== null) {
            //fetch para saber os dados do user
            this.setState({
                Auth: true,
                userName: "ivo está a dar yeet de novo",
                currentUploadedFiles: 15,
                lastActions: [],
                currentAnalysedFiles: 6,
                localUploaded: 12,
                urlUploaded: 3,
                lastLogin: "10/7/2020",
                activeIndexAnalysed: 0,
                activeIndexUploaded: 0
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
            <Container>
                <h1 class="row justify-content-md-center">Welcome back {this.state.userName}!</h1>
                <h4 style={{ marginTop:50 }}>Here is some general data about you:</h4>
                <div class="row" style={{ marginTop:50 }}>
                    <div class="col-4"> 
                        <CardComp 
                            title='Current Uploaded Files'
                            body={this.state.currentUploadedFiles}
                            />
                    </div>
                    <div class="col-4"> 
                        <CardComp
                            title='Previous Actions'
                            body={this.state.lastActions}
                            />
                    </div>
                        <div class="col-4"> 
                            <CardComp
                                title='Last Login'
                                body={this.state.lastLogin}
                            />
                    </div>
                </div>
                <div class="row" style={{ marginTop: 50 }}>
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
        )
    }

    renderNotAuth() {
        return (
            <div>
                <Carousel>
                    <Carousel.Item>
                        <img src={gif1} width="100%" height={500}/>
                        <Carousel.Caption>
                            <h3>First slide label</h3>
                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={gif2} width="100%" height={500}/>
                        <Carousel.Caption>
                            <h3>Second slide label</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img src={gif3} width="100%" height={500}/>
                        <Carousel.Caption>
                            <h3>Third slide label</h3>
                            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
                <div class="row">
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px"}}>
                        <img src={image2} style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                    </div>
                    <div class="col-4" style={{ padding: "100px 100px 100px 100px" }}>
                        <h3>Upload File</h3>
                        <p>In order for us to analyse the files, you need to first upload them, that's where this page comes in hand!</p>
                        <p>In our Upload File you can upload files in two different ways, locally or trough an URL you can supply us.</p> 
                    </div>
                </div>
                <div class="row">
                    <div class="col-4" style={{ padding: "100px 100px 100px 100px" }}>
                        <h3>Workspace</h3>
                        <p>After uploading your file you can begin the automated analysis!</p>
                    </div>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <img src={image3} style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                    </div>
                </div>
                <div class="row">
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <img src={image1} style={{ height: "100%", width: "100%", objectFit: "contain" }} />
                    </div>
                    <div class="col-4" style={{ padding: "100px 100px 100px 100px" }}>
                        <h3>Analyse File</h3>
                        <p>Our analysis can have some unwanted errors :(, that's where you come in!</p>
                        <p>With our simple and interactive drag & drop tecnology you can customize our analysis in any way you want!</p>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div style={{width: "100%", height:"100%" }}>
                {this.state.Auth ? this.renderAuth() : this.renderNotAuth()}
            </div>
    );
  }
}

//<div style={{ backgroundImage: `url(${background})`, width: "100%", height:"100%" }}>