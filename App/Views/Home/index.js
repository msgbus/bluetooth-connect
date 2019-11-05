import React from 'react'
import connect from 'redux-connect-decorator'
import config from '@Config'
import styles from '@Styles'
import t from '@Localize'
import HeaderButton from '@Components/HeaderButton'
import Post from '@Components/Post'
import { fetchUserInfo, fetchTimeline, refreshTimeline, loadMoreTimeline, setModalVisibleStatus } from '@Store/Actions'

import {
  View,
  Text,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import TwsT1 from "../../Components/Tws"
import storage from '@Utils/storage'

@connect(state => ({
  timeline: state.home.timeline
}), {
  setModalVisibleStatus,
  fetchUserInfo,
  fetchTimeline,
  refreshTimeline,
  loadMoreTimeline
})

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state
    const onPressRightButtonFunc = params.openPublisher || function() {}
    return {
      ...config.defaultNavigation,
      title: t('global.home'),
      headerRight: (
        <HeaderButton
          icon='feedback'
          onPressButton={ onPressRightButtonFunc }/>
      )
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      loading: false,
      loadedEnd: false,
      loadResultOpacity: new Animated.Value(0),
      devices: [],
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
  }

  componentDidMount () {
    this._onRefresh()
  }

  _renderItem({ item }) {
    console.log('render item', item)
    if (item.type === 'Weport T1') {
      return (<TwsT1 device={item}/>)
    }
  }

  _keyExtractor(item, index) {
    return item.id
  }

  render() {
    return (
      <View style={viewStyles.container}>
        <FlatList
          contentContainerStyle={{ paddingBottom: 10 }}
          keyExtractor={this._keyExtractor}
          data={this.state.devices}
          renderItem={this._renderItem.bind(this)}
          onRefresh={this._onRefresh.bind(this)}
          onEndReached= {this._onEndReached.bind(this)}
          refreshing={this.state.refreshing}
        />
      </View>
    )
  }

  openPublisher() {
    this.props.setModalVisibleStatus({
      name: 'publisher',
      status: true
    })
  }

  navToPost(item) {
    this.props.navigation.navigate('Post', { mid: item.id })
  }

  _onRefresh() {
    this.setState({
      refreshing: true
    })
    storage.get("boundDevices").then(devices => {
      this.setState({
        refreshing: false,
        devices: devices
      })
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
    ...styles.container,
    paddingTop: 5
  },
  loadResultContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: config.mainColor,
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
    color: '#fff',
    fontSize: 13
  },
  listFooter: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
