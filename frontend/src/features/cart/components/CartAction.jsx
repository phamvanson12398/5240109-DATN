
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItemsToCart } from '@/features/cart/cartSlice';
import Loader from '@/shared/components/Loader';

const CartAction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id) {
            // Defaulting to quantity 1, no specific size/color for 1-click add
            dispatch(addItemsToCart({ id, quantity: 1 }))
                .then(() => {
                    navigate('/cart');
                })
                .catch((err) => {
                    console.error("Lỗi khi thêm vào giỏ hàng:", err);
                    navigate('/cart');
                });
        } else {
            navigate('/cart');
        }
    }, [id, dispatch, navigate]);

    return <Loader />;
};

export default CartAction;
