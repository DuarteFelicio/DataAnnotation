import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import { Col, Grid, Row } from 'react-bootstrap';
import { NavMenu } from './NavMenu';

export class Layout extends Component {
  displayName = Layout.name

    render() {
        if (localStorage.getItem("token") == null) {
            return <Redirect to="/LogIn" />
        }
    return (
      <Grid fluid>
        <Row>
          <Col sm={3}>
            <NavMenu />
          </Col>
          <Col sm={9}>
            {this.props.children}
          </Col>
        </Row>
      </Grid>
    );
  }
}
