import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "@/shared/api/http.js";
import { formatVND } from "@/shared/utils/formatCurrency";
import "./styles/FlashSalesManagement.css";

const toDateTimeInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const getDefaultCampaignForm = () => ({
  name: "",
  description: "",
  banner: "",
  startAt: toDateTimeInput(Date.now() + 60 * 60 * 1000),
  endAt: toDateTimeInput(Date.now() + 3 * 60 * 60 * 1000),
  isVisible: true,
  priority: 0,
});

const getDefaultItemForm = () => ({
  itemId: "",
  productId: "",
  productName: "",
  salePrice: "",
  saleStock: "",
  perUserLimit: 1,
  sortOrder: 0,
  isActive: true,
});

const getApiMessage = (error, fallback = "Thao tác thất bại") =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const getCampaignStatus = (campaign) => {
  const status = campaign?.computedStatus || campaign?.status || "draft";
  const labels = {
    active: "Đang diễn ra",
    scheduled: "Đã lên lịch",
    ended: "Đã kết thúc",
    draft: "Bản nháp",
    cancelled: "Đã hủy",
  };
  return { key: status, label: labels[status] || status };
};

const calculateStats = (items = []) => {
  const itemCount = items.length;
  const saleStock = items.reduce((sum, item) => sum + Number(item.saleStock || 0), 0);
  const soldCount = items.reduce((sum, item) => sum + Number(item.soldCount || 0), 0);
  const saleRevenue = items.reduce(
    (sum, item) => sum + Number(item.salePrice || 0) * Number(item.soldCount || 0),
    0
  );

  return {
    itemCount,
    saleStock,
    soldCount,
    saleRevenue,
    sellThroughRate: saleStock > 0 ? Math.round((soldCount / saleStock) * 100) : 0,
  };
};

