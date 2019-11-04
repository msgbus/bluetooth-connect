import React from 'react'
import connect from 'redux-connect-decorator'
import PropTypes from 'prop-types'
import config from '@Config'
import Icon from '../Icon'
import t from '@Localize'
import ParsedText from 'react-native-parsed-text'
import { getRemoteAvatar } from '@Utils'
import { formatDistance } from 'date-fns'
import { setModalVisibleStatus, setModalParams, updatePost } from '@Store/Actions'

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

@connect(state => ({
  //
}), {
  setModalVisibleStatus,
  setModalParams,
  updatePost
})

export default class TwsT1 extends React.Component {
  render() {
    const { disableToolbar, post } = this.props
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
            <Text style={styles.toolItemText}>L 100%</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolItemContainer}>
          <View style={styles.toolItem}>
            <Text style={styles.toolItemText}>R 100%</Text>
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
            <Text>BluetoothName</Text>
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
