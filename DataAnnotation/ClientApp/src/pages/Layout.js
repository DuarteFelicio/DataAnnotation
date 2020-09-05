import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import bootstrap from 'bootstrap'

export class Layout extends Component {
  static displayName = Layout.name;

  render () {
    return (
      <div>
            <NavMenu />
            <div className="childrenDiv" style={{ marginTop: 100 }}> {this.props.children} </div>
            <footer class="footer border-top text-muted" style={{ overflow: "hidden" }}>
                <div class="container">
                    &copy; 2020 - DataAnnotation - Developed by: Duarte Felício, Ruben Café and Ivo Pereira - <a asp-area="" asp-page="Privacy"> Privacy</a>
                </div>
            </footer>
      </div>
    );
  }
}


/*
<Container className="childrenContainer">
    {this.props.children}
</Container>*/