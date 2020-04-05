import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { LogIn } from './components/LogIn';
import { LogOut } from './components/LogOut';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import { UploadFile } from './components/UploadFile';

export default class App extends Component {
  displayName = App.name

    render() {
        return (
            <div>
                <Route exact path='/logIn' component={LogIn} />
            <Layout>
                    <Route exact path='/home' component={Home} />
                    <Route exact path='/counter' component={Counter} />
                    <Route exact path='/fetchdata' component={FetchData} />
                    <Route exact path='/uploadfile' component={UploadFile} />
                    <Route exact path='/logOut' component={LogOut} />

                </Layout>
            </div>            
    );
  }
}
