// A page that slides up over the app. On iPhone it is a card with the app peeking above it. Android draws the app edge to
// edge and has no card style, so the same page filled the whole screen and its title ran into the clock: there, the
// page starts below the status bar.
import React from 'react';
import {Modal,Platform,StatusBar,View,type ModalProps} from 'react-native';
import {colors} from './theme';

export function PageSheet({children,...props}:Omit<ModalProps,'presentationStyle'>){
 return <Modal {...props} presentationStyle="pageSheet">
  {Platform.OS==='android'?<View style={{flex:1,backgroundColor:colors.bg,paddingTop:StatusBar.currentHeight??24}}>{children}</View>:children}
 </Modal>;
}
