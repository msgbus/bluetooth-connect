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
import {Text,Button} from 'react-native'
import storage from '@Utils/storage'

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
      loading: false
    }
  }
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
          loading: false
      })
      this.props.navigation.setParams({ addDevice: () => this.addDevice() })

  }

  render() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        </View>
    )
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
  }
})
