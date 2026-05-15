
import React, { useEffect, useState } from 'react'
import '@/features/checkout/styles/OrderConfirm.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import { useSelector, useDispatch } from 'react-redux' // Thêm useDispatch
import CheckoutPath from '@/features/checkout/components/CheckoutPath'
import { useNavigate } from 'react-router-dom'
import { createOrder, removeSuccess } from '@/features/orders/orderSlice' // Import createOrder thunk và removeSuccess
import OrderSuccessPopup from '@/features/checkout/OrderSuccessView' // Import popup component
import { toast } from 'react-toastify' // Import toast
import { removeOrderedItems, revalidateCart } from '@/features/cart/cartSlice'
import { formatVND } from '@/shared/utils/formatCurrency'
import axios from '@/shared/api/http.js'


function OrderConfirm() {
  const dispatch = useDispatch() // Thêm dispatch hook
  const { shippingInfo, cartItems: globalCartItems = [] } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.user)

  // Kiểm tra sản phẩm mua ngay
  let cartItems = globalCartItems;
  const directBuyItem = sessionStorage.getItem("directBuyItem");
  const selectedOrderItems = sessionStorage.getItem("selectedOrderItems");

  if (directBuyItem) {
    cartItems = [JSON.parse(directBuyItem)];
  } else if (selectedOrderItems) {
    cartItems = JSON.parse(selectedOrderItems);
  }

  // State để điều khiển popup thông báo thành công
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState(null)

  // ✅ trạng thái phương thức thanh toán (mặc định là COD)
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('paymentMethod') || '"COD"')
    } catch {
      return 'COD'
    }
  })


  useEffect(() => {
    sessionStorage.setItem('paymentMethod', JSON.stringify(paymentMethod))
  }, [paymentMethod])

  const fullAddress = [
     shippingInfo?.address,
    shippingInfo?.wardName,
    shippingInfo?.districtName,
    shippingInfo?.provinceName,
  ]
    .filter(Boolean)
    .join(', ')

  // Tính tổng tiền dựa trên các mục giỏ hàng ĐANG HOẠT ĐỘNG (hoặc giỏ hàng chung hoặc mua ngay)
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0
  )
  const tax = subtotal * 0.1
  const shippingCharges = subtotal >= 500000 ? 0 : 30000

  // Đọc thông tin voucher từ sessionStorage
  const appliedVoucher = JSON.parse(sessionStorage.getItem("appliedVoucher") || "null")
  const discountAmount = appliedVoucher ? Number(appliedVoucher.discountAmount || 0) : 0
  const voucherCode = appliedVoucher ? appliedVoucher.voucherCode : ""

  const total = Math.max(0, subtotal + tax + shippingCharges - discountAmount)

  const navigate = useNavigate()

  /**
   * Xử lý đặt hàng (Place Order)
   * Luồng xử lý (Flow):
   * 1. Kiểm tra giỏ hàng (Validation).
   * 2. Ánh xạ dữ liệu shipping sang cấu trúc Backend (Mapping data).
   * 3. Gọi API tạo đơn hàng nguyên bản (createOrder).
   * 4. Phân nhánh theo phương thức thanh toán:
   *    - VNPAY: Tạo link thanh toán -> Redirect sang VNPay (KHÔNG xóa giỏ hàng tại đây).
   *    - COD: Hiển thị Popup thành công -> Xóa giỏ hàng (removeOrderedItems).
   * 
   * Tại sao không xóa giỏ hàng ngay khi bắt đầu thanh toán VNPay?
   * - Để bảo toàn sản phẩm nếu người dùng lỡ tay nhấn "Hủy" hoặc lỗi mạng khi đang ở trang VNPay.
   * - Giỏ hàng chỉ được dọn dẹp tại trang VnpayResult.jsx sau khi có xác nhận '00' (Thành công).
   */
  const proceesToPayment = async () => {
    // Validation: Đảm bảo có hàng mới cho đặt
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống!', { position: 'top-center' })
      return
    }

    // Mapping: Chuẩn hóa dữ liệu địa chỉ cho Backend Model
    let checkoutItems = cartItems;
    if (!directBuyItem && !selectedOrderItems) {
      try {
        checkoutItems = await dispatch(revalidateCart()).unwrap();
      } catch (error) {
        const message = error?.message || error?.errors?.[0]?.message || "Gio hang can duoc cap nhat truoc khi dat hang";
        toast.error(message, { position: 'top-center', autoClose: 3000 });
        return;
      }
    }

    const mappedShippingInfo = {
      fullName: user?.name || "",
      phone: String(shippingInfo.phoneNumber || shippingInfo.phoneNo || ""),
      province: shippingInfo.provinceName || "",
      district: shippingInfo.districtName || "",
      ward: shippingInfo.wardName || "",
      streetAddress: shippingInfo.address || "",
      provinceCode: shippingInfo.provinceCode || "",
      districtCode: shippingInfo.districtCode || "",
      wardCode: shippingInfo.wardCode || "",
    }

    // Prepare Order Data
    const orderData = {
      shippingInfo: mappedShippingInfo,
      orderItems: Array.isArray(checkoutItems) ? checkoutItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || item.images?.[0]?.url || item.images?.[0],
        size: item.size,
        color: item.color,
        pricingType: item.pricingType,
        flashSaleId: item.flashSaleId,
        flashSaleItemId: item.flashSaleItemId,
        product_id: item.product_id || item.product, // Support both new (product_id) and old (product) field
        product: item.product_id || item.product     // Keep for backward compat
      })) : [],
      paymentInfo: {
        method: paymentMethod,
        status: "PENDING"
      },
      paymentMethod,
      itemPrice: Number(subtotal),
      taxPrice: Number(tax),
      shippingPrice: Number(shippingCharges),
      discountAmount: Number(discountAmount),
      totalPrice: Number(total)
    }

    if (appliedVoucher?.voucher_id) {
      orderData.voucherCode = voucherCode
      orderData.voucher_id = appliedVoucher.voucher_id
      orderData.voucherType = appliedVoucher.voucherType
      orderData.voucherValue = Number(appliedVoucher.voucherValue || 0)
    }

    try {
      // BƯỚC 1: Tạo đơn hàng trong Database trước
      const result = await dispatch(createOrder(orderData)).unwrap()
      const orderId = result.order._id;

      // BƯỚC 2: Xử lý theo phương thức thanh toán
      if (paymentMethod === 'VNPAY') {
        /**
         * LUỒNG VNPAY:
         * Gọi backend tạo URL thanh toán. 
         * Sau đó Redirect người dùng rời khỏi website sang cổng VNPay.
         */
        const { data } = await axios.post("/api/v1/payment/vnpay/create", {
          amount: total,
          orderId: orderId,
          orderDescription: `Thanh toan don hang ${orderId}`
        });

        if (data.success && data.paymentUrl) {
          // Lưu danh sách sản phẩm đang đặt vào sessionStorage để xóa sau khi thanh toán thành công
          // Tránh việc xóa nhầm các sản phẩm khác vẫn còn trong giỏ hàng
          sessionStorage.setItem('vnpayOrderedItems', JSON.stringify(checkoutItems));
          
          window.location.href = data.paymentUrl;
          return; // Kết thúc tại đây, logic xóa giỏ sẽ nằm ở trang Result
        } else {
          toast.error("Lỗi khi tạo liên kết thanh toán VNPay");
          return;
        }
      }

      /**
       * LUỒNG COD (Thanh toán khi nhận hàng):
       * Lưu thông tin vào session, hiển thị popup và dọn dẹp giỏ hàng ngay lập tức.
       */
      const data = {
        subtotal: result.order.itemsPrice,
        shippingCharges: result.order.shippingPrice,
        tax: result.order.taxPrice,
        total: result.order.totalPrice
      }
      sessionStorage.setItem('orderInfo', JSON.stringify(data))
      sessionStorage.setItem('paymentMethod', JSON.stringify(paymentMethod))

      setCreatedOrderId(result.order._id)
      setShowSuccessPopup(true)
      sessionStorage.removeItem("directBuyItem"); 
      sessionStorage.removeItem("selectedOrderItems"); 
      sessionStorage.removeItem("appliedVoucher"); 

      // Xóa sản phẩm khỏi Redux Store và LocalStorage
      dispatch(removeOrderedItems(checkoutItems));

      toast.success('Đặt hàng thành công!', {
        position: 'top-center',
        autoClose: 2000
      })
    } catch (error) {
      console.error('Create order error:', error);
      const message = error.response?.data?.message || (typeof error === 'string' ? error : (error.message || "Đã có lỗi xảy ra"));
      toast.error(`Lỗi: ${message}`, {
        position: 'top-center',
        autoClose: 3000
      })
    }
  }


  const getItemImage = (item) =>
    item?.image ||
    item?.images?.[0]?.url ||
    item?.images?.[0] ||
    item?.thumbnail ||
    ''

  return (
    <>
      <PageTitle title="Xác nhận đơn hàng" />
      <Navbar />

      <div className="relative flex min-h-screen flex-col bg-background-light font-display">
        {/* Main Content */}
        <main className="mx-auto w-full max-w-7xl flex-grow px-6 pb-12 pt-28 md:pt-32">
          {/* Progress Tracker / Breadcrumbs */}
          <nav className="mb-12 flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/cart')}
              className="font-medium text-slate-500 hover:text-slate-800"
            >
              Giỏ hàng
            </button>
            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
            <span className="font-bold text-slate-900">Xác nhận thanh toán</span>
            <span className="material-symbols-outlined text-sm text-slate-300">chevron_right</span>
            <span className="font-medium text-slate-400">Hoàn tất</span>
          </nav>

          <div className="mb-10">
            <h2 className="font-serif text-5xl font-bold italic tracking-tight text-slate-900">Xác nhận đơn hàng</h2>
            <p className="mt-4 text-lg font-light text-slate-500">Kiểm tra thông tin đơn hàng của bạn trước khi chúng tôi bắt đầu đóng gói.</p>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            {/* Left Column */}
            <div className="lg:col-span-8">
              {/* Customer Information */}
              <section className="mb-16">
                <h3 className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 font-serif text-2xl font-semibold text-slate-900">
                  <span className="material-symbols-outlined text-[#702e36]">person</span>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Họ và tên</p>
                    <p className="text-lg font-medium">{user?.name || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Số điện thoại</p>
                    <p className="text-lg font-medium">{shippingInfo?.phoneNumber || shippingInfo?.phoneNo || '—'}</p>
                  </div>
                  <div className="col-span-full space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Địa chỉ nhận hàng</p>
                    <p className="text-lg font-medium leading-relaxed">{fullAddress || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section>
                <h3 className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 font-serif text-2xl font-semibold text-slate-900">
                  <span className="material-symbols-outlined text-[#702e36]">inventory_2</span>
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-8">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.product_id || item.product || item._id || item.name} className="flex items-center gap-6">
                        <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                          <img
                            alt={item.name}
                            className="h-full w-full object-cover"
                            src={getItemImage(item)}
                          />
                        </div>
                        <div className="flex flex-grow flex-col justify-between py-2">
                          <div>
                            <h4 className="text-lg font-bold uppercase tracking-tight text-slate-900">{item.name}</h4>
                            <p className="mt-1 text-sm text-slate-500 italic">Bộ sưu tập cao cấp</p>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <p className="font-bold text-[#702e36] text-lg">{formatVND(item.price)}</p>
                              {(item.size || item.color) && (
                                <div className="flex gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  {item.size && <span>Kích cỡ: <span className="text-slate-900">{item.size}</span></span>}
                                  {item.color && <span>Màu: <span className="text-slate-900">{item.color}</span></span>}
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium">Số lượng: <span className="text-lg font-bold">0{item.quantity}</span></p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">Không có sản phẩm trong đơn hàng.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-8">
                {/* Payment Method */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="mb-6 font-serif text-xl font-bold italic text-slate-900">Phương thức thanh toán</h3>
                  
                  {/* Option COD */}
                  <div 
                    className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all mb-4 ${paymentMethod === 'COD' ? 'border-[#702e36] bg-[#702e36]/5' : 'border-slate-100 hover:border-slate-200'}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${paymentMethod === 'COD' ? 'bg-[#702e36] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs text-slate-500">Thanh toán bằng tiền mặt khi giao hàng</p>
                    </div>
                    {paymentMethod === 'COD' && <span className="material-symbols-outlined ml-auto text-[#702e36]">check_circle</span>}
                  </div>

                  {/* Option VNPAY */}
                  <div 
                    className={`flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-[#005ba1] bg-[#005ba1]/5' : 'border-slate-100 hover:border-slate-200'}`}
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${paymentMethod === 'VNPAY' ? 'bg-[#005ba1] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined">credit_card</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Thanh toán qua VNPay</p>
                      <p className="text-xs text-slate-500">Thanh toán qua ứng dụng ngân hàng, QR Code</p>
                    </div>
                    {paymentMethod === 'VNPAY' && <span className="material-symbols-outlined ml-auto text-[#005ba1]">check_circle</span>}
                  </div>
                </div>


                {/* Order Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="mb-6 font-serif text-xl font-bold italic text-slate-900">Tóm tắt đơn hàng</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính</span>
                      <span className="font-medium text-slate-900">{formatVND(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Phí vận chuyển</span>
                      <span className={`font-medium ${shippingCharges === 0 ? 'text-green-600' : 'text-slate-900'}`}>
                        {shippingCharges === 0 ? 'Miễn phí' : formatVND(shippingCharges)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thuế VAT (10%)</span>
                      <span className="font-medium text-slate-900">{formatVND(tax)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[#ff5a5f] font-medium bg-[#ff5a5f]/5 p-2 rounded-lg border border-[#ff5a5f]/10">
                        <span>Giảm giá {voucherCode && `(${voucherCode})`}</span>
                        <span>-{formatVND(discountAmount)}</span>
                      </div>
                    )}

                    <div className="my-4 border-t border-dashed border-slate-200 pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="font-bold uppercase tracking-wide text-slate-900">Tổng cộng</span>
                        <span className="text-3xl font-black text-slate-900">{formatVND(total)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={proceesToPayment}
                    disabled={cartItems.length === 0}
                    className={`${paymentMethod === 'VNPAY' ? 'bg-[#005ba1]' : 'coral-gradient'} mt-8 w-full rounded-full py-4 text-center font-bold uppercase tracking-widest text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Xác nhận đặt hàng'}
                  </button>

                  <p className="mt-4 text-center text-[10px] uppercase tracking-tighter text-slate-400">
                    Bằng cách nhấn nút, bạn đồng ý với các điều khoản của Sách Ơi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Success Popup */}
      {showSuccessPopup && (
        <OrderSuccessPopup
          orderId={createdOrderId}
          onClose={() => {
            setShowSuccessPopup(false)
            dispatch(removeSuccess()) // Dọn dẹp state success trước khi chuyển trang
            navigate('/orders/user')
          }}
        />
      )}
    </>
  );
}

export default OrderConfirm
