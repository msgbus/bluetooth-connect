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
import {Text,Button,Picker,FlatList,TouchableOpacity} from 'react-native'
import storage from '@Utils/storage'
import AsyncStorage from '@react-native-community/async-storage'

import {
  View,
  SectionList,
  StyleSheet,
  ActivityIndicator
} from 'react-native'

import {
  ListItem
} from 'react-native-elements'

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
              icon='ios7reload'
              onPressButton={onPressRightButtonFunc }
          />
      )
    }
  }

  addDevice(){
    // alert("add")
      this.props.navigation.navigate('Bluetooth')
  }

  constructor(props) {
    super(props)
    this.state = {
        loading: true,
        currentDeviceIndex: 0,
        devices:[],

    }
  }

    updateCurrentDevice = (deviceUUID) => {
        console.log('current device', deviceUUID);
        this.setState({ currentDevice: deviceUUID })
    };
  //
  // _renderItem({ item }) {
  //   return (
  //     <View>
  //       <ListItem
  //         chevron
  //         bottomDivider
  //         containerStyle={viewStyles.listItem}
  //         subtitleStyle={viewStyles.subtitleStyle}
  //         leftAvatar={{ source: { uri: getRemoteAvatar(item.avatar) } }}
  //         title={item.nickname}
  //         subtitle={item.location}
  //         onPress={_ => { this.props.navigation.navigate('Message', { user: item }) }}
  //       />
  //     </View>
  //   )
  // }
  //
  // _renderListEmpty() {
  //   if (this.state.loading) {
  //     return (
  //       <View style={viewStyles.loadingBox}>
  //         <ActivityIndicator size="large"/>
  //       </View>
  //     )
  //   }
  //   return (
  //     <EmptyBox style={{ height: 250 }}/>
  //   )
  // }
  //
  // _renderSectionHeader({ section: { title } }) {
  //   return (
  //     <ListTitle title={title}/>
  //   )
  // }
  //
  // _keyExtractor(item, index) {
  //   return index.toString()
  // }

  componentDidMount() {
      this.setState({
          loading: true
      })
      this.props.navigation.setParams({ addDevice: () => this.addDevice() })
  }
  UNSAFE_componentWillMount(){
      console.log("contacts componentWillMount ");
      this.getBoundDevices()
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
                />
            }
        </View>
    )
  }

    renderFooter=()=>{
      return (
          <View style={{marginBottom:30}}>
            <TouchableOpacity
                activeOpacity={0.7}
                // disabled={this.state.isConnected?true:false}
                onPress={()=>{this.addDevice()}}
                style={viewStyles.buttonView}>
                <View style={{flexDirection:'row', marginLeft: 10,flex:1}}>
                    <Text style={{color:'white',flex:1,justifyContent: "center", alignItems: "center", textAlign:'center',fontWeight:'bold'}}>{"add"}</Text>
                </View>
            </TouchableOpacity>
          </View>
      )
    }

    deviceItems=(item)=>{
        let data = item.item;
        return(
            <TouchableOpacity
                activeOpacity={0.7}
                // disabled={this.state.isConnected?true:false}
                onPress={()=>{this.setCurrentDevice(item)}}
                style={(item.index == this.state.currentDeviceIndex)?viewStyles.buttonView: viewStyles.otherButtonView}>
                <View style={{flexDirection:'row', marginLeft: 10,flex:1}}>
                    <Text style={[viewStyles.itemFontView,(item.index == this.state.currentDeviceIndex)?{color:'white'}:{color:'black'},{flex:1,fontWeight:'bold'}]}>{data.name}</Text>
                </View>
                <View style={{flexDirection:'row',flex:1,marginTop:5}}>
                    <Text style={[viewStyles.itemFontView,(item.index == this.state.currentDeviceIndex)?{color:'white'}:{color:'black'},{flex:1}]}>{"Type: "+data.type}</Text>
                    <Text style={[viewStyles.itemFontView,(item.index == this.state.currentDeviceIndex)?{color:'white'}:{color:'black'},{flex:1}]}>{"UUID: "+data.deviceId}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    async getBoundDevices() {
        await storage.get('boundDevices').then(value=>{
            this.setState({
                loading: false
            });
            console.log("get bound value:",value);
            this.setState({devices : value.deviceArray, currentDeviceIndex:value.currentIndex});
            console.log("state devices:",this.state.devices)
        });
    }

    setCurrentDevice(item) {

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
        paddingTop:10,
        paddingBottom:10,
        backgroundColor: config.mainColor,
        borderRadius:15,
        borderWidth: 1,
        borderColor: '#fff'
    },
    otherButtonView: {
        marginRight:5,
        marginLeft:5,
        marginTop:10,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor: '#858585',
        borderRadius:15,
        borderWidth: 1,
        borderColor: '#fff',
    },
    itemFontView: {
        justifyContent: "center",
        alignItems: "center",
        textAlign:'center'
    }
})
