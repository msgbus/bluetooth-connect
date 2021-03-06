import React from 'react'
import connect from 'redux-connect-decorator'
import config from '@Config'
import styles from '@Styles'
import t from '@Localize'
import {decode as atob, encode as btoa} from 'base-64'
import HeaderButton from '@Components/HeaderButton'
import Post from '@Components/Post'
import { fetchUserInfo, fetchTimeline, refreshTimeline, loadMoreTimeline, setModalVisibleStatus, refreshDevice, updateRefreshHome } from '@Store/Actions'
import DialogInput from 'react-native-dialog-input';

import {
  View,
  Text,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
    Alert
} from 'react-native'

import storage from '@Utils/storage'
import BleModule from "../../Bluetooth/BleModule";

import Image from 'react-native-scalable-image'

import WEPORT_T1_IMG from '@assets/Weport-T1.jpg'
import WEPORT_T1_OPEN_IMG from '@assets/weport-t1-open-case.jpeg'
import WEPORT_T1_PAIRING_IMG from '@assets/weport-t1-pairing.jpeg'
import BLUETOOTH_PAIRING from '@assets/bluetooth-pair.png'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import {RRCLoading} from "react-native-overlayer/src/index";
import Icon from "../../Components/Icon";

@connect(state => ({
  timeline: state.home.timeline
}), {
  setModalVisibleStatus,
  fetchUserInfo,
  fetchTimeline,
  refreshTimeline,
  loadMoreTimeline,
})

@connect(state => ({
  updateDevice: state.home.updateDevice
}), {
  refreshDevice
})

