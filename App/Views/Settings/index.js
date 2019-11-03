import React from 'react'
import connect from 'redux-connect-decorator'
import t from '@Localize'
import config from '@Config'
import styles from '@Styles'
import Icon from '@Components/Icon'
import { View, StyleSheet, Picker } from 'react-native'
import { ListItem } from 'react-native-elements'
import AwesomeIcon from 'react-native-vector-icons/FontAwesome'
import req from '@Network'
import BluetoothReq from '../../Bluetooth';
import * as RNLocalize from "react-native-localize";
import {getCurrentLanguage} from "../../Localize";
import storage from '@Utils/storage'

@connect(state => ({
  user: state.app.user
}))

export default class HomeScreen extends React.Component {
  state = {currentDevice: ''}
  updateCurrentDevice = (deviceUUID) => {
    console.log('current device', deviceUUID)
    this.setState({ currentDevice: deviceUUID })
  }

  static navigationOptions = _ => {
    return {
      ...config.defaultNavigation,
      title: t('global.settings'),
    }
  }

  constructor() {
    super()
    this.menuList = [
      {
        title: t('settings.language'),
        icon: 'language',
        color: '#09f',
        onPress() {
          this.props.navigation.navigate('Language')
        }
      },
      // {
      //   title: t('settings.feedback'),
      //   icon: 'feedback2',
      //   color: '#0c9',
      //   onPress() {
      //     this.props.navigation.navigate('Feedback')
      //   }
      // },
      {
        title: t('settings.about'),
        icon: 'about1',
        color: '#fc3',
        onPress() {
          this.props.navigation.navigate('About')
        }
      }
    ]
  }

  render() {
    return (
    <View style={viewStyles.container}>
      <Picker selectedValue={this.state.currentDevice} onValueChange={this.updateCurrentDevice}>
        {
          this.getBoundDevices().map((item, i) => (
            <Picker.Item label={item.name} value={item.uuid}/>
          ))
        }
      </Picker>
      <View style={viewStyles.list}>
        <ListItem
          chevron
          topDivider
          bottomDivider
          leftIcon={<AwesomeIcon name='bluetooth' style={{fontSize: 26, color: '#fc3'}}/>}
          onPress={_ => { this.props.navigation.navigate('Bluetooth') }}
          title={t('settings.addDevice')}/>
      </View>
      {
          this.menuList.map((item, i) => (
            <View style={viewStyles.list} key={i}>
              <ListItem
                containerStyle={viewStyles.listItem}
                chevron
                topDivider
                bottomDivider
                title={item.title}
                onPress={item.onPress.bind(this)}
                leftIcon={<Icon style={{ marginTop: 4 }} name={item.icon} color={item.color}/>}
              />
            </View>
          ))
        }
      </View>
    )
  }

  deviceItems() {
    const devices = this.getBoundDevices();
    return devices.map((item, i) => (
      <View style={viewStyles.list} key={i}>
        <ListItem
          chevron
          topDivider
          bottomDivider
          title={item.name}
          onPress={_ => { this.props.navigation.navigate('About') }}
          leftIcon={<AwesomeIcon name='bluetooth' style={{fontSize: 26, color: '#fc3'}}/>}
        />
      </View>
    ))
  }

  getBoundDevices() {
    const devices = storage.get('boundDevices')
    // const devices = [
    //   {
    //     name: 'Weport T1',
    //     type: 'Weport T1',
    //     uuid: 'uuid1'
    //   },
    //   {
    //     name: 'Weport T2',
    //     type: 'Weport T2',
    //     uuid: 'uuid2'
    //   }
    // ]
    console.log('getBoundDevices', devices)

    return devices instanceof Array ? devices : [];
  }

}

const viewStyles = StyleSheet.create({
  container: {
    ...styles.container,
    paddingTop: 15
  },
  list: {
    marginTop: 10
  },
  listItem: {
    paddingTop: 8,
    paddingBottom: 8
  }
})
