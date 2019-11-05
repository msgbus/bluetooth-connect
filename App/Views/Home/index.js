import React from 'react'
import connect from 'redux-connect-decorator'
import config from '@Config'
import styles from '@Styles'
import t from '@Localize'
import HeaderButton from '@Components/HeaderButton'
import Post from '@Components/Post'
import { fetchUserInfo, fetchTimeline, refreshTimeline, loadMoreTimeline, setModalVisibleStatus, refreshDevice, updateRefreshHome } from '@Store/Actions'

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
  RefreshControl
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
  loadMoreTimeline,
})

@connect(state => ({
  updateDevice: state.home.updateDevice
}), {
  refreshDevice
})

@connect(state => ({
  refreshing: state.home.refreshing
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
    super(props)
    this.state = {
      refreshing: this.props.refreshing,
      loading: false,
      loadedEnd: false,
      loadResultOpacity: new Animated.Value(0),
      device: "",
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
    this._getDevice()
  }

  _renderItem(item) {
    if (item.item) {
      if (item.item.type === 'Weport T1') {
        console.log('render item', item)
        return (<TwsT1 device={item.item}/>)
      }
    }
  }

  _keyExtractor(item, index) {
    return index
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

    console.log("onRefresh")

    // this.setState({devcie: ""})
    // this.setState({ device: this.state.device })

    this._getDevice()

    this.props.refreshDevice(true)

    this.setState({ refreshing: this.props.refreshing })
  };

  _renderDevice () {
    console.log("device", this.state.device)
    if (this.state.device != "") {
      return (
        <TwsT1 device={this.state.device}/>
      )
    } else {
      return (
        <Text> add device please </Text>
        )
    }
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
      if (devices.deviceArray.length > 0) {
        this.setState({
          device: devices.deviceArray[devices.currentIndex]
        })
      } else {
        this.setState({
          device: ""
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
