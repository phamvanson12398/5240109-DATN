import nodemailer from 'nodemailer';
import { getFrontendBaseUrl } from '../config/runtimeConfig.js';
import sendEmail from '../utils/sendEmail.js';
/**
 * GÓC SÁCH Email Service (v2.0)
 * Chức năng: Gửi Email thông báo trạng thái đơn hàng với Template HTML chuyên nghiệp.
 */

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// Hàm tạo Table sản phẩm cho Email
const generateOrderItemsTable = (orderItems) => {
  let rows = '';
  orderItems.forEach(item => {
    rows += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px; vertical-align: middle;">
          <span>${item.name}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">x${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right;">${item.price.toLocaleString('vi-VN')}₫</td>
      </tr>
    `;
  });
  return rows;
};

// Layout chính của Email (Wrapper)
const emailLayout = (content, order) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .order-summary { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total-row { font-weight: bold; color: #2563eb; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GÓC SÁCH</h1>
        </div>
        <div class="content">
            ${content}
            <table class="order-summary">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: left;">SL</th>
                        <th style="padding: 10px; text-align: right;">Giá</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateOrderItemsTable(order.orderItems)}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Tổng tiền:</td>
                        <td style="padding: 20px 10px 10px; text-align: right;" class="total-row">${order.totalPrice.toLocaleString('vi-VN')}₫</td>
                    </tr>
                </tfoot>
            </table>
            <center>
                <a href="${getFrontendBaseUrl()}/order/${order._id}" class="btn">Xem chi tiết đơn hàng</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2026 GÓC SÁCH - Không gian dành cho những tâm hồn yêu sách</p>
            <p>Địa chỉ: Đà Nẵng, Việt Nam | Hotline: 09xx xxx xxx</p>
        </div>
    </div>
</body>
</html>
`;

// 1. Template Xác nhận đơn hàng
const getConfirmationContent = (order) => `
    <div class="status-badge" style="background-color: #ecfdf5; color: #059669;">Đã xác nhận</div>
    <p>Chào <strong>${order.shippingInfo.name}</strong>,</p>
    <p>Cảm ơn bạn đã tin tưởng GÓC SÁCH! Đơn hàng số <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> của bạn đã được chúng tôi xác nhận.</p>
    <p>Đội ngũ của GÓC SÁCH đang chuẩn bị đóng gói sản phẩm để gửi tới bạn sớm nhất có thể.</p>
`;

// 2. Template Đang giao hàng
const getShippingContent = (order) => `
    <div class="status-badge" style="background-color: #eff6ff; color: #2563eb;">Đang giao hàng</div>
    <p>Tuyệt vời! Đơn hàng <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> đang trên đường tới bạn.</p>
    ${order.trackingNumber ? `<p>Mã vận đơn của bạn: <strong style="color: #2563eb;">${order.trackingNumber}</strong></p>` : ''}
    <p>Bạn vui lòng để ý điện thoại để shipper liên hệ nhé.</p>
`;

// 3. Template Đã giao hàng
const getDeliveredContent = (order) => `
    <div class="status-badge" style="background-color: #ecfdf5; color: #059669;">Giao hàng thành công</div>
    <p>Chào bạn,</p>
    <p>Đơn hàng <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> đã được giao thành công.</p>
    <p>Hy vọng bạn hài lòng với sản phẩm của GÓC SÁCH. Đừng quên để lại đánh giá để nhận xu và giúp chúng tôi cải thiện dịch vụ nhé!</p>
`;

// 4. Template Đã hủy đơn
const getCancelledContent = (order) => `
    <div class="status-badge" style="background-color: #fef2f2; color: #dc2626;">Đơn hàng đã hủy</div>
    <p>Chào bạn,</p>
    <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> đã bị hủy.</p>
    ${order.cancellationReason ? `<p style="color: #6b7280; font-style: italic;">Lý do: ${order.cancellationReason}</p>` : ''}
    <p>Nếu đây là một sự nhầm lẫn, bạn có thể liên hệ với hotline của chúng tôi hoặc thực hiện đặt lại đơn hàng mới.</p>
`;

/**
 * Gửi email thông báo trạng thái
 * @param {Object} order - Dữ liệu đơn hàng
 * @param {String} status - Trạng thái mới
 */
export const sendStatusEmail = async (order, status) => {
  try {
    let subject = '';
    let content = '';

    switch (status) {
      case 'Chờ xử lý':
        subject = `[GÓC SÁCH] Xác nhận đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`;
        content = getConfirmationContent(order);
        break;
      case 'Đang giao':
        subject = `[GÓC SÁCH] Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đang được giao`;
        content = getShippingContent(order);
        break;
      case 'Đã giao':
        subject = `[GÓC SÁCH] Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã giao thành công`;
        content = getDeliveredContent(order);
        break;
      case 'Đã hủy':
        subject = `[GÓC SÁCH] Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã bị hủy`;
        content = getCancelledContent(order);
        break;
      default:
        return;
    }

    const html = emailLayout(content, order);

    // Xác định email nhận thông báo (Ưu tiên User Email -> Shipping Email)
    const recipientEmail = order.user_id?.email || order.shippingInfo?.email;

    if (!recipientEmail) {
      console.warn(`[Email Service Warning]: Không có địa chỉ email để gửi thông báo cho đơn hàng ${order._id}.`);
      return;
    }

    const mailOptions = {
      from: `"GÓC SÁCH" <${process.env.SMTP_MAIL}>`,
      to: recipientEmail,
      subject: subject,
      html: html,
    };

    await sendEmail(recipientEmail,subject,html);
    console.log(`[Email Service]: Đã gửi email thông báo trạng thái "${status}" thành công cho khách hàng.`);
  } catch (error) {
    console.error(`[Email Service Error]: Không thể gửi email cho đơn hàng ${order._id}. Lỗi:`, error);
    // Không ném lỗi ra ngoài để luồng cập nhật đơn hàng không bị gián đoạn
  }
};




