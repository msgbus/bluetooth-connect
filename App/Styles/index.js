import config from '@Config'

export default {
  container: {
    flex: 1,
    backgroundColor: config.viewsBackgroundColor
  },
  modalHeader: {
    center: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '600'
    }
  },
  buttonText: {
    color:'#fff',
    textAlign:'center',
  },
  buttonView: {
    marginRight:5,
    marginLeft:5,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: config.mainColor,
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  }
}
