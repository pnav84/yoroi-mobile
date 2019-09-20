// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'
import {injectIntl, defineMessages} from 'react-intl'
import {NavigationEvents, SafeAreaView} from 'react-navigation'
import {View, ScrollView} from 'react-native'
import _ from 'lodash'

import {StatusBar, Button, ValidatedTextInput} from '../../UiKit'
import {
  getWalletNameError,
  validateWalletName,
} from '../../../utils/validators'
import type {WalletNameValidationErrors} from '../../../utils/validators'

import {walletNamesSelector} from '../../../selectors'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'
import {ROOT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import {createHardwareWallet} from '../../../actions'
import type {Navigation} from '../../../types/navigation'
import globalMessages from '../../../i18n/global-messages'

import styles from './styles/SaveNanoXScreen.style'

// TODO
const messages = defineMessages({
  title: {
    id: 'components.walletinit.savenanoxscreen.title',
    defaultMessage: '!!!Save wallet',
    description: 'some desc',
  },
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
    description: 'some desc',
  },
  continueButton: {
    id: 'components.walletinit.walletform.continueButton',
    defaultMessage: '!!!Continue',
    description: 'some desc',
  },
})


type Props = {
  intl: any,
  navigation: Navigation,
  navigateToWallet: ({
    name?: string,
  }) => mixed,
  walletNames: Array<string>,
  // $FlowFixMe
  validateWalletName: (walletName: string) => WalletNameValidationErrors,
}

type ComponentState = {
  name: string,
}

class SaveHWScreen extends React.PureComponent<Props, ComponentState> {

  state = {name: 'My Ledger Wallet'} // TODO: retrieve default wallet name

  validateForm = (): WalletNameValidationErrors => {
    const {name} = this.state
    const nameErrors = this.props.validateWalletName(name)
    return {...nameErrors}
  }

  handleSubmit = () => {
    const {name} = this.state

    this.props.navigateToWallet({name})
  }

  // a save button should navigateToWallet
  render() {

    const {intl} = this.props
    const {name} = this.state

    const validationErrors = this.validateForm()

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar type="dark" />
        <NavigationEvents onWillBlur={this.handleOnWillBlur} />

        <ScrollView keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <ValidatedTextInput
              label={intl.formatMessage(messages.walletNameInputLabel)}
              value={name}
              onChangeText={this.handleSetName}
              error={getWalletNameError(
                {
                  tooLong: intl.formatMessage(
                    globalMessages.walletNameErrorTooLong,
                  ),
                  nameAlreadyTaken: intl.formatMessage(
                    globalMessages.walletNameErrorNameAlreadyTaken,
                  ),
                },
                validationErrors,
              )}
            />
          </View>
        </ScrollView>

        <View style={styles.action}>
          <Button
            onPress={this.handleSubmit}
            disabled={!_.isEmpty(validationErrors)}
            title={intl.formatMessage(messages.continueButton)}
          />
        </View>
      </SafeAreaView>
    )
  }
}

export default injectIntl(
  compose(
    connect(
      (state) => ({
        walletNames: walletNamesSelector(state),
      }),
      {
        createHardwareWallet,
        validateWalletName,
      },
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateToWallet: ignoreConcurrentAsyncHandler(
        ({navigation, createHardwareWallet}) => async ({name, password}) => {
          const extPublicKey = navigation.getParam('extPublicKey')
          console.log(`extPublicKey: ${extPublicKey}`)
          await createHardwareWallet(name, extPublicKey)
          navigation.navigate(ROOT_ROUTES.WALLET)
        },
        1000,
      ),
      validateWalletName: ({walletNames}) => (walletName) =>
        validateWalletName(walletName, null, walletNames),
    }),
  )(SaveHWScreen),
)
