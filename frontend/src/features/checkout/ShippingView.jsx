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
import NoteAltIcon from '@mui/icons-material/NoteAlt';
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
    const [note, setNote] = useState(shippingInfo?.note || "")
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

    // Lưu tạm quận/xã cần auto-fill.
    // Không set cả 3 cấp cùng lúc vì Quận phụ thuộc Tỉnh, Xã phụ thuộc Quận.
    const pendingAutoFill = useRef(null);

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
                if (!defaultAddr.provinceCode || !defaultAddr.districtCode || !defaultAddr.wardCode) {
                    toast.warning("Địa chỉ mặc định của bạn cần được cập nhật để sử dụng tính năng điền tự động", {
                        position: "top-center",
                        autoClose: false
                    });
                    hasAutoFilled.current = true;
                    return;
                }

                // Điền thông tin cơ bản
                setAddress(defaultAddr.streetAddress || "");
                setPhoneNumber(defaultAddr.phone || "");
                setNote(defaultAddr.note || "");

                // Lưu quận/xã cần fill sau khi options đã load xong
                pendingAutoFill.current = {
                    districtCode: String(defaultAddr.districtCode),
                    wardCode: String(defaultAddr.wardCode),
                };

                // Chỉ set tỉnh trước. Sau khi danh sách quận load xong mới set quận.
                setProvinceCode(String(defaultAddr.provinceCode));

                hasAutoFilled.current = true;
                toast.success("Đã áp dụng địa chỉ mặc định của bạn", {
                    position: "bottom-right",
                    autoClose: 3000
                });
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
                toast.error(err.message || "Không tải được danh sách tỉnh/thành", {
                    position: "top-center"
                });
            }
        };

        fetchProvincesList();
    }, []);

    // 4.1 Xử lý Tỉnh -> Quận
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!provinceCode) {
                setDistrictsList([]);
                setDistrictCode("");
                setWardsList([]);
                setWardCode("");
                return;
            }

            try {
                const data = await getDistrictsByProvince(provinceCode);
                setDistrictsList(data);

                const pendingDistrictCode = pendingAutoFill.current?.districtCode;

                // Nếu đang auto-fill, set district sau khi danh sách quận đã có
                if (pendingDistrictCode) {
                    const isPendingDistrictValid = data.some(
                        d => String(d.code) === String(pendingDistrictCode)
                    );

                    if (isPendingDistrictValid) {
                        setDistrictCode(pendingDistrictCode);
                    } else {
                        setDistrictCode("");
                        setWardsList([]);
                        setWardCode("");
                        pendingAutoFill.current = null;
                    }

                    return;
                }

                // Nếu user đổi tỉnh thủ công, kiểm tra district hiện tại còn hợp lệ không
                if (districtCode) {
                    const isValid = data.some(
                        d => String(d.code) === String(districtCode)
                    );

                    if (!isValid) {
                        setDistrictCode("");
                        setWardsList([]);
                        setWardCode("");
                    }
                }
            } catch {
                toast.error("Không tải được danh sách quận/huyện");
            }
        };

        fetchDistricts();
    }, [provinceCode]);

    // 4.2 Xử lý Quận -> Xã
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

                const pendingWardCode = pendingAutoFill.current?.wardCode;

                // Nếu đang auto-fill, set ward sau khi danh sách xã đã có
                if (pendingWardCode) {
                    const isPendingWardValid = data.some(
                        w => String(w.code) === String(pendingWardCode)
                    );

                    if (isPendingWardValid) {
                        setWardCode(pendingWardCode);
                    } else {
                        setWardCode("");
                    }

                    pendingAutoFill.current = null;
                    return;
                }

                // Nếu user đổi quận thủ công, kiểm tra ward hiện tại còn hợp lệ không
                if (wardCode) {
                    const isValid = data.some(
                        w => String(w.code) === String(wardCode)
                    );

                    if (!isValid) {
                        setWardCode("");
                    }
                }
            } catch {
                toast.error("Không tải được danh sách phường/xã");
            }
        };

        fetchWards();
    }, [districtCode]);

    const handleProvinceChange = (e) => {
        pendingAutoFill.current = null;
        setProvinceCode(e.target.value);
        setDistrictCode("");
        setWardsList([]);
        setWardCode("");
    };

    const handleDistrictChange = (e) => {
        pendingAutoFill.current = null;
        setDistrictCode(e.target.value);
        setWardCode("");
    };

    const handleWardChange = (e) => {
        pendingAutoFill.current = null;
        setWardCode(e.target.value);
    };

    const shippingInfoSubmit = (e) => {
        e.preventDefault();

        if (phoneNumber.length !== 10) {
            toast.error("Số điện thoại phải có 10 chữ số", {
                position: 'top-center'
            });
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
            note,
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
                                        onChange={handleProvinceChange}
                                        required
                                    >
                                        <option value="" disabled>Chọn Tỉnh/Thành</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={String(p.code)}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-district">Quận/Huyện</label>
                                    <select
                                        id="shipping-district"
                                        value={districtCode}
                                        onChange={handleDistrictChange}
                                        disabled={!provinceCode}
                                        required
                                    >
                                        <option value="" disabled>Chọn Quận/Huyện</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={String(d.code)}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shipping-field">
                                    <label htmlFor="shipping-ward">Phường/Xã</label>
                                    <select
                                        id="shipping-ward"
                                        value={wardCode}
                                        onChange={handleWardChange}
                                        disabled={!districtCode}
                                        required
                                    >
                                        <option value="" disabled>Chọn Phường/Xã</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={String(w.code)}>{w.name}</option>
                                        ))}
                                    </select>
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

                                <div className="shipping-field full">
                                    <label htmlFor="shipping-note">Ghi chú</label>
                                    <div className="shipping-input-wrap">
                                        <NoteAltIcon />
                                        <input
                                            id="shipping-note"
                                            placeholder="..."
                                            type="text"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
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
                            <h2>Giao hàng Góc Sách</h2>
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
