import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import { UploadFile } from './pages/UploadFile';
import { Workspace } from './pages/Workspace';
import { Analysis } from './pages/Analysis';
import About from './pages/About';
import AuthorizeRoute from './pages/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './pages/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './pages/api-authorization/ApiAuthorizationConstants';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <AuthorizeRoute exact path='/uploadFile' component={UploadFile} />
        <AuthorizeRoute exact path='/workspace' component={Workspace} />
        <AuthorizeRoute exact path='/workspace/analysis/:id' component={Analysis}/>
        <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
        <Route exact path='/about' component={About} />
      </Layout>
    );
  }
}
