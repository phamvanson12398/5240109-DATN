import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { addItemsToCart, removeErrors, removeItemFromCart, removeMessage } from '@/features/cart/cartSlice';

function CartItem({ item }) {
  const { success, loading, error, message } = useSelector((state) => state.cart);
  const [quantity, setQuantity] = useState(item.quantity);
  const dispatch = useDispatch();

  const increaseQuantity = () => {
    if (item.stock <= quantity) {
      toast.error(`Số lượng không thể vượt quá ${item.stock}`, {
        position: 'top-center',
        autoClose: 3000,
      });
      dispatch(removeErrors());
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuanntity = () => {
    if (quantity <= 1) {
      toast.error('Số lượng sản phẩm không được nhỏ hơn 1', {
        position: 'top-center',
        autoClose: 3000,
      });
      dispatch(removeErrors());
      return;
    }
    setQuantity((prev) => prev - 1);
  };

  const handleUpdate = () => {
    if (loading) return;
    if (quantity !== item.quantity) {
      dispatch(addItemsToCart({ id: item.product, quantity, size: item.size, color: item.color }));
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error?.message || error, { position: 'top-center', autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (success) {
      toast.success(message, { position: 'top-center', autoClose: 3000, toastId: "cart-success" });
      dispatch(removeMessage());
    }
  }, [dispatch, success, message]);

  const handleRemove = () => {
    if (loading) return;
    dispatch(removeItemFromCart({ product: item.product, size: item.size, color: item.color }))
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng', {
      position: 'top-center',
      autoClose: 3000,
    })
  }

  return (
    <div className="cart-item">
      <div className="item-info">
        <img src={item.image} alt={item.name} className='item-iamge' />
        <div className="item-details">
          <h3 className="item-name">{item.name}</h3>
          <p className="item-quantity"><strong>Giá:</strong> {item.price.toFixed(2)}/-</p>
          <p className="item-quantity"><strong>Số lượng:</strong> {item.quantity}</p>
        </div>
      </div>

      <div className="quantity-controls">
        <button className="quantity-button decrease-btn" onClick={decreaseQuanntity} disabled={loading}>-</button>
        <input type="number" value={quantity} className='quantity-input' readOnly min="1" />
        <button className="quantity-button increase-btn" onClick={increaseQuantity} disabled={loading}>+</button>
      </div>

      <div className="item-total">
        <span className="item-total-price">{(item.price * item.quantity).toFixed(2)}</span>
      </div>

      <div className="item-actions">
        <button
          className="update-item-btn"
          onClick={handleUpdate}
          disabled={loading || quantity === item.quantity}
        >
          {loading ? 'Đang cập nhật' : 'Cập nhật'}
        </button>
        <button className="remove-item-btn" disabled={loading} onClick={handleRemove}>Xóa</button>
      </div>
    </div>
  )
}

export default CartItem
