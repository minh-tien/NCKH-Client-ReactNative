import React, { Component } from 'react';
import {
    Text,
    Button,
    TextInput,
    Alert,
    View,
    StyleSheet,
    ToolbarAndroid,
    BackAndroid,
    NetInfo,
    Platform
} from 'react-native';
import image from 'nativeImageSource';

export default class Report extends Component {
    constructor(props) {
        super(props);
        BackAndroid.addEventListener('hardwareBackPress', () => {
            this.props.backList();
            return true;
        })
        this.props.data.on('result', (result) => { })
        this.state = {
            text: ''
        }
    }

    render() {
        return (
            <View style={styles.root}>
                <ToolbarAndroid
                    style={styles.bar}
                    title='Báo lỗi và góp ý'
                    titleColor='#FFF'
                    navIcon={image({
                        android: 'ic_arrow_back_white_24dp',
                        width: 24,
                        height: 24
                    })}
                    onIconClicked={() => { this.props.backList() }}
                />
                <View style={styles.cont}>
                    <Text style={styles.text}>Nhập phản hồi của bạn vào đây:</Text>
                    <TextInput
                        maxLength={1000}
                        multiline={true}
                        numberOfLines={5}
                        onChangeText={(text) => {
                            this.setState({
                                text: text
                            })
                        }}
                    />
                    <Button
                        title='GỬI'
                        onPress={() => { this.send() }}
                    />
                    <Text style={[styles.text, styles.notice]}>Lưu ý:</Text>
                    <Text style={styles.text}>Tính năng thông báo trên điện thoại có thể hoạt động không ổn định trên một số thiết bị. Vui lòng gửi báo lỗi nếu thiết bị của bạn không nhận được thông báo.</Text>
                    <Text style={styles.text}>Khi ứng dụng gặp lỗi, bạn có thể thử khắc phục bằng cách xóa dữ liệu ứng dụng (Cài đặt -> Ứng dụng -> Thông báo TDC -> Xóa dữ liệu).</Text>
                </View>
            </View>
        )
    }

    send = () => {
        NetInfo.isConnected.fetch().then((isConnected) => {
            if (this.state.text == '') {
                Alert.alert('Thông báo', 'Vui lòng nhập nội dung phản hồi.', [{ text: 'OK' }]);
            } else if (!isConnected) {
                Alert.alert('Thông báo', 'Không có kết nối internet. Vui lòng thử lại.', [{ text: 'OK' }]);
            } else {
                this.props.data.emit('feedback', {
                    Ver: Platform.Version,
                    Text: this.state.text
                })
                Alert.alert('Thông báo', 'Cảm ơn bạn đã phản hồi. Những đóng góp của bạn sẽ giúp ứng dụng ngày càng hoàn thiện hơn.', [{ text: 'OK' }]);
            }
        }).catch((err) => {
            console.log('Error: ', err);
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
        flex: 1,
        paddingLeft: 16,
        paddingRight: 16
    },
    text: {
        marginTop: 16,
        fontFamily: 'Roboto',
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.87)',
    },
    notice: {
        fontWeight: 'bold',
        color: 'rgba(198, 40, 40, 0.87)',
        fontSize: 18
    }
})