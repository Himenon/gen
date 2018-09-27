import { ComponentConfig } from '@gen'
import { space, themeGet, width } from 'styled-system'

export const primitives: ComponentConfig[] = [
  {
    name: 'Box',
    type: 'div',
    props: {},
    style: {},
    system: [],
  },
  {
    name: 'Flex',
    type: 'Box',
    props: {},
    style: {
      display: 'flex',
    },
    system: ['alignItems', 'justifyContent', 'flexWrap', 'flexDirection'],
  },
  {
    name: 'Grid',
    type: 'div',
    props: {},
    style: (props: ComponentConfig) => ({
      display: 'flex',
      flexWrap: 'wrap',
      // disable defaults from dxs
      width: '100% !important',
      margin: '0 !important',
      padding: '0 !important',
      color: 'inherit !important',
      backgroundColor: 'transparent !important',
      '& > *': { ...space(props), ...width(props) },
    }),
    system: ['alignItems', 'justifyContent', 'flexDirection'],
  },
  {
    name: 'Text',
    type: 'div',
    props: {},
    style: {},
    system: ['textAlign', 'fontWeight'],
  },
  {
    name: 'Heading',
    type: 'h2',
    props: {
      m: 0,
    },
    style: {
      lineHeight: 1.25,
    },
    system: ['textAlign', 'fontWeight'],
  },
  {
    name: 'Link',
    type: 'a',
    props: {
      color: 'blue',
    },
    style: {},
    system: [],
  },
  {
    name: 'Image',
    type: 'img',
    props: {},
    style: {
      maxWidth: '100%',
      height: 'auto',
    },
    system: [],
  },
  {
    name: 'Font',
    type: 'div',
    props: {},
    style: (props: ComponentConfig) => ({
      fontFamily: themeGet('fonts.0', 'sans-serif')(props),
      lineHeight: themeGet('lineHeight', '1.5')(props),
      color: themeGet('textColor')(props),
    }),
    system: [],
  },
  {
    name: 'DefaultLayout',
    type: 'div',
    props: {
      mx: 'auto',
      px: 3,
      pt: 3,
      pb: 4,
    },
    style: {
      maxWidth: '768px',
    },
    system: [],
  },
]
