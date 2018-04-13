import React, { Component } from 'react';
import {
    Navigator,
    AsyncStorage
} from 'react-native';
import FCM, { FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType } from 'react-native-fcm';
import List from './list';
import Detail from './detail';
import Report from './report';
import About from './about';
import config from './config.json';

export default class App extends Component {
    constructor(props) {
        super(props);
        fetch(config.url).catch((err) => {
            console.log('Error: ', err);
        })
        this.checkUpdate();
    }

    renderScene(route, navigator) {
        switch (route.name) {
            case 'list':
                return (
                    <List
                        goDetail={(row) => {
                            navigator.push({
                                name: 'detail',
                                data: row
                            })
                        }}
                        goReport={(socket) => {
                            navigator.push({
                                name: 'report',
                                data: socket
                            })
                        }}
                        goAbout={() => {
                            navigator.push({
                                name: 'about'
                            })
                        }}
                    />
                )
            case 'detail':
                return (
                    <Detail
                        backList={() => {
                            navigator.pop();
                        }}
                        data={route.data}
                    />
                )
            case 'report':
                return (
                    <Report
                        backList={() => {
                            navigator.pop();
                        }}
                        data={route.data}
                    />
                )
            case 'about':
                return (
                    <About
                        backList={() => {
                            navigator.pop();
                        }}
                    />
                )
        }
    }

    render() {
        return (
            <Navigator
                initialRoute={{ name: 'list' }}
                renderScene={this.renderScene}
            />
        )
    }

    componentDidMount() {
        FCM.getFCMToken().then((token) => { }).catch((err) => {
            console.log('Error: ', err);
        })
        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            if (notif.local_notification) { };
            if (notif.opened_from_tray) { };
        })
        this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => { });
        FCM.subscribeToTopic(config.topic);
    }

    componentWillUnmount() {
        this.notificationListener.remove();
        this.refreshTokenListener.remove();
    }

    async checkUpdate() {
        var version = config.version;
        var versionNum = parseInt(version.split('.').join(''));
        try {
            var ver = await AsyncStorage.getItem('ver');
            if (ver == null) {
                await AsyncStorage.setItem('ver', version);
            } else {
                var num = parseInt(ver.split('.').join(''));
                if (num < versionNum) {
                    await AsyncStorage.setItem('ver', version);
                }
            }
        } catch (err) {
            console.log('Error: ', err);
        }
    }
}