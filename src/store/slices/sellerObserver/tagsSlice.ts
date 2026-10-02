import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ITagGroup, ITagState } from '../../../utils/types/tags.types';
import type { RootState } from '../..';
import { getAllTags } from '../../../services/history.service';
import { getFilters } from '../../../services/filters.service';
import type { IFilterPack } from '../../../utils/types/sellerObserver/filters.types';
import { notify } from '../../../utils/helpers/messageHelper';
import { isAbortError } from '../../../services';

const initialState: ITagState = {
  clientsTagList: [],
  clientsFilterList: [],
  sellersTagList: [],
  geozonesTagList: [],
  draftGeozonesTagList: [],
  loading: false,
  error: undefined,
};

export const fetchAllTags = createAsyncThunk<{
  sellersTag: ITagGroup[];
  clientsTag: ITagGroup[];
  geozonesTag: ITagGroup[];
  clientsFilter: IFilterPack[]
}, void, { rejectValue: string; state: RootState }>(
  'Tag/fetchTags',
  async (_, thunkAPI) => {
    const { user } = thunkAPI.getState();
    const { enterprise } = user;

    try {
      const [clientsTags, sellersTags, geozonesTags, clientsFilters] = await Promise.all([
        getAllTags(enterprise.enterprise_id, 'client'),
        getAllTags(enterprise.enterprise_id, 'mobile_user'),
        getAllTags(enterprise.enterprise_id, 'geozone'),
        getFilters(enterprise.enterprise_id),

      ]);

      return {
        sellersTag: sellersTags,
        clientsTag: clientsTags,
        geozonesTag: geozonesTags,
        clientsFilter: clientsFilters,
      };
    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar las etiquetas', 'ERROR');
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to fetch profile data'
      );
    }
  }
);

export const fetchAllDraftTags = createAsyncThunk<{
  draftGeozonesTag: ITagGroup[];
  clientsTag: ITagGroup[];
  sellersTag: ITagGroup[];
  clientsFilter: IFilterPack[]
}, void, { rejectValue: string; state: RootState }>(
  'Tag/fetchDraftTags',
  async (_, thunkAPI) => {
    const { user } = thunkAPI.getState();
    const { enterprise } = user;

    try {
      const [draftGeozonesTags, clientsTags, sellersTags, clientsFilters] = await Promise.all([
        getAllTags(enterprise.enterprise_id, 'draft_geozone'),
        getAllTags(enterprise.enterprise_id, 'client'),
        getAllTags(enterprise.enterprise_id, 'mobile_user'),
        getFilters(enterprise.enterprise_id),
      ]);

      return {
        draftGeozonesTag: draftGeozonesTags,
        clientsTag: clientsTags,
        sellersTag: sellersTags,
        clientsFilter: clientsFilters,
      }

    } catch (error: any) {
      if (isAbortError(error)) {
        return thunkAPI.rejectWithValue('__ABORT__');
      }

      notify(error?.detail ?? 'Ocurrió un error al buscar las etiquetas', 'ERROR');
      return thunkAPI.rejectWithValue(
        error?.message || 'Failed to fetch profile data'
      );
    }

  }
)

const TagsSlice = createSlice({
  name: 'Tags',
  initialState,
  reducers: {
    addNewClientFilter(state, action: PayloadAction<IFilterPack>) {
      const index = state.clientsFilterList.findIndex(
        f => f.filter_id === action.payload.filter_id
      );
      if (index !== -1) {
        state.clientsFilterList[index] = action.payload;
      } else {
        state.clientsFilterList.push(action.payload);
      }
    },
    removeClientFilter(state, action: PayloadAction<number>) {
      const index = state.clientsFilterList.findIndex(
        f => f.filter_id === action.payload
      );

      if (index !== -1) {
        state.clientsFilterList.splice(index, 1);
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllTags.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.loading = false;
        state.clientsTagList = action.payload.clientsTag;
        state.sellersTagList = action.payload.sellersTag;
        state.geozonesTagList = action.payload.geozonesTag;
        state.clientsFilterList = action.payload.clientsFilter;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.clientsTagList = [];
        state.sellersTagList = [];
        state.geozonesTagList = [];
        state.clientsFilterList = [];
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })


      .addCase(fetchAllDraftTags.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDraftTags.fulfilled, (state, action) => {
        state.loading = false;
        state.draftGeozonesTagList = action.payload.draftGeozonesTag;
        state.clientsTagList = action.payload.clientsTag;
        state.sellersTagList = action.payload.sellersTag;
        state.clientsFilterList = action.payload.clientsFilter;
      })
      .addCase(fetchAllDraftTags.rejected, (state, action) => {
        state.draftGeozonesTagList = [];
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      })
  },
});

export const { addNewClientFilter, removeClientFilter } = TagsSlice.actions;
export default TagsSlice.reducer;
