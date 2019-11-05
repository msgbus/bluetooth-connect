import React from 'react'
import connect from 'redux-connect-decorator'
import PropTypes from 'prop-types'
import config from '@Config'
import Icon from '../Icon'
import t from '@Localize'
import ParsedText from 'react-native-parsed-text'
import { getRemoteAvatar } from '@Utils'
import { formatDistance } from 'date-fns'
import WeportT1 from '../../Bluetooth/WeportT1'

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native'

import {
  Avatar
} from 'react-native-elements'

import WEPORT_T1_IMG from '@assets/Weport-T1.png'
import BleModule from "../../Bluetooth/BleModule";

export default class TwsT1 extends React.Component {
  constructor(props) {
    super(props);

    this.state={
      scaning:false,
      isConnected:false,
      text:'',
      writeData:'',
      receiveData:'',
      readData:'',
      data:[],
      isMonitoring:false,
      battery:"",
      version:"",
      isDialogVisible: false,
      deviceName:"",
      deviceId:""
    }
    this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    this.deviceMap = new Map();

    global.BluetoothManager = new BleModule();

    const { device } = this.props
    this.connect(device)
  }

  componentWillUnmount() {
    BluetoothManager.destroy();
    this.onStateChangeListener && this.onStateChangeListener.remove();
    this.disconnectListener && this.disconnectListener.remove();
    this.monitorListener && this.monitorListener.remove();
  }

  disconstructor() {
    this.ble.disconnect()
    this.ble.destroy()
  }

  connect(device){
    if(this.state.scaning){  //连接的时候正在扫描，先停止扫描
      BluetoothManager.stopScan();
      this.setState({scaning:false});
    }
    if(BluetoothManager.isConnecting){
      console.log('当前蓝牙正在连接时不能打开另一个连接进程');
      return;
    }
    BluetoothManager.connect(device.deviceId)
      .then(device=>{
        // this.setState({deviceName:item.item.name,deviceId:item.item.id});
        this.onDisconnect();
        this.monitor("66666666-6666-6666-6666-666666666666","77777777-7777-7777-7777-777777777777");
      })
      .catch(err=>{
        console.log(err);
      })
  }

  read=(index)=>{
    BluetoothManager.read(index)
      .then(value=>{
        this.setState({readData:value});
      })
      .catch(err=>{

      })
  }

  write=(bytes)=>{
    // if(this.state.text.length == 0){
    //     this.alert('请输入消息');
    //     return;
    // }
    BluetoothManager.write(bytes)
      .then(characteristic=>{
        this.bluetoothReceiveData = [];
        this.setState({
          writeData:this.state.text,
          text:'',
        })
      })
      .catch(err=>{

      })
  }

  writeWithoutResponse=(index,type)=>{
    if(this.state.text.length == 0){
      this.alert('请输入消息');
      return;
    }
    BluetoothManager.writeWithoutResponse(this.state.text,index,type)
      .then(characteristic=>{
        this.bluetoothReceiveData = [];
        this.setState({
          writeData:this.state.text,
          text:'',
        })
      })
      .catch(err=>{

      })
  }

  //监听蓝牙数据
  monitor=(ServiceUUid,CharUUID)=>{
    let transactionId = 'monitor';
    console.log("monitor:",ServiceUUid,CharUUID);
    this.monitorListener = BluetoothManager.manager.monitorCharacteristicForDevice(BluetoothManager.peripheralId,
      ServiceUUid,CharUUID,
      (error, characteristic) => {
        if (error) {
          this.setState({isMonitoring:false});
          console.log('monitor fail:',error);
        }else{
          this.setState({isMonitoring:true});
          this.bluetoothReceiveData.push(characteristic.value); //数据量多的话会分多次接收
          this.setState({receiveData:this.bluetoothReceiveData.join('')});
          console.log('monitor success',characteristic.value);
          var bytebuf = this.base64ToArrayBuffer(characteristic.value);
          if(bytebuf.length>=6)
          {
            if(bytebuf[0] == 106 && bytebuf[1] == 2){
              this.getBattery(bytebuf)
            }
            if(bytebuf[0] == 201 && bytebuf[1] == 2){
              this.getVersion(bytebuf)
            }
            if(bytebuf[0] == 200 && bytebuf[1] == 2){
              this.setBroadcastNameResp(bytebuf)
            }
          }

        }
      }, transactionId);
  }

  getBattery(bytesbuf){
    if(bytesbuf.length == 10 && bytesbuf[0] == 106 && bytesbuf[1] == 2){
      if (bytesbuf[4] == 4){
        this.setState({battery:String.fromCharCode(bytesbuf[6])+":"+bytesbuf[7]*10+"%   "+String.fromCharCode(bytesbuf[8])+":"+bytesbuf[9]*10+"%"})
      }
    }
  }

  getVersion(bytesbuf){
    if(bytesbuf.length == 14 && bytesbuf[0] == 201 && bytesbuf[1] == 2){
      if (bytesbuf[4] == 8){
        this.setState({version:"主: ["+bytesbuf[9]+"."+bytesbuf[8]+"."+bytesbuf[7]+"."+bytesbuf[6]+"]"+"   "
          +"副: ["+bytesbuf[13]+"."+bytesbuf[12]+"."+bytesbuf[11]+"."+bytesbuf[10]+"]"})
      }
    }
  }

  setBroadcastNameResp(bytesbuf){
    if (bytesbuf.length == 6 && bytesbuf[0] == 200 && bytesbuf[1] == 2 ){
      if (bytesbuf[3] == 0) {
        this.alert("修改成功");
      } else {
        this.alert("修改失败");
      }
    }
  }

