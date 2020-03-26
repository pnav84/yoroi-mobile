// @flow

import React from 'react'
import QRCode from 'react-native-qrcode-svg'

type Props = {
  address: string,
}

const AddressDetail = ({address}: Props) => (
  <QRCode value={address} size={140} backgroundColor="black" color="white" />
)

export default AddressDetail