function FlashSalesManagementView() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState(getDefaultCampaignForm);
  const [itemForm, setItemForm] = useState(getDefaultItemForm);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const campaignItems = useMemo(() => selectedCampaign?.items || [], [selectedCampaign]);
  const stats = useMemo(
    () => selectedCampaign?.stats || calculateStats(campaignItems),
    [selectedCampaign, campaignItems]
  );

  const fillCampaignForm = (campaign) => {
    setCampaignForm({
      name: campaign?.name || "",
      description: campaign?.description || "",
      banner: campaign?.banner || "",
      startAt: toDateTimeInput(campaign?.startAt),
      endAt: toDateTimeInput(campaign?.endAt),
      isVisible: campaign?.isVisible !== false,
      priority: Number(campaign?.priority || 0),
    });
  };

  const fetchCampaigns = async (preferredSelectedId = selectedId) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/admin/flash-sales", {
        params: { limit: 50 },
      });
      const nextCampaigns = data.flashSales || [];
      setCampaigns(nextCampaigns);
      if (!preferredSelectedId && nextCampaigns.length > 0) {
        setSelectedId(nextCampaigns[0]._id);
      }
    } catch (error) {
      toast.error(getApiMessage(error, "Không tải được danh sách Flash Sale"));
    } finally {
      setLoading(false);
    }
  };

  const loadCampaign = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/admin/flash-sales/${id}`);
      setSelectedCampaign(data.flashSale || null);
      fillCampaignForm(data.flashSale || null);
    } catch (error) {
      toast.error(getApiMessage(error, "Không tải được chi tiết Flash Sale"));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) loadCampaign(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const refreshSelectedCampaign = async (id = selectedId) => {
    await fetchCampaigns(id);
    if (id) await loadCampaign(id);
  };

  const handleNewCampaign = () => {
    setSelectedId("");
    setSelectedCampaign(null);
    setCampaignForm(getDefaultCampaignForm());
    setItemForm(getDefaultItemForm());
  };

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();

    if (!campaignForm.name.trim()) {
      toast.warning("Vui lòng nhập tên chiến dịch");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...campaignForm,
        name: campaignForm.name.trim(),
        startAt: new Date(campaignForm.startAt).toISOString(),
        endAt: new Date(campaignForm.endAt).toISOString(),
        priority: Number(campaignForm.priority || 0),
      };

      const { data } = selectedId
        ? await axios.put(`/api/v1/admin/flash-sales/${selectedId}`, payload)
        : await axios.post("/api/v1/admin/flash-sales", payload);

      toast.success(selectedId ? "Đã cập nhật chiến dịch" : "Đã tạo chiến dịch");
      const saved = data.flashSale;
      if (saved?._id) {
        setSelectedId(saved._id);
        setSelectedCampaign(saved);
      }
      await refreshSelectedCampaign(saved?._id || selectedId);
    } catch (error) {
      toast.error(getApiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleCampaignAction = async (action) => {
    if (!selectedId) return;

    if (action === "delete" && !window.confirm("Xóa chiến dịch Flash Sale này?")) {
      return;
    }

    setSaving(true);
    try {
      if (action === "delete") {
        await axios.delete(`/api/v1/admin/flash-sales/${selectedId}`);
        toast.success("Đã xóa chiến dịch");
        setSelectedId("");
        setSelectedCampaign(null);
        setCampaignForm(getDefaultCampaignForm());
      } else {
        await axios.post(`/api/v1/admin/flash-sales/${selectedId}/${action}`);
        toast.success(action === "publish" ? "Đã publish chiến dịch" : "Đã hủy chiến dịch");
      }
      await fetchCampaigns();
      if (action !== "delete") await loadCampaign(selectedId);
    } catch (error) {
      toast.error(getApiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleProductSearch = async () => {
    if (!productQuery.trim()) {
      toast.warning("Nhập tên, SKU hoặc danh mục sản phẩm để tìm");
      return;
    }

    setSearching(true);
    try {
      const { data } = await axios.get("/api/v1/admin/products/search", {
        params: { name: productQuery.trim() },
      });
      setProductResults(data.products || []);
    } catch (error) {
      toast.error(getApiMessage(error, "Không tìm được sản phẩm"));
    } finally {
      setSearching(false);
    }
  };

  const handlePickProduct = (product) => {
    setItemForm((prev) => ({
      ...prev,
      productId: product._id,
      productName: product.name,
      salePrice: Math.max(0, Math.floor(Number(product.price || 0) * 0.8)),
      saleStock: Math.max(1, Math.min(Number(product.stock || 1), 20)),
    }));
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();

    if (!selectedId) {
      toast.warning("Vui lòng chọn hoặc tạo chiến dịch trước");
      return;
    }

    if (!itemForm.productId || !itemForm.salePrice || !itemForm.saleStock) {
      toast.warning("Vui lòng nhập sản phẩm, giá sale và số lượng sale");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productId: itemForm.productId,
        salePrice: Number(itemForm.salePrice),
        saleStock: Number(itemForm.saleStock),
        perUserLimit: Number(itemForm.perUserLimit || 1),
        sortOrder: Number(itemForm.sortOrder || 0),
        isActive: Boolean(itemForm.isActive),
      };

      if (itemForm.itemId) {
        await axios.put(`/api/v1/admin/flash-sales/${selectedId}/items/${itemForm.itemId}`, payload);
        toast.success("Đã cập nhật sản phẩm Flash Sale");
      } else {
        await axios.post(`/api/v1/admin/flash-sales/${selectedId}/items`, payload);
        toast.success("Đã thêm sản phẩm vào Flash Sale");
      }

      setItemForm(getDefaultItemForm());
      await refreshSelectedCampaign();
    } catch (error) {
      toast.error(getApiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item) => {
    setItemForm({
      itemId: item._id,
      productId: item.productId,
      productName: item.product?.name || "",
      salePrice: Number(item.salePrice || 0),
      saleStock: Number(item.saleStock || 1),
      perUserLimit: Number(item.perUserLimit || 1),
      sortOrder: Number(item.sortOrder || 0),
      isActive: item.isActive !== false,
    });
  };

  const handleDeleteItem = async (itemId) => {
    if (!selectedId || !window.confirm("Xóa sản phẩm này khỏi Flash Sale?")) return;

    setSaving(true);
    try {
      await axios.delete(`/api/v1/admin/flash-sales/${selectedId}/items/${itemId}`);
      toast.success("Đã xóa sản phẩm khỏi Flash Sale");
      await refreshSelectedCampaign();
    } catch (error) {
      toast.error(getApiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flash-admin-page">
      <div className="flash-admin-header">
        <div>
          <span className="flash-admin-kicker">
            <FlashOnOutlinedIcon />
            Flash Sale
          </span>
          <h1>Quản lý Flash Sale</h1>
          <p>
            Tạo chiến dịch theo thời gian, gắn sản phẩm, giới hạn số lượng và theo dõi doanh thu
            Flash Sale.
          </p>
        </div>
        <button type="button" className="flash-admin-primary" onClick={handleNewCampaign}>
          <AddOutlinedIcon />
          Tạo chiến dịch mới
        </button>
      </div>

      <div className="flash-admin-stats">
        <div>
          <span>Số sản phẩm</span>
          <strong>{stats.itemCount || 0}</strong>
        </div>
        <div>
          <span>Đã bán / Tổng suất</span>
          <strong>
            {stats.soldCount || 0}/{stats.saleStock || 0}
          </strong>
        </div>
        <div>
          <span>Doanh thu Flash Sale</span>
          <strong>{formatVND(stats.saleRevenue || 0)}</strong>
        </div>
        <div>
          <span>Tỷ lệ bán hết</span>
          <strong>{stats.sellThroughRate || 0}%</strong>
        </div>
      </div>

      <div className="flash-admin-layout">
        <aside className="flash-admin-campaigns">
          <div className="flash-admin-section-title">
            <h2>Chiến dịch</h2>
            <span>{campaigns.length} mục</span>
          </div>

          {loading ? (
            <div className="flash-admin-empty">Đang tải chiến dịch...</div>
          ) : campaigns.length === 0 ? (
            <div className="flash-admin-empty">Chưa có chiến dịch Flash Sale.</div>
          ) : (
            <div className="flash-admin-campaign-list">
              {campaigns.map((campaign) => {
                const status = getCampaignStatus(campaign);
                return (
                  <button
                    type="button"
                    key={campaign._id}
                    className={`flash-admin-campaign-card ${selectedId === campaign._id ? "active" : ""}`}
                    onClick={() => setSelectedId(campaign._id)}
                  >
                    <strong>{campaign.name}</strong>
                    <span className={`flash-admin-status ${status.key}`}>{status.label}</span>
                    <small>
                      {new Date(campaign.startAt).toLocaleString("vi-VN")} -{" "}
                      {new Date(campaign.endAt).toLocaleString("vi-VN")}
                    </small>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="flash-admin-main">
          <section className="flash-admin-panel">
            <div className="flash-admin-section-title">
              <h2>{selectedId ? "Cấu hình chiến dịch" : "Tạo chiến dịch mới"}</h2>
              {selectedCampaign && (
                <span className={`flash-admin-status ${getCampaignStatus(selectedCampaign).key}`}>
                  {getCampaignStatus(selectedCampaign).label}
                </span>
              )}
            </div>

            <form className="flash-admin-form" onSubmit={handleCampaignSubmit}>
              <label>
                Tên chiến dịch
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ví dụ: Flash Sale 12.12"
                />
              </label>
              
              <label className="flash-admin-span-2">
                Mô tả
                <textarea
                  value={campaignForm.description}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Mô tả ngắn hiển thị cho khách hàng"
                />
              </label>
              <label>
                Bắt đầu
                <input
                  type="datetime-local"
                  value={campaignForm.startAt}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, startAt: event.target.value }))}
                />
              </label>
              <label>
                Kết thúc
                <input
                  type="datetime-local"
                  value={campaignForm.endAt}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, endAt: event.target.value }))}
                />
              </label>
              <label>
                Ưu tiên
                <input
                  type="number"
                  value={campaignForm.priority}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, priority: event.target.value }))}
                />
              </label>
              <label className="flash-admin-checkbox">
                <input
                  type="checkbox"
                  checked={campaignForm.isVisible}
                  onChange={(event) => setCampaignForm((prev) => ({ ...prev, isVisible: event.target.checked }))}
                />
                Hiển thị cho khách hàng
              </label>

              <div className="flash-admin-actions flash-admin-span-2">
                <button type="submit" className="flash-admin-primary" disabled={saving}>
                  {selectedId ? "Lưu chiến dịch" : "Tạo chiến dịch"}
                </button>
                {selectedId && (
                  <>
                    <button
                      type="button"
                      className="flash-admin-secondary"
                      onClick={() => handleCampaignAction("publish")}
                      disabled={saving || campaignItems.length === 0}
                    >
                      <PublishOutlinedIcon />
                      Publish
                    </button>
                    <button
                      type="button"
                      className="flash-admin-secondary danger"
                      onClick={() => handleCampaignAction("cancel")}
                      disabled={saving}
                    >
                      <CancelOutlinedIcon />
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="flash-admin-icon-danger"
                      onClick={() => handleCampaignAction("delete")}
                      disabled={saving}
                      title="Xóa chiến dịch"
                    >
                      <DeleteOutlineOutlinedIcon />
                    </button>
                  </>
                )}
              </div>
            </form>
          </section>

          <section className="flash-admin-panel">
            <div className="flash-admin-section-title">
              <h2>Sản phẩm trong Flash Sale</h2>
              <span>{detailLoading ? "Đang tải..." : `${campaignItems.length} sản phẩm`}</span>
            </div>

            <div className="flash-admin-product-search">
              <div>
                <SearchOutlinedIcon />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleProductSearch();
                  }}
                  placeholder="Tìm sản phẩm theo tên, SKU hoặc danh mục"
                />
              </div>
              <button type="button" className="flash-admin-secondary" onClick={handleProductSearch} disabled={searching}>
                {searching ? "Đang tìm..." : "Tìm"}
              </button>
            </div>

            {productResults.length > 0 && (
              <div className="flash-admin-product-results">
                {productResults.map((product) => (
                  <button type="button" key={product._id} onClick={() => handlePickProduct(product)}>
                    <img src={product.images?.[0]?.url || "/images/placeholder-product.jpg"} alt={product.name} />
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        Kho {product.stock || 0} · {formatVND(product.price)}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <form className="flash-admin-item-form" onSubmit={handleItemSubmit}>
              <label>
                Sản phẩm
                <input
                  type="text"
                  value={itemForm.productName || itemForm.productId}
                  onChange={(event) =>
                    setItemForm((prev) => ({
                      ...prev,
                      productId: event.target.value,
                      productName: "",
                    }))
                  }
                  placeholder="Chọn từ tìm kiếm hoặc nhập productId"
                />
              </label>
              <label>
                Giá Flash Sale
                <input
                  type="number"
                  min="0"
                  value={itemForm.salePrice}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, salePrice: event.target.value }))}
                />
              </label>
              <label>
                Số lượng sale
                <input
                  type="number"
                  min="1"
                  value={itemForm.saleStock}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, saleStock: event.target.value }))}
                />
              </label>
              <label>
                Giới hạn mỗi user
                <input
                  type="number"
                  min="1"
                  value={itemForm.perUserLimit}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, perUserLimit: event.target.value }))}
                />
              </label>
              <label>
                Thứ tự
                <input
                  type="number"
                  value={itemForm.sortOrder}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
                />
              </label>
              <label className="flash-admin-checkbox">
                <input
                  type="checkbox"
                  checked={itemForm.isActive}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Đang bán
              </label>
              <div className="flash-admin-actions">
                <button type="submit" className="flash-admin-primary" disabled={saving || !selectedId}>
                  <Inventory2OutlinedIcon />
                  {itemForm.itemId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                </button>
                {itemForm.itemId && (
                  <button type="button" className="flash-admin-secondary" onClick={() => setItemForm(getDefaultItemForm())}>
                    Hủy sửa
                  </button>
                )}
              </div>
            </form>

            <div className="flash-admin-table-wrap">
              <table className="flash-admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Suất bán</th>
                    <th>Giới hạn</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="flash-admin-empty-cell">
                        Campaign chưa có sản phẩm. Thêm ít nhất 1 sản phẩm trước khi publish.
                      </td>
                    </tr>
                  ) : (
                    campaignItems.map((item) => {
                      const soldPercent = item.saleStock
                        ? Math.min(100, Math.round((Number(item.soldCount || 0) / Number(item.saleStock || 1)) * 100))
                        : 0;
                      return (
                        <tr key={item._id}>
                          <td>
                            <div className="flash-admin-product-cell">
                              <img src={item.product?.images?.[0]?.url || "/images/placeholder-product.jpg"} alt={item.product?.name || "Product"} />
                              <span>
                                <strong>{item.product?.name || item.productId}</strong>
                                <small>ID: {String(item.productId).slice(-8).toUpperCase()}</small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong className="flash-admin-price">{formatVND(item.salePrice)}</strong>
                            <span className="flash-admin-old-price">{formatVND(item.originalPriceSnapshot)}</span>
                          </td>
                          <td>
                            <div className="flash-admin-progress-meta">
                              <span>
                                Đã bán {item.soldCount || 0}, giữ {item.reservedCount || 0}, còn {item.availableStock || 0}
                              </span>
                              <strong>{soldPercent}%</strong>
                            </div>
                            <div className="flash-admin-progress">
                              <i style={{ width: `${soldPercent}%` }} />
                            </div>
                          </td>
                          <td>{item.perUserLimit || 1}/user</td>
                          <td>
                            <span className={`flash-admin-status ${item.isActive ? "active" : "cancelled"}`}>
                              {item.isActive ? "Đang bán" : "Tạm tắt"}
                            </span>
                          </td>
                          <td>
                            <div className="flash-admin-row-actions">
                              <button type="button" onClick={() => handleEditItem(item)} title="Sửa">
                                <EditOutlinedIcon />
                              </button>
                              <button type="button" className="danger" onClick={() => handleDeleteItem(item._id)} title="Xóa">
                                <DeleteOutlineOutlinedIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default FlashSalesManagementView;
