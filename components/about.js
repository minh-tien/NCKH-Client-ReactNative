import React, { Component } from 'react';
import {
    Text,
    Image,
    View,
    ToolbarAndroid,
    StyleSheet,
    TouchableOpacity,
    Linking,
    BackAndroid
} from 'react-native';
import image from 'nativeImageSource';
import config from './config.json';

export default class About extends Component {
    constructor(props) {
        super(props);
        BackAndroid.addEventListener('hardwareBackPress', () => {
            this.props.backList();
            return true;
        })
    }

    render() {
        return (
            <View style={styles.root}>
                <ToolbarAndroid
                    style={styles.bar}
                    title='Giới thiệu về ứng dụng'
                    titleColor='#FFF'
                    navIcon={image({
                        android: 'ic_arrow_back_white_24dp',
                        width: 24,
                        height: 24
                    })}
                    onIconClicked={() => { this.props.backList() }}
                />
                <View style={styles.cont}>
                    <Image
                        style={styles.img}
                        source={require('./images/tdc.png')}
                        resizeMode='contain'
                    />
                    <Text style={styles.desc}>Ứng dụng được phát triển nhằm giúp các bạn sinh viên trường Cao đẳng Công Nghệ Thủ Đức dễ dàng hơn trong việc cập nhật các thông báo của trường.</Text>
                    <TouchableOpacity onPress={() => { this.linking() }}>
                        <Text style={[styles.desc, styles.url]}>Http://online.tdc.edu.vn</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    linking = () => {
        url = config.link;
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
        justifyContent: 'center',
        alignItems: 'center'
    },
    img: {
        width: 180,
        height: 180
    },
    desc: {
        marginTop: 16,
        fontFamily: 'Roboto',
        fontSize: 16,
        color: 'rgba(0, 0, 0, 0.87)',
        textAlign: 'center',
        lineHeight: 24,
        paddingLeft: 16,
        paddingRight: 16
    },
    url: {
        color: '#1565C0'
    }
})