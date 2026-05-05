import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Home from '@/pages/public/Home.jsx'
import ProductDetails from '@/pages/public/ProductDetails.jsx'
import Products from '@/pages/public/Products.jsx'
import Register from '@/pages/auth/Register'
import Login from '@/pages/auth/Login'
import LoginSuccess from '@/pages/auth/LoginSuccess'
import Profile from '@/pages/user/Profile'


function App() {
  const { isAuthenticated, user } = useSelector(state => state.user)
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(loaderUser());
    }
  }, [dispatch, isAuthenticated]);

  // Đồng bộ giỏ hàng theo User ID
  useEffect(() => {
    const userId = user ? user._id : null;
    dispatch(syncCartWithUser(userId));
    if (userId) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/success" element={<LoginSuccess />} />

        
      </Routes>

      {isAuthenticated && <UserDashboard user={user} />}
      <AIChatBubble />
    </Router>
  )
}

export default App