import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { URoles } from '../../utils/constants/auth.constants';
import type { IAuth, IAuthState, ILoginData, ILoginResponse } from '../../utils/types/auth.types';
import { authenticate, setLocalAuth } from '../../services/auth.service';
import { notify } from '../../utils/helpers/messageHelper';

const initialState: IAuthState = {
  auth: {
    role: URoles.PUBLIC,
    isAuthenticated: false,
    enterprises: [],
    token: '',
    user_id: -1,
    expiration_date: ''
  },
  loading: false,
  error: undefined
};

export const fetchLogin = createAsyncThunk<ILoginResponse, ILoginData, { rejectValue: string }>(
  'auth/login',
  async (loginData: ILoginData, thunkAPI) => {
    try {
      return authenticate(loginData).then((response) => {
        setLocalAuth(response);
        return response;
      }).catch((e) => {
        notify(e?.message ?? 'Ocurrio un error al intentar iniciar sesión', 'ERROR')
        throw e
      });
    } catch (e: any) {
      notify(e?.message ?? 'Ocurrio un error al intentar iniciar sesión', 'ERROR')
      return thunkAPI.rejectWithValue(e.message || 'Failed to fetch sellers');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    preLogin(state, action: PayloadAction<IAuth>) {
      state.auth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLogin.fulfilled, (state, action) => {
        const { enterprises, user_id, token, expiration_date } = action.payload;
        state.auth = { ...state.auth, enterprises, user_id, token, expiration_date };

        state.auth.isAuthenticated = true;
        state.auth.role = 'CLIENT';

        state.loading = false;
      })
      .addCase(fetchLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { preLogin } = authSlice.actions;
export default authSlice.reducer;
