import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { changeDefaultEnterprise, getProfileData } from '../../services/user.services';
import type { IProfileResponse, IUserInfo } from '../../utils/types/sellerObserver/user.types';
import type { IEnterprise } from '../../utils/types/auth.types';
import { notify } from '../../utils/helpers/messageHelper';
import { isAbortError } from '../../services';

const initialState: IUserInfo = {
  profile: {
    username: 'Unknow',
    type: 'Unknow',
    userActives: 0,
    maxUsers: 0,
    features: [
    ],
    permissions: [],
    loading: false,
    error: null,
  },
  enterprise: {
    enterprise_id: -1,
    name: 'Unknow',
    sales_team: [],
  }
};

export const fetchProfile = createAsyncThunk<IProfileResponse, { e_id: number }, { rejectValue: string }>(
  'users/fetchProfile',
  async (params, thunkAPI) => {
    try {
      const response = await getProfileData(params.e_id);
      return response;
    } catch (error: any) {

      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar el perfil del usuario', 'ERROR')
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch profile data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeEnterprise(state, action: PayloadAction<IEnterprise>) {
      state.enterprise = action.payload;
      changeDefaultEnterprise(action.payload);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile.loading = false;
        state.profile.username = action.payload.name;
        state.profile.type = action.payload.role;
        state.profile.permissions = action.payload.permissions.map((prm) => prm.key);
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.error = action.payload ?? 'Unknown error';
      });

  },
});

export const { changeEnterprise } = userSlice.actions;
export default userSlice.reducer;
