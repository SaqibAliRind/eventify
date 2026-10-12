import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  status: 'uninitialized',
  todos: [],
  error: null,
}

const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  // Just make the async request here, and return the response.
  // This will automatically dispatch a `pending` action first,
  // and then `fulfilled` or `rejected` actions based on the promise.
  // as needed based on the
  const res = await axios.get('/todos')
  return res.data
})

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // any additional "normal" case reducers here.
    // these will generate new action creators
  },
  extraReducers: (builder) => {
    // Use `extraReducers` to handle actions that were generated
    // _outside_ of the slice, such as thunks or in other slices
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      // Pass the generated action creators to `.addCase()`
      .addCase(fetchTodos.fulfilled, (state, action) => {
        // Same "mutating" update syntax thanks to Immer
        state.status = 'succeeded'
        state.todos = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed'
        state.todos = []
        state.error = action.error
      })
  },
})

export default todosSlice.reducer