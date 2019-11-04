import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Platform,
  Alert,
  AppRegistry,
  Button
} from 'react-native';
import BleModule from './BleModule';
import HeaderButton from '@Components/HeaderButton'
import {
  Header
} from 'react-native-elements'
import t from '@Localize'
import styles from '@Styles'
import config from '@Config'
import {decode as atob, encode as btoa} from 'base-64'
import {Buffer} from "buffer";
import DialogInput from 'react-native-dialog-input';

export default class App extends Component {
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
        }
        this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
        this.deviceMap = new Map();

        global.BluetoothManager = new BleModule();
    }

    componentDidMount(){
        // 监听蓝牙开关
        // console.log(global.BluetoothManager)
        this.onStateChangeListener = global.BluetoothManager.manager.onStateChange((state) => {
            console.log("onStateChange: ", state);
            if(state == 'PoweredOn'){
                this.scan();
            }
        })
      this.scan()
    }     

    componentWillUnmount() {
       BluetoothManager.destroy();
       this.onStateChangeListener && this.onStateChangeListener.remove();
       this.disconnectListener && this.disconnectListener.remove();
       this.monitorListener && this.monitorListener.remove();
    }

    alert(text){
        Alert.alert('提示',text,[{ text:'确定',onPress:()=>{ } }]);
    }

    scan(){
        if(!this.state.scaning) {
            this.setState({scaning:true});
            this.deviceMap.clear();
            BluetoothManager.manager.startDeviceScan(null, null, (error, device) => {                
                if (error) {
                    console.log('startDeviceScan error:',error)
                    if(error.errorCode == 102){
                        this.alert('请打开手机蓝牙后再搜索');
                    }
                    this.setState({scaning:false});   
                }else{
                    console.log(device.id,device.name);
                    this.deviceMap.set(device.id,device); //使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
                    this.setState({data:[...this.deviceMap.values()]});      
                }              
            })
            this.scanTimer && clearTimeout(this.scanTimer);
            this.scanTimer = setTimeout(()=>{
                if(this.state.scaning){
                   BluetoothManager.stopScan();
                   this.setState({scaning:false});                   
                }                
            }, 5000)  // 5秒后停止搜索
        }else {
            BluetoothManager.stopScan();
            this.setState({scaning:false});
        }
    }
   
    connect(item){        
        if(this.state.scaning){  //连接的时候正在扫描，先停止扫描
            BluetoothManager.stopScan();
            this.setState({scaning:false});
        }
        if(BluetoothManager.isConnecting){
            console.log('当前蓝牙正在连接时不能打开另一个连接进程');
            return;
        }
        let newData = [...this.deviceMap.values()];
        newData[item.index].isConnecting = true;  //正在连接中
        this.setState({data:newData});
        BluetoothManager.connect(item.item.id)
            .then(device=>{
                newData[item.index].isConnecting = false;
                this.setState({data:[newData[item.index]], isConnected:true});
                this.onDisconnect();
                this.monitor("66666666-6666-6666-6666-666666666666","77777777-7777-7777-7777-777777777777");
            })
            .catch(err=>{
                newData[item.index].isConnecting = false;
                this.setState({data:[...newData]});
                this.alert(err);
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
                    this.alert('monitor fail: ' + error.reason);
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

    renderItem=(item)=>{
        let data = item.item;
        return(
            <TouchableOpacity
                activeOpacity={0.7}
                disabled={this.state.isConnected?true:false}
                onPress={()=>{this.connect(item)}}
                style={styles.item}>                         
                <View style={{flexDirection:'row', marginTop: 10}}>
                    <Text style={{color:'black'}}>{data.name?data.name:''}</Text>
                    <Text style={{color:"red",marginLeft:50}}>{data.isConnecting?'连接中...':''}</Text>
                </View>
                <Text>{data.id}</Text>
               
            </TouchableOpacity>
        );
    }

    renderHeader=()=>{
        return(
            <View style={styles.container}>        
                <View style={{marginTop:20}}>
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        style={styles.buttonView}
                        onPress={this.state.isConnected ? this.disconnect.bind(this) : this.scan.bind(this)}>
                        <Text style={styles.buttonText}>{this.state.scaning?'正在搜索中':this.state.isConnected?'断开蓝牙':'搜索蓝牙'}</Text>
                    </TouchableOpacity>
                    
                    <Text style={{marginLeft:10,marginTop:10}}>
                        {this.state.isConnected?'当前连接的设备':'可用设备'}
                    </Text>
                </View>
            </View>
        )
    }

    renderFooter=()=>{
        return(
            <View style={{marginBottom:30}}>
                {this.state.isConnected?
                <View>
                    {/*{this.renderWriteView('写数据(write)：','发送',*/}
                            {/*BluetoothManager.writeWithResponseCharacteristicUUID,this.write)}*/}
                    {/*{this.renderWriteView('写数据(writeWithoutResponse)：','发送',*/}
                            {/*BluetoothManager.writeWithoutResponseCharacteristicUUID,this.writeWithoutResponse,)}*/}
                    {/*{this.renderReceiveView('读取的数据：','读取',*/}
                            {/*BluetoothManager.readCharacteristicUUID,this.read,this.state.readData)}*/}
                    {/*{this.renderReceiveView(`监听接收的数据：${this.state.isMonitoring?'监听已开启':'监听未开启'}`,'开启监听',*/}
                            {/*BluetoothManager.nofityCharacteristicUUID,this.monitor,this.state.receiveData)}*/}
                    <View style={{flex: 1, flexDirection: 'row', marginHorizontal:10}}>
                        <View style={{flex: 2}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.buttonView}
                                onPress={() => {
                                    this.checkBattery();
                                }
                                }>
                                <Text style={styles.buttonText}>{"查询电量"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 3, height:30,alignItems:"center", justifyContent:"center", marginTop:10}}>
                            <Text>{this.state.battery}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', marginHorizontal:10}}>
                        <View style={{flex: 2}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.buttonView}
                                onPress={() => {
                                    this.checkVersion();
                                }
                                }>
                                <Text style={styles.buttonText}>{"查询版本"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 3, height:30,alignItems:"center", justifyContent:"center", marginTop:10}}>
                            <Text>{this.state.version}</Text>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: 'row', marginHorizontal:10}}>
                        <View style={{flex: 1}}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.buttonView,{height:30,alignItems:'center'}]}
                                onPress={() => {
                                    this.setState({isDialogVisible: true});
                                }
                                }>
                                <Text style={styles.buttonText}>{"修改蓝牙名称"}</Text>
                                <DialogInput
                                    isDialogVisible={this.state.isDialogVisible}
                                    title={"修改蓝牙名称"}
                                    message={"请输入你要修改的广播名"}
                                    // hintInput ={this.state.data[1]}
                                    cancelText={"取消"}
                                    submitText={"确定"}
                                    submitInput={ (inputText) => {this.changeBroatcastName(inputText);
                                        this.setState({isDialogVisible: false}) }}
                                    closeDialog={ () => {this.setState({isDialogVisible: false});
                                    }}>
                                </DialogInput>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                :<View style={{marginBottom:20}}></View>
                }        
            </View>
        )
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

    renderWriteView=(label,buttonText,characteristics,onPress,state)=>{
        if(characteristics.length == 0){
            return null;
        }
        return(
            <View style={{marginHorizontal:10,marginTop:30}} behavior='padding'>
                <Text style={{color:'black'}}>{label}</Text>
                    <Text style={styles.content}>
                        {this.state.writeData}
                    </Text>                        
                    {characteristics.map((item,index)=>{
                        return(
                            <TouchableOpacity 
                                key={index}
                                activeOpacity={0.7} 
                                style={styles.buttonView} 
                                onPress={()=>{onPress(index)}}>
                                <Text style={styles.buttonText}>{buttonText} ({item})</Text>
                            </TouchableOpacity>
                        )
                    })}      
                    <TextInput
                        style={[styles.textInput]}
                        value={this.state.text}
                        placeholder='请输入消息'
                        onChangeText={(text)=>{
                            this.setState({text:text});
                        }}
                    />
            </View>
        )
    }

    renderReceiveView=(label,buttonText,characteristics,onPress,state)=>{
        if(characteristics.length == 0){
            return null;
        }
        return(
            <View style={{marginHorizontal:10,marginTop:30}}>
                <Text style={{color:'black',marginTop:5}}>{label}</Text>               
                <Text style={styles.content}>
                    {state}
                </Text>
                {characteristics.map((item,index)=>{
                    return(
                        <TouchableOpacity 
                            activeOpacity={0.7} 
                            style={styles.buttonView} 
                            onPress={()=>{onPress(index)}} 
                            key={index}>
                            <Text style={styles.buttonText}>{buttonText} ({item})</Text>
                        </TouchableOpacity>
                    )
                })}        
            </View>
        )
    }   

    render () {
        return (
            <View style={styles.container}>  
                <Header
                    leftComponent={<HeaderButton text={ t('global.back') } icon={ 'ios7arrowleft' } onPressButton={ _ => { this.props.navigation.goBack() } }/>}
                    centerComponent={{ text: "Add device", style: styles.modalHeader.center }}
                    containerStyle={{
                    backgroundColor: config.mainColor,
                    }}
                />
                <FlatList
                    renderItem={this.renderItem}
                    keyExtractor={item=>item.id}
                    data={this.state.data}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                    extraData={[this.state.isConnected,this.state.text,this.state.receiveData,this.state.readData,this.state.writeData,this.state.isMonitoring,this.state.scaning]}
                    keyboardShouldPersistTaps='handled'
                />            
            </View>
        )
    }
}

const viewStyles = StyleSheet.create({
  container: {
    ...styles.container,
  },
})
