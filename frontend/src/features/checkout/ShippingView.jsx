import React, { useEffect, useState, useRef } from 'react'
import '@/features/checkout/styles/Shipping.css'
import PageTitle from '@/shared/components/PageTitle'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import CheckoutPath from '@/features/checkout/components/CheckoutPath'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { saveShippingInfo } from '@/features/cart/cartSlice'
import { useNavigate } from 'react-router-dom'
import { getProvinces, getDistrictsByProvince, getWardsByDistrict } from '@/shared/api/apiAddress'
import { fetchAddresses } from '@/features/address/addressSlice'

function Shipping() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Kết nối Selectors
    const { shippingInfo } = useSelector(state => state.cart)
    const { isAuthenticated } = useSelector(state => state.user)
    const { addresses } = useSelector(state => state.address)

    // State cho Form
    const [address, setAddress] = useState(shippingInfo?.address || "")
    const [pinCode, setPinCode] = useState(shippingInfo?.pinCode || "")
    const [phoneNumber, setPhoneNumber] = useState(shippingInfo?.phoneNumber || "")

    // State cho Cascading Dropdowns
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistrictsList] = useState([]);
    const [wards, setWardsList] = useState([]);

    const [provinceCode, setProvinceCode] = useState(shippingInfo?.provinceCode || "");
    const [districtCode, setDistrictCode] = useState(shippingInfo?.districtCode || "");
    const [wardCode, setWardCode] = useState(shippingInfo?.wardCode || "");

    // Ref để kiểm soát việc Auto-fill chỉ diễn ra một lần
    const hasAutoFilled = useRef(false);

    // 2. Fetch danh sách địa chỉ của người dùng khi mount
    useEffect(() => {
        if (isAuthenticated && addresses.length === 0) {
            dispatch(fetchAddresses());
        }
    }, [isAuthenticated, dispatch, addresses.length]);

    // 3. Logic Auto-fill địa chỉ mặc định
    useEffect(() => {
        if (isAuthenticated && addresses.length > 0 && !hasAutoFilled.current && !address && !phoneNumber) {
            const defaultAddr = addresses.find(addr => addr.isDefault);
            if (defaultAddr) {
                // Kiểm tra xem địa chỉ này có đầy đủ mã code không (Dành cho dữ liệu cũ)
                if (!defaultAddr.provinceCode) {
                    toast.warning("Địa chỉ mặc định của bạn cần được cập nhật để sử dụng tính năng điền tự động", {
                        position: "top-center",
                        autoClose: false
                    });
                    hasAutoFilled.current = true; // Không scan lại nữa
                    return;
                }

                // Điền thông tin cơ bản
                setAddress(defaultAddr.streetAddress || "");
                setPhoneNumber(defaultAddr.phone || "");
                setPinCode(defaultAddr.zipCode || "");
                
                // Điền thông tin địa chính (Mã code)
                setProvinceCode(String(defaultAddr.provinceCode));
                setDistrictCode(String(defaultAddr.districtCode));
                setWardCode(String(defaultAddr.wardCode));

                hasAutoFilled.current = true;
                toast.success("Đã áp dụng địa chỉ mặc định của bạn", { position: "bottom-right", autoClose: 3000 });
            }
        }
    }, [isAuthenticated, addresses, address, phoneNumber]);

    // Lấy danh sách tỉnh/thành
    useEffect(() => {
        const fetchProvincesList = async () => {
            try {
                const data = await getProvinces();
                setProvinces(data);
            } catch (err) {
                toast.error(err.message || "Không tải được danh sách tỉnh/thành", { position: "top-center" });
            }
        };
        fetchProvincesList();
    }, []);

    // 4.1 Xứ lý Tỉnh -> Quận: Cascading Dropdown thông minh
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!provinceCode) {
                setDistrictsList([]);
                setDistrictCode("");
                setWardCode("");
                return;
            }

            try {
                const data = await getDistrictsByProvince(provinceCode);
                setDistrictsList(data);
                
                // ANTI-RESET LOGIC:
                // Nếu districtCode hiện tại KHÔNG nằm trong danh sách Tỉnh mới -> Reset
                // Nếu đang auto-fill (districtCode có sẵn và nằm trong data mới) -> Giữ nguyên
                const isValid = data.find(d => String(d.code) === String(districtCode));
                if (!isValid) {
                    setDistrictCode("");
                    setWardsList([]);
                    setWardCode("");
                }
            } catch {
                toast.error("Không tải được danh sách quận/huyện");
            }
        };
        fetchDistricts();
    }, [provinceCode, districtCode]);

    // 4.2 Xử lý Quận -> Xã: Cascading Dropdown thông minh
    useEffect(() => {
        const fetchWards = async () => {
            if (!districtCode) {
                setWardsList([]);
                setWardCode("");
                return;
            }

            try {
                const data = await getWardsByDistrict(districtCode);
                setWardsList(data);

                // ANTI-RESET LOGIC: Tương tự như phần Tỉnh -> Quận
                const isValid = data.find(w => String(w.code) === String(wardCode));
                if (!isValid) {
                    setWardCode("");
                }
            } catch {
                toast.error("Không tải được danh sách phường/xã");
            }
        };
        fetchWards();
    }, [districtCode, wardCode]);

    const shippingInfoSubmit = (e) => {
        e.preventDefault();
        if (phoneNumber.length !== 10) {
            toast.error("Số điện thoại phải có 10 chữ số", { position: 'top-center' });
            return;
        }
        if (!address || !provinceCode || !districtCode || !wardCode) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
            return;
        }

        const provinceName = provinces.find(p => String(p.code) === String(provinceCode))?.name || "";
        const districtName = districts.find(d => String(d.code) === String(districtCode))?.name || "";
        const wardName = wards.find(w => String(w.code) === String(wardCode))?.name || "";

        dispatch(saveShippingInfo({
            address,
            pinCode,
            phoneNumber,
            country: "VN",
            provinceCode,
            districtCode,
            wardCode,
            provinceName,
            districtName,
            wardName,
        }));

        navigate('/order/confirm')
    }

    return (
        <>
            <PageTitle title="Thông tin giao hàng" />
            <Navbar />

            <main className="shipping-page">
                <CheckoutPath activePath={0} />
                <div className="shipping-container">
                    <section className="shipping-header">
                        <h1>Thông tin giao hàng</h1>
                        <p>
                            Điền địa chỉ nhận hàng chính xác để đơn hàng được xử lý nhanh và giao đến đúng nơi.
                        </p>
                    </section>

                    <div className="shipping-layout">
                        <section className="shipping-card">
                            <div className="shipping-card-header">
                                <div className="shipping-card-icon">
                                    <LocalShippingOutlinedIcon />
                                </div>
                                <div>
                                    <h2>Địa chỉ nhận hàng</h2>
                                    <p>Thông tin này sẽ được dùng ở bước xác nhận đơn.</p>
                                </div>
                            </div>

                            <form className="shipping-form" onSubmit={shippingInfoSubmit}>
                                <div className="shipping-field full">
                                    <label htmlFor="shipping-address">Địa chỉ chi tiết</label>
                                    <div className="shipping-input-wrap">
                                        <HomeOutlinedIcon />
                                        <input
                                            id="shipping-address"
                                            placeholder="Số nhà, tên đường..."
                                            type="text"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-province">Tỉnh/Thành</label>
                                    <select
                                        id="shipping-province"
                                        value={provinceCode}
                                        onChange={(e) => setProvinceCode(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-district">Quận/Huyện</label>
                                    <select
                                        id="shipping-district"
                                        value={districtCode}
                                        onChange={(e) => setDistrictCode(e.target.value)}
                                        disabled={!provinceCode}
                                        required
                                    >
                                        <option value="" disabled>Chọn Quận/Huyện</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-ward">Phường/Xã</label>
                                    <select
                                        id="shipping-ward"
                                        value={wardCode}
                                        onChange={(e) => setWardCode(e.target.value)}
                                        disabled={!districtCode}
                                        required
                                    >
                                        <option value="" disabled>Chọn Phường/Xã</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.code}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-pin">Mã bưu điện</label>
                                    <input
                                        id="shipping-pin"
                                        placeholder="Ví dụ: 70000"
                                        type="text"
                                        inputMode="numeric"
                                        value={pinCode}
                                        onChange={(e) => setPinCode(e.target.value)}
                                    />
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-phone">Số điện thoại</label>
                                    <div className="shipping-input-wrap">
                                        <PhoneOutlinedIcon />
                                        <input
                                            id="shipping-phone"
                                            placeholder="090 XXX XXXX"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="shipping-actions">
                                    <button className="shipping-submit-button" type="submit">
                                        Tiếp tục thanh toán
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/cart')}
                                        className="shipping-back-button"
                                    >
                                        <ArrowBackIosNewIcon />
                                        Quay lại giỏ hàng
                                    </button>
                                </div>
                            </form>
                        </section>

                        <aside className="shipping-support-card">
                            <h2>Giao hàng </h2>
                            <div className="shipping-support-list">
                                <div className="shipping-support-item">
                                    <CheckCircleOutlineIcon />
                                    <div>
                                        <strong>Địa chỉ được lưu bảo mật</strong>
                                        <span>Dùng lại nhanh hơn cho lần mua sau.</span>
                                    </div>
                                </div>
                                <div className="shipping-support-item">
                                    <LocalShippingOutlinedIcon />
                                    <div>
                                        <strong>Miễn phí vận chuyển</strong>
                                        <span>Áp dụng cho đơn hàng từ 500.000đ.</span>
                                    </div>
                                </div>
                                <div className="shipping-support-item">
                                    <LockOutlinedIcon />
                                    <div>
                                        <strong>Thanh toán an toàn</strong>
                                        <span>Thông tin chỉ dùng để xử lý đơn hàng.</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Shipping;
