import React from 'react'
import config from '@Config'
import styles from '@Styles'
import HeaderButton from '@Components/HeaderButton'
import t ,{getCurrentLanguage}from '@Localize'
import faultTable from '@assets/faultTable.png'
import appQR from '@assets/appQR.png'
import wechatQR from '@assets/wechatQR.png'

import {
    Text,
    View,
    StyleSheet,
    Image,
    ScrollView
} from 'react-native'

import {
    Header
} from 'react-native-elements'


export default class AboutScreen extends React.Component {

    constructor() {
        super()
        this.state = {
            lang: ''
        }
    }
    componentDidMount() {
        getCurrentLanguage().then(langConfig => {
            this.setState({
                lang: langConfig.languageTag
            });
            console.log("language:"+this.state.lang+langConfig.languageTag)

        })
    }

    render() {
        return (
            <View style={viewStyles.container}>
                <Header
                    leftComponent={<HeaderButton text={ t('global.back') } icon={ 'ios7arrowleft' } onPressButton={ _ => { this.props.navigation.goBack() } }/>}
                    centerComponent={{ text: t('userManual.title'), style: styles.modalHeader.center }}
                    containerStyle={{
                        backgroundColor: config.mainColor,
                    }}
                />
                <ScrollView>
                <View style={viewStyles.textContainer}>
                    <View style={viewStyles.titleNameView}>
                        <Text style={viewStyles.titleNameText}>{t('userManual.operationGuideTitle')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.productAppearanceTitle')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.packingList')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.firstTimeUse')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.firstTimeUseContent')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.connectPhone')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.connectBT')}</Text>
                    </View>

                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.connectBTContent1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.connectBTContent2')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.autoReconnect')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.autoReconnectContent')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.disconnect')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.disconnectContent')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.longDistanceDisconnect')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.longDistanceDisconnectContent1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.longDistanceDisconnectContent2')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.clearConnect')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.clearConnectContent1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.clearConnectContent2')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.clearConnectContent3')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.clearConnectContent4')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.features')}</Text>
                    </View>
                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.wearDetection')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.wearDetectionContent1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.wearDetectionContent2')}</Text>
                    </View>
                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.doubleClick')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.callingScenario')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.callingScenarioContent')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.musicScenario')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.bothEars')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.bothEarsContent')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.tips')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.tip1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.tip2')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.reset')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.resetContent1')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.resetContent2')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.resetContent3')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.batteryIndicator')}</Text>
                    </View>

                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.earphoneBatteryIndicator')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.earphoneBatteryIndicatorContent')}</Text>
                    </View>
                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.caseBatteryIndicator')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.caseBatteryIndicatorContent')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.charge')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.chargeContent')}</Text>
                    </View>

                    <View style={viewStyles.sTitleNameView}>
                        <Text style={viewStyles.sTitleNameText}>{t('userManual.param')}</Text>
                    </View>
                    <View style={viewStyles.contentView}>
                        <Text style={viewStyles.contentText}>{t('userManual.paramContent')}</Text>
                    </View>
                    {/*<View style={viewStyles.sTitleNameView}>*/}
                        {/*<Text style={viewStyles.sTitleNameText}>{t('userManual.harmfulSubstance')}</Text>*/}
                    {/*</View>*/}
                    {/*<View>*/}
                        {/*<Image style={viewStyles.imageView} source={hazardousSubstanceTable} />*/}
                    {/*</View>*/}
                    {(this.state.lang == "en")?

                        <View>
                            <View style={viewStyles.sTitleNameView}>
                                <Text style={viewStyles.sTitleNameText}>{t('userManual.safetyRules')}</Text>
                            </View>
                            <View style={viewStyles.contentView}>
                                <Text style={viewStyles.contentText}>{t('userManual.safetyRulesContent')}</Text>
                            </View>
                            <View style={viewStyles.sTitleNameView}>
                                <Text style={viewStyles.sTitleNameText}>{t('userManual.serviceRegulations')}</Text>
                            </View>
                            <View style={viewStyles.tTitleNameView}>
                                <Text style={viewStyles.tTitleNameText}>{t('userManual.afterSalesServices')}</Text>
                            </View>
                            <View style={viewStyles.contentView}>
                                <Text style={viewStyles.contentText}>{t('userManual.afterSalesServicesContent')}</Text>
                            </View>

                            <View style={viewStyles.sTitleNameView}>
                                <Text style={viewStyles.sTitleNameText}>{t('userManual.serviceInfo')}</Text>
                            </View>
                        </View>
                        :
                        <View>
                            <View style={viewStyles.sTitleNameView}>
                                <Text style={viewStyles.sTitleNameText}>{t('userManual.serviceRegulations')}</Text>
                            </View>
                            <View style={viewStyles.tTitleNameView}>
                                <Text style={viewStyles.tTitleNameText}>{t('userManual.certificate')}</Text>
                            </View>
                            <View style={viewStyles.contentView}>
                                <Text style={viewStyles.contentText}>{t('userManual.certificateContent')}</Text>
                            </View>
                            <View style={viewStyles.tTitleNameView}>
                                <Text style={viewStyles.tTitleNameText}>{t('userManual.faultTable')}</Text>
                            </View>

                            <View>
                                <Image style={viewStyles.imageView} source={faultTable} />
                            </View>

                            <View style={viewStyles.tTitleNameView}>
                                <Text style={viewStyles.tTitleNameText}>{t('userManual.otherFault')}</Text>
                            </View>
                            <View style={viewStyles.contentView}>
                                <Text style={viewStyles.contentText}>{t('userManual.otherFaultContent')}</Text>
                            </View>
                            <View style={viewStyles.sTitleNameView}>
                                <Text style={viewStyles.sTitleNameText}>{t('userManual.serviceInfo')}</Text>
                            </View>
                            <View style={viewStyles.tTitleNameView}>
                                <Text style={viewStyles.tTitleNameText}>{t('userManual.serviceNumble')}</Text>
                            </View>
                        </View>
                    }
                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.serviceWeb')}</Text>
                    </View>

                    <View>
                        <Image style={viewStyles.imageView} source={wechatQR} />
                    </View>

                    <View style={[viewStyles.tTitleNameView,{alignItems: 'center'}]}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.wechatQR')}</Text>
                    </View>

                    <View>
                        <Image style={viewStyles.imageView} source={appQR} />
                    </View>

                    <View style={[viewStyles.tTitleNameView,{alignItems: 'center'}]}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.appQR')}</Text>
                    </View>
                    <View style={viewStyles.tTitleNameView}>
                        <Text style={viewStyles.tTitleNameText}>{t('userManual.manufacturer')}</Text>
                    </View><View style={viewStyles.tTitleNameView}>
                    <Text style={viewStyles.tTitleNameText}>{t('userManual.addr')}</Text>
                </View>

                </View>
                </ScrollView>
            </View>
        )
    }
}

const viewStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    },
    textContainer: {
        flexGrow: 1,
        paddingHorizontal:10,
        marginTop: 20,
        paddingBottom:30
    },
    titleNameView: {
        marginTop: 15,
        marginBottom:10,
        alignItems: 'center'
    },
    titleNameText: {
        alignItems: 'center',
        fontSize: 25,
        color: '#111',
        fontWeight:"bold"
    },
    sTitleNameView: {
        marginTop: 20,
    },
    sTitleNameText: {
        fontSize: 22,
        color: '#444',
        fontWeight:"bold",
        alignItems:"flex-start"
    },
    tTitleNameView: {
        marginTop: 15,
    },
    tTitleNameText: {
        fontSize: 18,
        color: '#222',
        fontWeight:"bold",
        alignItems:"flex-start"
    },
    contentView: {
        marginTop: 10,
    },
    contentText: {
        fontSize: 16,
        color: '#666',
        alignItems:"flex-start"
    },
    imageView: {
        marginTop:15,
        width: 300,
        // height: 75,
        alignSelf: 'center'
    }

})