  base64ToArrayBuffer(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    console.log("monitor data:",bytes);
    return bytes;
  }

  //监听蓝牙断开
  onDisconnect(){
    this.disconnectListener = BluetoothManager.manager.onDeviceDisconnected(BluetoothManager.peripheralId,(error,device)=>{
      if(error){  //蓝牙遇到错误自动断开
        console.log('onDeviceDisconnected','device disconnect',error);
        this.setState({data:[...this.deviceMap.values()],isConnected:false});
      }else{
        this.disconnectListener && this.disconnectListener.remove();
        console.log('onDeviceDisconnected','device disconnect',device.id,device.name);
      }
    })
  }

  //断开蓝牙连接
  disconnect(){
    BluetoothManager.disconnect()
      .then(res=>{
        this.setState({data:[...this.deviceMap.values()],isConnected:false});
      })
      .catch(err=>{
        this.setState({data:[...this.deviceMap.values()],isConnected:false});
      })
  }

  changeBroatcastName(name) {
    console.log("change name:",name)
    var bytes = new Array()
    bytes.push(200);
    bytes.push(1);
    bytes.push(0);

    // var base64Name = btoa(name);
    // console.log("base64 name",base64Name,base64Name.length);
    var nameBytes = this.convertStringToByteArray(name)
    console.log("bytes:", this.convertStringToByteArray(name),this.convertStringToByteArray(name).length);
    bytes.push(nameBytes.length+1);
    bytes.push(0);
    for (var i = 0; i < nameBytes.length; i++) {
      bytes.push(nameBytes[i]);
    }
    // bytes.push(nameBytes);
    bytes.push(0);
    console.log(bytes);
    BluetoothManager.write(bytes)
  }
  convertStringToByteArray(str){
    String.prototype.encodeHex = function () {
      var bytes = [];
      for (var i = 0; i < this.length; ++i) {
        bytes.push(this.charCodeAt(i));
      }
      return bytes;
    };

    var byteArray = str.encodeHex();
    return byteArray
  }

  checkBattery(){
    // this.monitor("66666666-6666-6666-6666-666666666666","77777777-7777-7777-7777-777777777777");
    var bytes = new Array()
    bytes.push(106);
    bytes.push(1);
    bytes.push(0);
    bytes.push(0);
    bytes.push(0);
    BluetoothManager.write(bytes)
  }
  checkVersion(){
    // this.monitor("66666666-6666-6666-6666-666666666666","77777777-7777-7777-7777-777777777777");
    var bytes = new Array()
    bytes.push(201);
    bytes.push(1);
    bytes.push(0);
    bytes.push(0);
    bytes.push(0);
    BluetoothManager.write(bytes)
  }

  render() {
    const { device } = this.props
    return (
      <View style={styles.container}>
        <Image source={WEPORT_T1_IMG} resizeMode={'cover'}/>
        {this._renderBattery()}
        {this._renderBluetoothName()}
      </View>
    )
  }

  _renderBattery() {
    return (
      <View style={styles.tools}>
        <TouchableOpacity style={[styles.toolItemContainer, styles.toolItemBorder]}>
          <View style={styles.toolItem}>
            <Text style={styles.toolItemText}>{ this.state.batteryL }</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolItemContainer}>
          <View style={styles.toolItem}>
            <Text style={styles.toolItemText}>{ this.state.batteryR }</Text>
          </View>
        </TouchableOpacity>
      </View>
      )
  }

  _renderBluetoothName() {
    return (
      <View style={styles.tools}>
        <TouchableOpacity style={[styles.toolItemContainer, styles.toolItemBorder]}>
          <View style={styles.toolItem}>
            <Text>{ this.state.deviceName }</Text>
          </View>
        </TouchableOpacity>
      </View>
      )
  }

  openCommentModal() {
    this.props.setModalVisibleStatus({
      name: 'comment',
      status: true
    })
  }

  toggleLikeStatus() {
    const { post } = this.props
    const newLikeStatus = !post.liked
    this.props.updatePost({
      mid: post.id,
      key: 'liked',
      value: newLikeStatus
    })
    this.props.updatePost({
      mid: post.id,
      key: 'like_count',
      value: newLikeStatus ? post.like_count + 1 : post.like_count - 1
    })
  }

  _handleUrlPress(url) {
    if (url.indexOf('http') < 0) {
      url = `http://${url}`
    }
    this.props.setModalParams({
      url
    })
    this.props.setModalVisibleStatus({
      name: 'webview',
      status: true
    })
  }

  _handlePhonePress() {
    //
  }
}

TwsT1.defaultProps = {
  disableToolbar: false
}

TwsT1.propTypes = {
  post: PropTypes.object.isRequired,
  disableToolbar: PropTypes.bool,
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 5,
    borderColor: '#dadada',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
    flexDirection: 'column'
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    paddingBottom: 5
  },
  headerAvatar: {
    width: 40,
    height: 40
  },
  headerUser: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 6
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: config.mainColor
  },
  userTime: {
    fontSize: 12,
    color: '#8999a5'
  },
  details: {
    flexDirection: 'column'
  },
  postText: {
    fontSize: 15,
    color: '#333',
    padding: 10,
    paddingBottom: 5,
    paddingTop: 0
  },
  postImage: {
    height: 250,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: '#dadada'
  },
  tools: {
    flexDirection: 'row',
    borderTopColor: '#dadada',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 5
  },
  toolItemContainer: {
    flex: 1
  },
  toolItem: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  toolItemBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#dadada'
  },
  toolItemText: {
    color: '#6d6d78',
    fontSize: 12,
    marginLeft: 3
  },
  linkText: {
    color: '#0366d6'
  }
})
