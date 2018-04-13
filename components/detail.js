import React, { Component } from 'react';
import {
    Text,
    Image,
    View,
    ScrollView,
    ListView,
    ToolbarAndroid,
    Alert,
    StyleSheet,
    TouchableOpacity,
    BackAndroid,
    Linking,
    NetInfo
} from 'react-native';
import image from 'nativeImageSource';
import config from './config.json';

export default class Detail extends Component {
    constructor(props) {
        super(props);
        BackAndroid.addEventListener('hardwareBackPress', () => {
            this.props.backList();
            return true;
        })
        var data = [];
        this.getMess('MessageNote', data);
        this.getMess('MessageBody', data);
        this.ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        this.state = {
            dataSource: this.ds,
            data: data
        }
    }

    render() {
        return (
            <View style={styles.root}>
                <ToolbarAndroid
                    style={styles.bar}
                    title='Thông báo TDC'
                    titleColor='#FFF'
                    navIcon={image({
                        android: 'ic_arrow_back_white_24dp',
                        width: 24,
                        height: 24
                    })}
                    onIconClicked={() => { this.props.backList() }}
                />
                <View style={styles.subBar}>
                    <Text style={styles.title}>{this.props.data.MessageSubject}</Text>
                    <Text style={styles.sub}>Ngày đăng: {this.props.data.Date}</Text>
                    <Text style={styles.sub}>Người gửi: {this.props.data.SenderName}</Text>
                </View>
                <ScrollView style={styles.cont}>
                    <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderRow}
                    />
                </ScrollView>
            </View>
        )
    }

    renderRow = (row) => {
        if (row.href == 'empty') {
            return (
                <View>
                    <Text style={styles.text}>{row.text}</Text>
                </View>
            )
        } else {
            return (
                <TouchableOpacity onPress={() => { this.connect(row.href) }}>
                    <View style={styles.down}>
                        <Image
                            style={styles.img}
                            source={image({
                                android: 'ic_file_download_black_24dp',
                                width: 24,
                                height: 24
                            })}
                        />
                        <Text style={styles.href}>{row.text}</Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    getMess = (from, data) => {
        this.props.data[from].forEach((value) => {
            data.push({
                text: value.text,
                href: 'empty'
            })
            if (value.href != 'empty') {
                var check = value.href.split(':')[0];
                if (check != 'http' && check != 'https') {
                    var arr = value.href.split('/');
                    data.push({
                        text: decodeURI(arr[arr.length - 1]),
                        href: value.href
                    })
                } else {
                    data.push({
                        text: value.href,
                        href: value.href
                    })
                }
            }
        })
    }

    connect = (url) => {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (isConnected) {
                this.linking(url);
            } else {
                Alert.alert('Thông báo', 'Ứng dụng cần có kết nối internet để tải về tệp tin đính kèm.', [{ text: 'OK' }]);
            }
        }).catch((err) => {
            console.log('Error: ', err);
        })
    }

    linking = (url) => {
        var check = url.split(':')[0];
        if (check != 'http' && check != 'https') {
            url = config.link + url;
        }
        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                return Linking.openURL(url).catch((err) => {
                    console.log('Error: ', err);
                })
            }
        }).catch((err) => {
            console.log('Error: ', err);
        })
    }

    componentDidMount() {
        this.setState({
            dataSource: this.ds.cloneWithRows(this.state.data)
        })
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    bar: {
        height: 56,
        backgroundColor: '#1565C0',
        elevation: 4
    },
    cont: {
        flex: 1
    },
    subBar: {
        backgroundColor: '#1976D2',
        padding: 16,
        elevation: 4
    },
    title: {
        fontFamily: 'Roboto',
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)'
    },
    sub: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)'
    },
    text: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.87)',
        lineHeight: 24,
        paddingLeft: 16,
        paddingRight: 16
    },
    down: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        marginRight: 16
    },
    href: {
        paddingLeft: 8,
        marginRight: 16,
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#1565C0'
    },
    img: {
        tintColor: '#1565C0'
    }
})