import * as React from 'react';
import Navigation from './navigation/navigation'
// Dependance AsyncStorage
import AsyncStorage  from '@react-native-community/async-storage';
// Dependance Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger'
import { persistStore, persistReducer } from 'redux-persist'
import {PersistGate} from 'redux-persist/es/integration/react'
// Root Redux
import rootReducer from './redux/index';

const persistConfig = {
  key:'root',
  storage: AsyncStorage,
  whitelist:['emailReducer', 'passwordReducer', 'pointingReducer', 'listeEmailReducer']
}

const persitedReducer = persistReducer(persistConfig, rootReducer)

const store = createStore (
  persitedReducer, applyMiddleware(createLogger())
);

const peristedStore = persistStore(store)

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={peristedStore} loading={null}>
          <Navigation/>
        </PersistGate>
      </Provider>        
    );
  }
}
