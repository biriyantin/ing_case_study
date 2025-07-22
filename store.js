if (typeof process === 'undefined') {
  self.process = {env: {}};
}
import {configureStore, createSlice} from '@reduxjs/toolkit';

const employeesSlice = createSlice({
  name: 'employees',
  initialState: [],
  reducers: {
    setEmployees: (_, action) => action.payload,
    addEmployee: (state, action) => {
      state.push(action.payload);
    },
    updateEmployee: (state, action) =>
      state.map((emp) => (emp.id === action.payload.id ? action.payload : emp)),
  },
});

const persisted = localStorage.getItem('locale');
const localeSlice = createSlice({
  name: 'locale',
  initialState: persisted || 'en', // Default to 'en' if no locale is stored
  reducers: {
    changeLocale: (_, action) => {
      const lang = action.payload;
      localStorage.setItem('locale', lang);
      return lang;
    },
  },
});

const viewModeSlice = createSlice({
  name: 'viewMode',
  initialState: 'list', // 'list' or 'card'
  reducers: {
    setViewMode: (_, action) => action.payload,
  },
});

export const {setEmployees, addEmployee, updateEmployee} =
  employeesSlice.actions;
export const {changeLocale} = localeSlice.actions;
export const {setViewMode} = viewModeSlice.actions;

export const store = configureStore({
  reducer: {
    employees: employeesSlice.reducer,
    locale: localeSlice.reducer,
    viewMode: viewModeSlice.reducer,
  },
});
