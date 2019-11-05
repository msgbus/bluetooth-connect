import React from 'react'
import config from '@Config'
import t from '@Localize'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'

import Icon from '@Components/Icon'
import HomeScreen from '@Views/Home'
import ContactsScreen from '@Views/Contacts'
import SettingsScreen from '@Views/Settings'
import AboutScreen from '@Views/About'
import ProfileScreen from '@Views/Profile'
import LanguageScreen from '@Views/Language'
import FeedbackScreen from '@Views/Feedback'
import MessageScreen from '@Views/Message'
import PostScreen from '@Views/Post'
import BluetoothScreen from '../Bluetooth'
import AwesomeIcon from 'react-native-vector-icons/Ionicons'

import {
  View,
  Text,
  Platform
} from 'react-native'

const HomeStack = createStackNavigator({
  Home: { screen: HomeScreen, }
})
const DevicesStack = createStackNavigator({
  Devices: { screen: ContactsScreen }
})
const SettingsStack = createStackNavigator({
  Settings: { screen: SettingsScreen },
})

const TabNavigator = createBottomTabNavigator(
  {
    Home: { screen: HomeStack },
    Devices: { screen: DevicesStack },
    Settings: { screen: SettingsStack }
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarLabel: ({ focused, tintColor }) => {
        const { routeName } = navigation.state
        const viewStyle = {
          alignItems: 'center'
        }
        if (Platform.OS === 'android') {
          viewStyle.marginBottom = 4
        }
        switch (routeName) {
          case 'Home':
            return <View style={viewStyle}><Text style={{ color: tintColor, fontSize: 12 }}>{t('global.home')}</Text></View>
          case 'Devices':
            return <View style={viewStyle}><Text style={{ color: tintColor, fontSize: 12 }}>{t('global.devices')}</Text></View>
          case 'Settings':
            return <View style={viewStyle}><Text style={{ color: tintColor, fontSize: 12 }}>{t('global.settings')}</Text></View>
        }
      },
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state
        let iconName
        switch (routeName) {
          case 'Home':
            iconName = `ios7home${focused ? '' : 'outline'}`
            break
          case 'Devices':
            iconName = `ios-bluetooth${focused ? '' : 'outline'}`
              return <AwesomeIcon name='ios-bluetooth' size={22} color={tintColor}/>
            break
          case 'Settings':
            iconName = `ios7gear${focused ? '' : 'outline'}`
            break
        }
        return <Icon name={iconName} size={26} color={tintColor} />
      },
    }),
    tabBarOptions: {
      activeTintColor: config.mainColor,
      inactiveTintColor: 'gray',
    }
  }
)

const AppStack = createStackNavigator({
  Tabs: TabNavigator,
  About: { screen: AboutScreen },
  Profile: { screen: ProfileScreen },
  Language: { screen: LanguageScreen },
  Feedback: { screen: FeedbackScreen },
  Devices: { screen: MessageScreen },
  Post: { screen: PostScreen }
  , Bluetooth: { screen: BluetoothScreen }
}, {
  headerMode: 'none',
})

export default createAppContainer(AppStack)
