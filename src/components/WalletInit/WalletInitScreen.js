// @flow

import React from 'react'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {SafeAreaView} from 'react-navigation'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import WalletDescription from './WalletDescription'
import {Button, StatusBar, ScreenBackground} from '../UiKit'
import styles from './styles/WalletInitScreen.style'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {walletIsInitializedSelector} from '../../selectors'

import type {State} from '../../state'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add wallet',
    description: 'some desc',
  },
  balanceCheckButton: {
    id: 'components.walletinit.walletinitscreen.balanceCheckButton',
    defaultMessage: '!!!Balance check (Shelley Testnet)',
    description: 'some desc',
  },
  createWalletButton: {
    id: 'components.walletinit.walletinitscreen.createWalletButton',
    defaultMessage: '!!!Create new wallet',
    description: 'some desc',
  },
  restoreWalletButton: {
    id: 'components.walletinit.walletinitscreen.restoreWalletButton',
    defaultMessage: '!!!Restore wallet from backup',
    description: 'some desc',
  },
})

type Props = {
  navigateBalanceCheck: () => mixed,
  navigateRestoreWallet: () => mixed,
  navigateCreateWallet: () => mixed,
  intl: any,
  walletIsInitialized: boolean,
}

const BalanceCheckButton = ({onPress, walletIsInitialized, intl}) => {
  if (!walletIsInitialized) {
    return (
      <Button
        onPress={onPress}
        title={intl.formatMessage(messages.balanceCheckButton)}
        style={styles.createButton}
      />
    )
  } else {
    return null
  }
}

const WalletInitScreen = ({
  navigateBalanceCheck,
  navigateCreateWallet,
  navigateRestoreWallet,
  intl,
  walletIsInitialized,
}: Props) => (
  <SafeAreaView style={styles.safeAreaView}>
    <StatusBar type="dark" />

    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <WalletDescription />
        </View>

        <BalanceCheckButton
          onPress={navigateBalanceCheck}
          walletIsInitialized={walletIsInitialized}
          intl={intl}
        />

        <Button
          onPress={navigateCreateWallet}
          title={intl.formatMessage(messages.createWalletButton)}
          style={styles.createButton}
        />

        <Button
          outline
          onPress={navigateRestoreWallet}
          title={intl.formatMessage(messages.restoreWalletButton)}
        />
      </View>
    </ScreenBackground>
  </SafeAreaView>
)

export default injectIntl(
  compose(
    connect((state: State) => ({
      walletIsInitialized: walletIsInitializedSelector(state),
    })),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateBalanceCheck: ({navigation}) => (event) =>
        navigation.navigate(WALLET_INIT_ROUTES.BALANCE_CHECK),
      navigateRestoreWallet: ({navigation}) => (event) =>
        navigation.navigate(WALLET_INIT_ROUTES.RESTORE_WALLET),
      navigateCreateWallet: ({navigation}) => (event) =>
        navigation.navigate(WALLET_INIT_ROUTES.CREATE_WALLET),
    }),
  )(WalletInitScreen),
)