@connect(state => ({
  refreshing: state.home.refreshHome
}), {
  updateRefreshHome
})

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    const onPressRightButtonFunc = params.openPublisher || function() {}
    return {
      ...config.defaultNavigation,
      title: t('global.home')
    }
  }

  constructor(props) {
    super(props);
    // this.isDialogVisible=false
      this.newDeviceName = "";
    this.state = {
      refreshing: this.props.refreshing,
      loading: false,
      loadedEnd: false,
      loadResultOpacity: new Animated.Value(0),
      device: "",
      isDialogVisible:false,
      scaning:false,
      isConnected:false,
      text:'',
      writeData:'',
      receiveData:'',
      readData:'',
      data:[],
      isMonitoring:false,
      battery:"",
      batteryL: "",
      batteryR: "",
      version:"",
      versionR: "",
      versionL: "",
      deviceName:"",
      deviceId:""
    }
    this.fadeInAnimated = Animated.timing(
      this.state.loadResultOpacity,
      {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
      }
    )
    this.fadeOutAnimated = Animated.timing(
      this.state.loadResultOpacity,
      {
        toValue: 0,
        duration: 800,
        easing: Easing.linear,
      }
    )

    this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    this.deviceMap = new Map();
  }

  componentDidMount () {
    this.setState({refreshing: true})
    this._getDevice()
  }

  componentWillUnmount() {
    this.onStateChangeListener && this.onStateChangeListener.remove();
    this.disconnectListener && this.disconnectListener.remove();
    this.monitorListener && this.monitorListener.remove();
  }

  componentDidUpdate(preProps) {
    if (this.props.refreshing) {
      this.props.updateRefreshHome(false)
      this.onRefresh();
    }
  }

  disconstructor() {
  }

  scan(){
    if(!this.scaning) {
      this.scaning = true
      this.deviceMap.clear();
      BluetoothManager.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.log('startDeviceScan error:',error)
          if(error.errorCode == 102){
              Alert.alert(t("global.tips"),t("bluetooth.openBt"),[{ text:t("global.ok"),onPress:()=>{ } }]);
          }
          this.scaning = false
        }else{
          console.log(device.id,device.name);
          this.deviceMap.set(device.id,device); //使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
          if (device.id == this.state.device.deviceId) {
            this.connect(this.state.device)
          }
        }
      })
        this.refreshTimer && clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(()=>{
            console.log("timeout")
            if(this.scaning){
                this.scaning = false
                BluetoothManager.stopScan();
            }
            this.setState({refreshing: false})
        }, 10000)
      /*
      this.scanTimer && clearTimeout(this.scanTimer);
      this.scanTimer = setTimeout(()=>{
        if(this.scaning){
          this.scaning = false
          BluetoothManager.stopScan();

          // this.connect(device)
        }
      }, 5000)
      */
    }
  }

  connect(device){
    console.log('tws connect', device)

    if(this.scaning){  //连接的时候正在扫描，先停止扫描
      this.scaning = false
      BluetoothManager.stopScan();
    }
    if(BluetoothManager.isConnecting){
      console.log('当前蓝牙正在连接时不能打开另一个连接进程');
      this.checkBattery()
      return;
    }
    BluetoothManager.connect(device.deviceId)
      .then(dev=>{
        this.setState({deviceName: device.name, deviceId: device.deviceId});
        this.setState({isConnected:true});
        this.onDisconnect();
        this.monitor("66666666-6666-6666-6666-666666666666","77777777-7777-7777-7777-777777777777");
        this.checkBattery()
      }, err => {
        this.setState({isConnected: false, refreshing: false})
      })
      .catch(err=>{
        console.log('tws connect failed', err);
      })
  }

  read=(index)=>{
    BluetoothManager.read(index)
      .then(value=>{
      })
      .catch(err=>{

      })
  }

  write=(bytes)=>{
    // if(this.state.text.length == 0){
    //     return;
    // }
    BluetoothManager.write(bytes)
      .then(characteristic=>{
        this.bluetoothReceiveData = [];
      })
      .catch(err=>{

      })
  }

  writeWithoutResponse=(index,type)=>{
    if(this.state.text.length == 0){
      return;
    }
    BluetoothManager.writeWithoutResponse(this.state.text,index,type)
      .then(characteristic=>{
        this.bluetoothReceiveData = [];
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
          console.log('monitor fail:',error);
          this.setState({ refreshing: false, isConnected: false })
        }else{
          this.bluetoothReceiveData.push(characteristic.value); //数据量多的话会分多次接收
          console.log('monitor success',characteristic.value);
          var bytebuf = this.base64ToArrayBuffer(characteristic.value);
          if(bytebuf.length>=6)
          {
            if(bytebuf[0] == 106 && bytebuf[1] == 2){
              this.getBattery(bytebuf)
              this.checkVersion()
            }
            if(bytebuf[0] == 201 && bytebuf[1] == 2){
              this.getVersion(bytebuf)
              this.setState({ refreshing: false });
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
        const s = String.fromCharCode(bytesbuf[6])+":"+bytesbuf[7]*10+"%   "+String.fromCharCode(bytesbuf[8])+":"+bytesbuf[9]*10+"%";
        const sR = String.fromCharCode(bytesbuf[6])+":"+bytesbuf[7]*10+"%";
        const sL = String.fromCharCode(bytesbuf[8])+":"+bytesbuf[9]*10+"%";
        console.log("battery", s)
        this.setState({
          battery: s,
          batteryL: sL,
          batteryR: sR
        })
      }
    }
  }

  getVersion(bytesbuf){
    if(bytesbuf.length == 14 && bytesbuf[0] == 201 && bytesbuf[1] == 2){
      if (bytesbuf[4] == 8){
        const s = "M: ["+bytesbuf[9]+"."+bytesbuf[8]+"."+bytesbuf[7]+"."+bytesbuf[6]+"]"+"   "
          +"S: ["+bytesbuf[13]+"."+bytesbuf[12]+"."+bytesbuf[11]+"."+bytesbuf[10]+"]"
        const sR = bytesbuf[9]+"."+bytesbuf[8]+"."+bytesbuf[7]+"."+bytesbuf[6];
        const sL = bytesbuf[13]+"."+bytesbuf[12]+"."+bytesbuf[11]+"."+bytesbuf[10];
        console.log("version", s)
        this.setState({
          version:s,
          versionR: sR,
          versionL: sL
        })
      }
    }
  }

  setBroadcastNameResp(bytesbuf){
    RRCLoading.hide();
    if (bytesbuf.length == 6 && bytesbuf[0] == 200 && bytesbuf[1] == 2 ){
      if (bytesbuf[3] == 0) {
        this.setState({deviceName:this.newDeviceName})
          this.boundDevice();
          Alert.alert(t("global.tips"),t('bluetooth.modifyDeviceNameSuccess'),[{ text:t("global.ok"),
              onPress:()=>{
                  BluetoothManager.disconnect();
                }
          }]);
      } else {
          Alert.alert(t("global.tips"),t('bluetooth.modifyFail'),[{ text:t("global.ok"),onPress:()=>{ } }]);
      }
    }
  }
    boundDevice = async () => {
        await storage.get('boundDevices').then(value=>{
            console.log("get bound value:",value);
            console.log("bound device:",this.state.deviceName,this.state.deviceId);


            var deviceArr = [];
            var currentIndex = 0;
            if (value != null){
                deviceArr = value.deviceArray;
                var currentIndex = value.currentIndex;
            }

            var deviceInfo = {
                name: this.state.deviceName,
                type: 'Weport T1',
                deviceId: this.state.deviceId
            };

            for (var i = 0; i<deviceArr.length; i++) {
                if ((this.state.deviceId == deviceArr[i].deviceId) && (this.state.deviceName == deviceArr[i].name)) {
                    return
                } else {
                    if (this.state.deviceId == deviceArr[i].deviceId){
                        deviceArr[i].name = this.state.deviceName;
                        const deviceData = {
                            deviceArray: deviceArr,
                            currentIndex:currentIndex
                        };

                        console.log(deviceData);
                        storage.save("boundDevices",deviceData);
                        return
                    }
                }
            }
            deviceArr.push(deviceInfo);
            console.log("deviceInfo lenth",deviceArr.length);
            const deviceData = {
                deviceArray: deviceArr,
                currentIndex:currentIndex
            };

            console.log(deviceData);
            storage.save("boundDevices",deviceData);
        });

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
        this.scan()
      }, err=> {
        BluetoothManager.destroy();
        global.BluetoothManager = new BleModule();
        this.scan()
      })
      .catch(err=>{
        this.setState({data:[...this.deviceMap.values()],isConnected:false});
      })
  }

  changeBroatcastName(name) {
    console.log("change name:",name)
    const options = {  text: t('bluetooth.modifying') };
    RRCLoading.setLoadingOptions(options);
    RRCLoading.show();
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
      this.newDeviceName = name;
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

  _renderBattery() {
    return (
      <View style={viewStyles.tools}>
        <TouchableOpacity style={[viewStyles.toolItemContainer, viewStyles.toolItemBorder]}>
          <View style={viewStyles.toolItem}>
            <Text style={viewStyles.toolItemText}>{ this.state.batteryL }</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={viewStyles.toolItemContainer}>
          <View style={viewStyles.toolItem}>
            <Text style={viewStyles.toolItemText}>{ this.state.batteryR }</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderVersion() {
    return (
      <View style={viewStyles.tools}>
        <TouchableOpacity style={[viewStyles.toolItemContainer, viewStyles.toolItemBorder]}>
          <View style={viewStyles.toolItem}>
            <Text style={viewStyles.toolItemText}>{ this.state.versionL }</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={viewStyles.toolItemContainer}>
          <View style={viewStyles.toolItem}>
            <Text style={viewStyles.toolItemText}>{ this.state.versionR }</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderBluetoothName() {

      console.log("isDialogVisible",this.state.isDialogVisible);

    return (
      <View style={viewStyles.tools}>
        <TouchableOpacity
            activeOpacity={0.7}
            style={[viewStyles.toolItemContainer, viewStyles.toolItemBorder]}
            onPress={
                this.setDialogVisible.bind(this)
            }
        >
          <View style={viewStyles.toolItem}>
            <Text style={{marginRight:10}}>{ this.state.deviceName }</Text>
            { this.state.deviceName == "" ? <View/> : <FontAwesome name={'edit'}/> }

            <DialogInput
                  isDialogVisible={this.state.isDialogVisible}
                  title={t("bluetooth.modifyBtName")}
                  message={t("bluetooth.inputBtName")}
                  // hintInput ={this.state.data[1]}
                  cancelText={t("global.cancel")}
                  submitText={t("global.ok")}
                  submitInput={ (inputText) => {
                      this.changeBroatcastName(inputText);
                      this.setState({isDialogVisible : false})
                  }
                  }
                  closeDialog={ () => {
                      this.setState({isDialogVisible : false})
                    }
                  }
              >
              </DialogInput>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  setDialogVisible(){
      this.setState({isDialogVisible : true})
  }
  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.onRefresh}
          />
        }
        style={viewStyles.container}>
        { this._renderDevice() }
      </ScrollView>
    )
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    // In actual case set refreshing to false when whatever is being refreshed is done!

    console.log("home onRefresh")
    console.log("props", this.props.refreshing);

    this._getDevice()
  };

  _renderDevice () {
    console.log("render device", this.state.device)
    if (this.state.device != "") {
      if (this.state.device.type == "Weport T1") {
        return (
          this._renderWeportT1()
        )
      }
    } else {
      return (
        this._renderGuide()
      )
    }
  }

  _renderGuide() {
    return (
      <View style={viewStyles.container}>
        <Text style={viewStyles.toolItemText}>{ t('home.openCase') }</Text>
        <Image source={WEPORT_T1_OPEN_IMG} width={Dimensions.get('window').width}/>
        <Text style={[viewStyles.toolItemText, {marginTop: 15}]}>{ t('home.pressKey3s') }</Text>
        <Image source={WEPORT_T1_PAIRING_IMG} width={Dimensions.get('window').width}/>
        <Text style={[viewStyles.toolItemText, {marginTop: 15}]}>{ t('home.paringWithPhone') }</Text>
        <Image source={BLUETOOTH_PAIRING} width={Dimensions.get('window').width}/>
        <Text style={[viewStyles.toolItemText, {marginTop: 15}]}>{ t('home.addDevice') }</Text>
      </View>
    )
  }

  _renderConnectStatus() {
    console.log("_renderConnectStatus")
    return (
      <View style={viewStyles.tools}>
        <TouchableOpacity style={[viewStyles.toolItemContainer, viewStyles.toolItemBorder]}>
          <View style={viewStyles.toolItem}>
            { this.state.isConnected ?
              <View style={{flexDirection: 'row'}}>
                <FontAwesome name='bluetooth' size={18} color={'#00f'}/>
                <Text> {t('home.connected')}</Text>
              </View>
              :
              <View style={{flexDirection: 'column', alignItems:'center'}}>
                { this.state.refreshing ?
                  <View style={{flexDirection: 'row', alignItems:'center'}}>
                    <FontAwesome name='bluetooth' size={18} color={'#000'}/>
                    <Text> {t('home.disconnected')} </Text>
                  </View>
                  :
                  <View style={{flexDirection: 'row', alignItems:'center'}}>
                    <FontAwesome name={'arrow-down'} size={32} color={config.mainColor}/>
                    <Text> {t('home.pulltorefresh')} </Text>
                  </View>
                }
              </View>
            }
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderWeportT1() {
    return (
      <View style={viewStyles.container}>
        { this._renderConnectStatus() }
        <Image source={WEPORT_T1_IMG} width={Dimensions.get('window').width}/>
        {this._renderBattery()}
        {this._renderVersion()}
        {this._renderBluetoothName()}
      </View>
    )
  }

  openPublisher() {
    this.props.setModalVisibleStatus({
      name: 'publisher',
      status: true
    })
  }

  _getDevice() {
    storage.get("boundDevices").then(devices => {
      console.log("boundDevices", devices)
      if (!devices ) {
        this.setState({
          device: "",
          refreshing: false
        })
      } else if (devices.deviceArray.length > 0) {
        this.setState({
          device: devices.deviceArray[devices.currentIndex]
        })

        // 监听蓝牙开关
        // console.log(global.BluetoothManager)
        this.onStateChangeListener = global.BluetoothManager.manager.onStateChange((state) => {
          console.log("onStateChange: ", state);
          if(state == 'PoweredOn'){
            this.scan();
          }
        });
        if (this.state.isConnected) {
          this.checkBattery()
        } else {
          this.scan()
        }
      } else {
          if (BluetoothManager.peripheralId){
              BluetoothManager.disconnect();
          }
        this.setState({
          device: "",
          refreshing: false
        })
      }
    })
  }

  _onEndReached() {
    if (this.state.loading) return false
  }

  _showLoadResultContainer() {
    this.fadeInAnimated.start(_ => setTimeout(_ => {
      this.fadeOutAnimated.start()
    }, 1500))
  }
}

const viewStyles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 5,
    borderColor: '#dadada',
    backgroundColor: '#fff',
    flexDirection: 'column',
    flex: 1
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
    fontSize: 18,
    marginLeft: 3
  },
  linkText: {
    color: '#0366d6'
  },
  appNameView: {
    marginTop: 15,
    justifyContent: 'center'
  },
  appNameText: {
    fontSize: 20,
    color: '#666',
    justifyContent: 'center',
    position: 'absolute',
    left: '25%'
  }
})
