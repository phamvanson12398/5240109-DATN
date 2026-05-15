
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '@/shared/api/http.js'

const getErrorPayload = (error, fallbackMessage) => ({
    message: error.response?.data?.message || fallbackMessage,
    statusCode: error.response?.status || 500
})

const persistAuthState = (user, isAuthenticated, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated))
    if (token) {
        localStorage.setItem('token', token)
    }
}

const clearAuthState = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token')
}

export const register = createAsyncThunk('user/register', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/register', userData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang ky khong thanh cong'))
    }
})

export const login = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/login', { email, password }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang nhap khong thanh cong'))
    }
})

export const logout = createAsyncThunk('user/logout', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/logout')
        return data
    } catch (error) {
        console.log('API error:', error.response || error)
        return rejectWithValue(getErrorPayload(error, 'Dang xuat that bai'))
    }
})

export const loaderUser = createAsyncThunk('user/loadUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/v1/profile')
        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Khong the tai du lieu nguoi dung'))
    }
})

export const updateProfile = createAsyncThunk('user/updateProfile', async (userData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/api/v1/profile/update', userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Cap nhat ho so that bai'))
    }
})

export const updatePassword = createAsyncThunk('user/updatePassword', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/api/v1/password/update', formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Cap nhat mat khau that bai'))
    }
})

export const forgotPassword = createAsyncThunk('user/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/v1/password/forgot', email, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return data
    } catch (error) {
        return rejectWithValue(getErrorPayload(error, 'Gui email that bai'))
    }
})

export const resetPassword = createAsyncThunk(
    'user/resetPassword',
    async ({ token, userData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`/api/v1/reset/${token}`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            return data
        } catch (error) {
            return rejectWithValue(getErrorPayload(error, 'Cap nhat mat khau that bai'))
        }
    }
)

const initialState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    loading: false,
    error: null,
    success: false,
    isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
    message: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        removeErrors: (state) => {
            state.error = null
        },
        removeSuccess: (state) => {
            state.success = false
        },
        removeMessage: (state) => {
            state.message = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated, action.payload?.token)
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang ky khong thanh cong'
                state.user = null
                state.isAuthenticated = false
            })

            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated, action.payload?.token)
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang nhap khong thanh cong'
                state.user = null
                state.isAuthenticated = false
            })

            .addCase(loaderUser.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loaderUser.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.user = action.payload?.user || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated)
            })
            .addCase(loaderUser.rejected, (state, action) => {
                state.loading = false
                const isUnauthorized = action.payload?.statusCode === 401
                state.error = isUnauthorized ? null : action.payload?.message || 'Khong the tai du lieu nguoi dung'
                state.user = null
                state.isAuthenticated = false

                if (isUnauthorized) {
                    clearAuthState()
                }
            })

            .addCase(logout.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false
                state.error = null
                state.user = null
                state.isAuthenticated = false
                clearAuthState()
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Dang xuat that bai'
            })

            .addCase(updateProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.user = action.payload?.user || null
                state.success = action.payload?.success || false
                state.message = action.payload?.message || null
                state.isAuthenticated = Boolean(action.payload?.user)
                persistAuthState(state.user, state.isAuthenticated)
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat ho so that bai'
            })

            .addCase(updatePassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
            })
            .addCase(updatePassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat mat khau that bai'
            })

            .addCase(forgotPassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.message = action.payload?.message || null
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Gui email that bai'
            })

            .addCase(resetPassword.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false
                state.error = null
                state.success = action.payload?.success || false
                state.user = null
                state.isAuthenticated = false
                clearAuthState()
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Cap nhat mat khau that bai'
            })
    }
})

export const { removeErrors, removeSuccess, removeMessage } = userSlice.actions
export default userSlice.reducer
