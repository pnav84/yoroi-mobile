// @flow
import {StyleSheet} from 'react-native'

import {THEME} from '../../../../styles/config'

const SECTION_MARGIN = 22
const LABEL_MARGIN = 6

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.BACKGROUND,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  scrollView: {
    paddingRight: 10,
  },
  walletInfoContainer: {
    flex: 1, // uses 1/2 of container
  },
  formContainer: {
    flex: 1, // uses 1/2 of container
  },
  label: {
    marginBottom: LABEL_MARGIN,
  },
  checksumContainer: {
    marginBottom: SECTION_MARGIN,
  },
  checksumView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderColor: 'red',
    flexWrap: 'wrap',
  },
  checksumText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  addressesContainer: {
    marginBottom: SECTION_MARGIN,
  },
  keyAttributesContainer: {},
  keyView: {
    padding: 4,
    backgroundColor: THEME.COLORS.CODE_STYLE_BACKGROUND,
    marginBottom: 10,
  },
  walletFormStyle: {
    paddingTop: 0,
  },
})