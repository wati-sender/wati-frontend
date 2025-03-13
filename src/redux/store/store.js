import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from "../auth/authSlice";

const persistAuthConfig = {
    key: 'auth',
    storage,
};

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'], // Ignore redux-persist actions
            },
        }),
});
    
const persistor = persistStore(store);

export { store, persistor };
