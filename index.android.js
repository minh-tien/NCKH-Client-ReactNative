import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import App from './components/app';

class Client extends Component {
    render() {
        return (
            <App />
        )
    }
}

AppRegistry.registerComponent('client', () => Client);