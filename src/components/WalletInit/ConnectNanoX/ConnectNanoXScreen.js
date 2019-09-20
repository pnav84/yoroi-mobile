// @flow

import React from 'react'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {
  View,
  FlatList,
  ScrollView,
  Platform,
  PermissionsAndroid,
  StyleSheet,
} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {injectIntl, defineMessages} from 'react-intl'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'

import {StatusBar, ScreenBackground, Text} from '../../UiKit'
import DeviceItem from './DeviceItem'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
// import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {saveHW, checkAndStoreHWDeviceInfo} from '../../../utils/ledgerUtils'

import {COLORS} from '../../../styles/config'
// import type {State} from '../../../state'
// import styles from './styles/WalletInitScreen.style'

const styles = StyleSheet.create({
  header: {
    marginTop: 30,
    paddingTop: 80,
    paddingBottom: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    marginBottom: 16,
    lineHeight: 24,
    color: COLORS.PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.PRIMARY,
  },
  safeAreaView: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  errorTitle: {
    color: '#c00',
    fontSize: 16,
    marginBottom: 16,
  },
})


const messages = defineMessages({
  title: {
    id: 'components.walletinit.connectnanoxscreen.title',
    defaultMessage: '!!!Connect to Nano X',
    description: 'some desc',
  },
})

const deviceAddition = (device) => ({devices}) => ({
  devices: devices.some((i) => i.id === device.id)
    ? devices
    : devices.concat(device),
})

type Props = {
  intl: any,
  navigateToSaveHW: ({
    name: string,
    extPublicKey: string,
  }) => mixed,
}

type State = {
  devices: Array<Object>,
  error: string,
  refreshing: boolean,
  transport: any,
  extPublicKey: string,
}

class ConnectNanoXScreen extends React.Component<Props, State> {

  state = {
    devices: [],
    error: '',
    refreshing: false,
    transport: null,
    extPublicKey: '',
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      )
    }
    // check if bluetooth is available
    let previousAvailable = false
    TransportBLE.observeState({
      next: (e) => {
        if (e.available !== previousAvailable) {
          previousAvailable = e.available
          if (e.available) {
            this.reload()
          }
        }
      },
    })
    this.startScan()
  }

  componentWillUnmount() {
    if (this.subscriptions) this.subscriptions.unsubscribe()
  }

  startScan = async () => {
    this.setState({refreshing: true})
    this.subscriptions = TransportBLE.listen({
      complete: () => {
        this.setState({refreshing: false})
      },
      next: (e) => {
        if (e.type === 'add') {
          this.setState(deviceAddition(e.descriptor))
        }
      },
      error: (error) => {
        this.setState({error, refreshing: false})
      },
    })
  }

  reload = async () => {
    if (this.subscriptions) this.subscriptions.unsubscribe()
    this.setState(
      {devices: [], error: null, refreshing: false},
      this.startScan
    )
  }

  keyExtractor = (item: *) => item.id

  onSelectDevice = async (device) => {
    try {
      const transport = await TransportBLE.open(device)
      const {navigation} = this.props
      transport.on('disconnect', () => {
        // Intentionally for the sake of simplicity we use a transport local state
        // and remove it on disconnect.
        // A better way is to pass in the device.id and handle the connection internally.
        this.setState({transport: null})
      })
      const hwDeviceInfo = await checkAndStoreHWDeviceInfo(transport)
      const extPublicKey = hwDeviceInfo.publicMasterKey
      this.setState({extPublicKey, transport}) // TODO: maybe not necessary in state
      // saveHW(transport)
      // this.props.navigateToSaveHW()
      navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {extPublicKey})
    } catch (error) {
      this.setState({error})
    }
  }

  renderItem = ({item}: { item: * }) => {
    return <DeviceItem device={item} onSelect={this.onSelectDevice} />
  }

  ListHeader = () => {
    const {error} = this.state
    return error ? (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sorry, an error occured</Text>
        <Text style={styles.errorTitle}>{String(error.message)}</Text>
      </View>
    ) : (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scanning for Bluetooth...</Text>
        <Text style={styles.headerSubtitle}>
          Power up your Ledger Nano X and enter your pin.
        </Text>
      </View>
    )
  }

  render() {

    const {intl} = this.props
    const {devices, error, refreshing, transport} = this.state

    if (!transport) {
      return (
        <SafeAreaView style={styles.safeAreaView}>
          <StatusBar type="dark" />
          <View style={styles.container}>
            <ScreenBackground>
              <ScrollView style={styles.safeAreaView}>
                <FlatList
                  extraData={error}
                  style={styles.list}
                  data={devices}
                  renderItem={this.renderItem}
                  keyExtractor={this.keyExtractor}
                  ListHeaderComponent={this.ListHeader}
                  onRefresh={this.reload}
                  refreshing={refreshing}
                />
              </ScrollView>
            </ScreenBackground>
          </View>
        </SafeAreaView>
      )
    }
    return (
      <SafeAreaView>
        <StatusBar type="dark" />
        <ScreenBackground>
          <View>
            <View>
              <Text>"Looks like we are paired"</Text>
            </View>
          </View>
        </ScreenBackground>
      </SafeAreaView>
    )

  }
}

type ExternalProps = {|
  intl: any,
|}

// TODO
// add handler to navigate to saveHWscreen including the public key as parameter
// ej:
// withHandlers({
//   navigateToSaveHW: ({navigation, extPublicKey}) => (event) => {
//     navigation.navigate(WALLET_INIT_ROUTES.HW_WALLET_CREDENTIALS, {
//       extPublicKey: extPublicKey,
//     })
//   },
// }),

export default injectIntl(
  (compose(
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateToSaveHW: ({navigation, extPublicKey}) => (event) => {
        navigation.navigate(WALLET_INIT_ROUTES.SAVE_NANO_X, {extPublicKey})
      },
    }),
  )(ConnectNanoXScreen): React.ComponentType<ExternalProps>),
)
