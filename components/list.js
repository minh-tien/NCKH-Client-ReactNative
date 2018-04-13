import React, { Component } from 'react';
import {
    Text,
    Image,
    ListView,
    View,
    ToolbarAndroid,
    StyleSheet,
    TouchableOpacity,
    TouchableNativeFeedback,
    BackAndroid,
    ActivityIndicator,
    NetInfo,
    Linking,
    AsyncStorage
} from 'react-native';
import io from 'socket.io-client/dist/socket.io';
import image from 'nativeImageSource';
import config from './config.json';

export default class List extends Component {
    constructor(props) {
        super(props);
        var that = this;
        this.socket = io(config.url);
        this.ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        BackAndroid.addEventListener('hardwareBackPress', () => {
            return true;
        })
        this.state = {
            dataSource: this.ds,
            status: true,
            id: '0',
            list: [],
            miss: 0,
            active: true,
            err: false,
            update: false,
            link: ''
        }
        NetInfo.isConnected.addEventListener('change', this.netChange);
        this.errorNetwork();
    }

    render() {
        return (
            <View style={styles.root}>
                <ToolbarAndroid
                    style={styles.bar}
                    title='Thông báo TDC'
                    titleColor='#FFF'
                    overflowIcon={image({
                        android: 'ic_more_vert_white_24dp',
                        width: 24,
                        height: 24
                    })}
                    actions={[
                        {
                            title: 'Báo lỗi và góp ý'
                        },
                        {
                            title: 'Giới thiệu về ứng dụng'
                        }
                    ]}
                    onActionSelected={this.onActionSelected}
                />
                {
                    this.state.active ? (
                        <ActivityIndicator
                            animating={this.state.active}
                            style={styles.loading}
                            color='#1565C0'
                            size={64}
                        />
                    ) : (this.state.err ? (
                        <View style={styles.error}>
                            <Image
                                source={image({
                                    android: 'ic_notifications_none_black_48dp',
                                    width: 48,
                                    height: 48
                                })}
                            />
                            <Text style={styles.subErr}>Không có thông báo để hiển thị :(</Text>
                        </View>
                    ) : (
                            <ListView
                                style={styles.cont}
                                dataSource={this.state.dataSource}
                                renderRow={this.renderRow}
                                enableEmptySections={true}
                                renderSeparator={this.renderSeparator}
                            />
                        )
                        )
                }
                <View style={[styles.netView, { height: this.state.status ? 0 : 48 }]}>
                    <Text style={styles.netText}>Không có kết nối internet</Text>
                </View>
                <View style={[styles.netView, { height: this.state.status && this.state.update ? 48 : 0 }]}>
                    <Text style={styles.netText}>Đã có bản cập nhật mới</Text>
                    <TouchableOpacity
                        style={styles.wrapBtn}
                        onPress={() => { this.linking() }}
                    >
                        <Text style={styles.netBtn}>CẬP NHẬT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderRow = (row, sectionID, rowID) => {
        return (
            <TouchableNativeFeedback onPress={() => { this.markRead(row, rowID) }}>
                <View style={[styles.row, { backgroundColor: row.Read ? '#FFF' : '#BBDEFB' }]}>
                    <Text
                        style={styles.title}
                        numberOfLines={2}
                    >{row.MessageSubject}</Text>
                    <Text style={styles.date}>{row.Date}</Text>
                </View>
            </TouchableNativeFeedback >
        )
    }

    renderSeparator = (sectionID, rowID) => {
        return (
            <View
                key={rowID}
                style={styles.separator}
            />
        )
    }

    onActionSelected = (position) => {
        if (position == 0) {
            this.props.goReport(this.socket);
        } else if (position == 1) {
            this.props.goAbout();
        }
    }

    async markRead(row, rowID) {
        try {
            if (!this.state.list[rowID].Read) {
                var list = [];
                list = this.state.list;
                var pos = Math.abs((row.Id - this.state.miss) - list.length + 1);
                list[pos].Read = true;
                this.setState({
                    list: list,
                    dataSource: this.ds.cloneWithRows(list)
                })
                await AsyncStorage.setItem(row.Id + '', JSON.stringify(list[pos]));
            }
            this.props.goDetail(row);
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    errorNetwork = () => {
        NetInfo.isConnected.fetch().then((isConnected) => {
            setTimeout(() => {
                if (this.state.active) {
                    this.setState({
                        active: false,
                        err: true
                    })
                }
            }, isConnected ? 10000 : 2000)
        }).catch((err) => {
            console.log('Error: ', err);
        })
    }

    async selectData() {
        try {
            var list = [];
            var row;
            var id = await AsyncStorage.getItem('id');
            if (id == null) {
                await AsyncStorage.setItem('id', '0');
                id = '0';
            }
            for (var i = parseInt(id) - 1; i >= 0; i--) {
                row = await AsyncStorage.getItem(i + '');
                if (row == null) {
                    this.setState({
                        miss: i + 1
                    })
                    break;
                }
                row = JSON.parse(row);
                list.push(row);
            }
            if (id != '0') {
                this.setState({
                    id: id,
                    list: list,
                    read: this.read,
                    dataSource: this.ds.cloneWithRows(list),
                    active: false,
                    err: false
                })
            }
            this.socket.emit('hello', id);
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    ioListen = (that) => {
        this.socket.on('data', (data) => {
            that.updateData(data);
        })
        this.socket.on('edit', (data) => {
            that.editData(data);
        })
        this.socket.on('update', (data) => {
            that.checkUpdate(data);
        })
        this.socket.emit('check', '');
    }

    async updateData(data) {
        try {
            if (data.length != 0) {
                if (this.state.id == '0') {
                    var low = data[0].Id + '';
                    this.setState({
                        id: low,
                        miss: low
                    })
                    await AsyncStorage.setItem('id', low);
                }
                var id = this.state.id;
                id = parseInt(id) + data.length + '';
                await AsyncStorage.setItem('id', id);
                var list = this.state.list;
                var row;
                for (var i = 0; i < data.length; i++) {
                    if (data.length <= 10) {
                        data[i].Read = false;
                    } else {
                        data[i].Read = true;
                    }
                    data[i].MessageSubject = data[i].MessageSubject.trim().replace(/\s+/g, ' ');
                    data[i].SenderName = data[i].SenderName.trim().replace(/\s+/g, ' ');
                    await AsyncStorage.setItem(data[i].Id + '', JSON.stringify(data[i]));
                }
                for (var i = data[0].Id; i < parseInt(id); i++) {
                    row = await AsyncStorage.getItem(i + '');
                    row = JSON.parse(row);
                    list.unshift(row);
                }
                this.setState({
                    id: id,
                    list: list,
                    dataSource: this.ds.cloneWithRows(list),
                    active: false,
                    err: false
                })
            }
            this.socket.emit('change', '');
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    async editData(data) {
        try {
            for (var i = 0; i < data.length; i++) {
                var check = await AsyncStorage.getItem(data[i].Id + '');
                if (check != null) {
                    var comp = JSON.parse(check);
                    delete comp.Read;
                    if (JSON.stringify(comp) != JSON.stringify(data[i])) {
                        data[i].Read = JSON.parse(check).Read;
                        var list = [];
                        list = this.state.list;
                        var pos = Math.abs(data[i].Id - this.state.miss - list.length + 1);
                        list[pos] = data[i];
                        this.setState({
                            list: list,
                            dataSource: this.ds.cloneWithRows(list)
                        })
                        await AsyncStorage.setItem(data[i].Id + '', JSON.stringify(data[i]));
                    }
                }
            }
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    netChange = (isConnected) => {
        this.setState({
            status: isConnected ? true : false
        })
        if (isConnected && !this.state.active && this.state.err) {
            this.setState({
                active: true
            })
        }
    }

    async checkUpdate(data) {
        try {
            var ver = await AsyncStorage.getItem('ver');
            var verNum = parseInt(ver.split('.').join(''));
            var dataNum = parseInt(data[0].split('.').join(''));
            if (verNum < dataNum) {
                this.setState({
                    update: true,
                    link: data[1]
                })
            }
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    linking = () => {
        url = this.state.link;
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
        this.ioListen(this);
        this.selectData();
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
    row: {
        justifyContent: 'center',
        height: 88,
        paddingLeft: 16,
        paddingRight: 16
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.12)'
    },
    title: {
        fontFamily: 'Roboto',
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.87)'
    },
    date: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.54)'
    },
    netView: {
        backgroundColor: '#323232',
        alignItems: 'center',
        flexDirection: 'row'
    },
    netText: {
        flex: 1,
        fontFamily: 'Roboto',
        fontSize: 14,
        paddingLeft: 24,
        paddingRight: 24,
        color: '#FFF'
    },
    wrapBtn: {
        height: 48,
        paddingLeft: 24,
        paddingRight: 24,
        justifyContent: 'center'
    },
    netBtn: {
        color: '#1565C0',
        fontFamily: 'Roboto',
        fontSize: 14,
        fontWeight: 'bold'
    },
    loading: {
        flex: 1
    },
    error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subErr: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.87)'
    }
})