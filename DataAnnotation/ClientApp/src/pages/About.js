import React, { Component } from 'react'
import analyseFileImage from '../assets/analysefile.png'
import uploadFileImage from '../assets/uploadfile.png'
import workspaceImage from '../assets/workspace.png'
import duarteImage from '../assets/Duarte.jpg'
import cafeImage from '../assets/cafe.jpg'
import ivoImage from '../assets/ivo.jpg'
import { Accordion, Card, Button, Carousel, Jumbotron } from 'react-bootstrap'
import CardComp from '../components/CardComp'

export default class About extends Component {

    static displayName = About.name;

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <div class="row" style={{ backgroundColor: "#F5F5F5", maxWidth: "1919px" }}>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <figure>
                            <img src={uploadFileImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                         </figure>
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
                    <div class="col-4" style={{ padding: "120px 75px 100px 150px" }}>
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
                        <figure>
                            <img src={workspaceImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                        </figure>
                    </div>
                </div>
                <div class="row" style={{ backgroundColor: "#F5F5F5", maxWidth: "1919px" }}>
                    <div class="col-8" style={{ padding: "100px 100px 100px 100px" }}>
                        <figure>
                            <img src={analyseFileImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                        </figure>
                    </div>
                    <div class="col-4" style={{ padding: "108px 150px 100px 75px" }}>
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
                <div class="row" style={{maxWidth: "1919px" }}>
                    <div class="col-4" style={{ padding: "150px 150px 100px 75px" }}>
                        <Jumbotron>
                            <h3>About us</h3>
                            <p></p>
                            <p>This App was developed by three soon to be (we hope) engineers.</p>
                            <p>It served as our final project to complete our bachelor's degree in Computed Engineering for ISEL.</p>
                            <p>We learned alot from making this App and we really hope you like it!</p>
                            <p>You can find the source code for this app in our public <a href="https://github.com/DuarteFelicio/DataAnnotation">github</a>.</p>
                        </Jumbotron>
                    </div>
                    <div class="col-3" style={{ padding: "100px 100px 100px 100px" }}>
                        <figure>
                            <img src={duarteImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                            <figcaption>Duarte Felicio - Team Leader</figcaption>
                        </figure>
                    </div>
                    <div class="col-3" style={{ padding: "100px 100px 100px 100px" }}>
                        <figure>
                            <img src={cafeImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                            <figcaption>Ruben Café - Lead frontend developer</figcaption>
                        </figure>
                    </div>
                    <div class="col-2" style={{ padding: "100px 100px 100px 100px" }}>
                        <figure>
                            <img src={ivoImage} style={{ height: "100%", width: "100%", objectFit: "contain", border: '5px solid #333333' }} />
                            <figcaption>Ivo Pereira - Lead backend developer</figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        )
    }
}