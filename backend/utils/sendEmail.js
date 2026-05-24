import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, htmlContent) => {
    let targetEmail = to;
    let targetSubject = subject;
    let targetHtml = htmlContent;
    let targetText = "";

    if (typeof to === 'object' && to !== null) {
        const options = to;
        targetEmail = options.email;
        targetSubject = options.subject;
        targetHtml = options.html || options.message; // Ưu tiên HTML, nếu không có thì dùng message
        targetText = options.message || "sonpv";
    }

    try {
        
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail',
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // 3. Định nghĩa tùy chọn Email
        const mailOptions = {
            from: `"GÓC SÁCH" <${process.env.SMTP_MAIL}>`,
            to: targetEmail,
            subject: targetSubject,
            text: targetText, // Nội dung text thuần cho các trình đọc mail cũ
            html: targetHtml, // Nội dung HTML chuyên nghiệp
        };

        // 4. Gửi Mail
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`[Email System]: Đã gửi Email thành công tới ${targetEmail}.`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("[Email System Error]: Lỗi khi gửi Email:", error.message);
        // Trả về error thay vì throw để không làm crash luồng chính (như Đăng ký/Quên mật khẩu)
        return { success: false, error: error.message };
    }
};

// Export cả 2 kiểu để tương thích tuyệt đối với toàn bộ codebase hiện tại
export { sendEmail }; 
export default sendEmail;