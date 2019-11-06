import React from 'react'
import connect from 'redux-connect-decorator'
import config from '@Config'
import styles from '@Styles'
import t from '@Localize'
import ListTitle from '@Components/ListTitle'
import EmptyBox from '@Components/EmptyBox'
import { fetchContacts } from '@Store/Actions'
import { getRemoteAvatar } from '@Utils'
import HeaderButton from '@Components/HeaderButton'
import {Text,Button,Picker,FlatList,TouchableOpacity,Alert,Image} from 'react-native'
import storage from '@Utils/storage'
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-root-toast';
import AwesomeIcon from 'react-native-vector-icons/Ionicons'
import T1_Icon from '@assets/T1_icon.jpg'
import T2_Icon from '@assets/T1_icon.jpg'

import {
  View,
  SectionList,
  StyleSheet,
  ActivityIndicator
} from 'react-native'

import {
  ListItem
} from 'react-native-elements'
import Icon from "../../Components/Icon";

@connect(state => ({
  contacts: state.contacts.contacts
}), {
  fetchContacts
})

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
      const { params = {} } = navigation.state
      const onPressRightButtonFunc = params.addDevice || function() {}

      return {
      ...config.defaultNavigation,
      title: t('global.devices'),
      headerRight: (
          <HeaderButton
              icon='ios-add'
              onPressButton={onPressRightButtonFunc }
              customize={true}
          />
      )
    }
  }

  addDevice(){
    // alert("add")
      this.props.navigation.navigate('Bluetooth', {
          callback: (data) => {
              console.log(data); // 打印值为：'回调参数'
              this.getBoundDevices();
          }
      })
  }

  constructor(props) {
    super(props)
    this.state = {
        loading: true,
        currentDeviceIndex: -1,
        devices:[],
        refreshing: true,
    }
  }


  componentDidMount() {
      this.setState({
          loading: true
      });
      this.props.navigation.setParams({
          addDevice: () => this.addDevice()}
      );

  }
  UNSAFE_componentWillMount(){
      console.log("contacts componentWillMount ");
      this.getBoundDevices()
  }

    _onRefresh() {
        this.setState({
            refreshing: true
        });
        this.getBoundDevices();
    }
  render() {
    return (
        <View style={viewStyles.container}>
            {this.state.loading ?
                <View style={viewStyles.loadingBox}>
                    <ActivityIndicator size="large"/>
                </View>:
                <FlatList
                    renderItem={this.deviceItems}
                    keyExtractor={item=>item.name}
                    data={this.state.devices}
                    ListFooterComponent={this.renderFooter}
                    onRefresh={this._onRefresh.bind(this)}
                    refreshing={this.state.refreshing}
                />
            }
        </View>
    )
  }

    renderFooter=()=>{
      return (
          <View style={{justifyContent:'center',alignItems:'center'}}>
              <View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    // disabled={this.state.isConnected?true:false}
                    onPress={()=>{this.addDevice()}}
                    style={viewStyles.addDeviceButtonView}>
                    <View style={{justifyContent: "center", alignItems: "center", textAlign:'center'}}>
                        <AwesomeIcon name='ios-add-circle-outline' style={{fontSize: 80, color:"#CCC"}}/>
                        {/*<Text style={{color:'black',flex:1,justifyContent: "center", alignItems: "center", textAlign:'center',fontWeight:'bold'}}>{"add"}</Text>*/}
                    </View>
                </TouchableOpacity>
              </View>
          </View>
      )
    }

    deviceItems=(item)=>{
        let data = item.item;
        return(
            <View style = {{flexDirection:'row',flex:6}}>

                <TouchableOpacity
                    activeOpacity={0.7}
                    // disabled={this.state.isConnected?true:false}
                    onPress={()=>{this.setCurrentDevice(item)}}
                    style={[(item.index == this.state.currentDeviceIndex)?viewStyles.buttonView: viewStyles.otherButtonView,{flex:5}]}>
                    <View style = {{flexDirection:'row',flex:1,height:80}}>
                        {(this.state.devices[item.index].type == "Weport T1")?
                            <View style = {{flex:2,
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign:'center'}}>

                                <Image
                                source={T1_Icon}
                                resizeMode={'cover'}
                                style={{height:75,width:75,borderRadius:10}}
                                />
                            </View>:<View/>
                        }
                        <View style = {{flex:5,paddingTop:10,paddingBottom:10}}>
                            <Text style={[viewStyles.itemFontView,(item.index == this.state.currentDeviceIndex)?{color:'white'}:{color:'black'},{flex:1,fontWeight:'bold',fontSize:20}]}>{data.name}</Text>
                            {/*<Text style={[viewStyles.itemFontView,(item.index == this.state.currentDeviceIndex)?{color:'white'}:{color:'black'},{flex:1}]}>{"UUID: "+data.deviceId}</Text>*/}
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={()=>{this.rmDevice(item)}}
                     style={[viewStyles.itemFontView,{flex:1}]}>
                    <View style={{justifyContent: "center", alignItems: "center", textAlign:'center',marginTop:5}}>
                        <AwesomeIcon name='ios-remove-circle-outline' style={{fontSize: 50, color:"#C55"}}/>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    rmDevice(item) {
      this.state.devices.splice(item.index,1);
      if (item.index == this.state.currentDeviceIndex) {
          this.state.currentDeviceIndex = 0;
      }


        Alert.alert(
            t("global.tips"),
            t("contact.deleteOrNot"),
            [
                {text: t("global.cancel")},
                {text: t("global.ok"), onPress: () => {
                        const deviceData = {
                            deviceArray: this.state.devices,
                            currentIndex:this.state.currentDeviceIndex
                        };

                        console.log(deviceData);
                        storage.save("boundDevices",deviceData);
                        let toast = Toast.show(t("contact.rmSuccess"), {
                            duration: Toast.durations.LONG,
                            position: Toast.positions.BOTTOM,
                            shadow: true,
                            animation: true,
                            hideOnPress: true,
                            delay: 100
                        });
                        setTimeout(function () {
                            Toast.hide(toast);
                        }, 1000);
                        this.getBoundDevices();
                    }
                }
            ]
        )
    }

    async getBoundDevices() {
        await storage.get('boundDevices').then(value=>{
            this.setState({
                loading: false
            });
            console.log("get bound value:",value);
            this.setState({devices : value.deviceArray, currentDeviceIndex:value.currentIndex, refreshing:false});
            // console.log("state devices:",this.state.devices)
        });
    }

    setCurrentDevice(item) {
      if (item.index == this.state.currentDeviceIndex) {
          Alert.alert(
              t("global.tips"),
              t("contact.alreadyCurrentDevice"),
              [
                  {text: t("global.ok")},
              ]
          );
      } else {
          Alert.alert(
              t("global.tips"),
              t("contact.setupCurrentDevice"),
              [
                  {text: t("global.cancel")},
                  {text: t("global.ok"), onPress: () => {
                          if (item.index >= 0 && item.index <= this.state.devices.length)
                          {
                              var deviceInfo = this.state.devices;
                              console.log("deviceInfo lenth and current index",deviceInfo.length,item.index);
                              const deviceData = {
                                  deviceArray: deviceInfo,
                                  currentIndex:item.index
                              };
                              console.log(deviceData);
                              storage.save("boundDevices",deviceData);
                              let toast = Toast.show(t("contact.setupSuccess"), {
                                  duration: Toast.durations.LONG,
                                  position: Toast.positions.BOTTOM,
                                  shadow: true,
                                  animation: true,
                                  hideOnPress: true,
                                  delay: 100
                              });
                              setTimeout(function () {
                                  Toast.hide(toast);
                              }, 1000);
                                this.getBoundDevices();
                          }
                      }
                  }
              ]
          )
      }

    }
}

const viewStyles = StyleSheet.create({
  container: {
    ...styles.container
  },
  listItem: {
    paddingTop: 8,
    paddingBottom: 8
  },
  subtitleStyle: {
    fontSize: 14,
    color: '#858585'
  },
  loadingBox: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
    buttonView: {
        marginRight:5,
        marginLeft:5,
        marginTop:10,
        // paddingTop:10,
        // paddingBottom:10,
        backgroundColor: config.mainColor,
        borderRadius:15,
        borderWidth: 1,
        borderColor: '#fff'
    },
    otherButtonView: {
        marginRight:5,
        marginLeft:5,
        marginTop:10,
        // paddingTop:10,
        // paddingBottom:10,
        backgroundColor: '#858585',
        borderRadius:15,
        borderWidth: 1,
        borderColor: '#fff',
    },
    itemFontView: {
        justifyContent: "center",
        alignItems: "center",
        textAlign:'center',
        textAlignVertical: 'center'
    },
    addDeviceButtonView:{
        backgroundColor: 'transparent',
        marginTop:50,
        marginBottom:30,
        borderRadius:100,
        width:100,
        height:100
    }
})
