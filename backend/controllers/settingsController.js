import Settings from '../models/settingsModel.js';
import handleAsyncError from '../middleware/handleAsyncError.js';
import HandleError from '../utils/handleError.js';


export const getSettings = handleAsyncError(async (req, res, next) => {
    // findOne() - Tìm 1 document duy nhất
    let settings = await Settings.findOne();

    // Nếu chưa có settings → tạo mới
    if (!settings) {
        settings = await Settings.create({
           
        
            adminName: req.user.name,
            email: req.user.email,
            companyName: 'Sách Ơi', // Default company name
            address: 'Chưa cập nhật', // Placeholder address
            notifications: {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    }

    res.status(200).json({
        success: true,
        settings
    });
});


export const updateSettings = handleAsyncError(async (req, res, next) => {
    // Destructure data từ request body
    const { adminName, email, companyName, address, notifications } = req.body;

    // validate
    if (!adminName || !email || !companyName || !address) {
        return next(new HandleError('Vui lòng điền đầy đủ thông tin', 400));
    }

    // ========== FIND EXISTING SETTINGS ==========
    let settings = await Settings.findOne();

    if (!settings) {
      
        settings = await Settings.create({
            adminName,
            email,
            companyName,
            address,
            notifications: notifications || {
                newOrders: true,
                lowStock: true,
                newUsers: true,
                newReviews: true
            }
        });
    } else {
       
        settings.adminName = adminName;
        settings.email = email;
        settings.companyName = companyName;
        settings.address = address;

      
        settings.notifications = notifications || settings.notifications;

        
        await settings.save();
    }

   
    res.status(200).json({
        success: true,
        message: 'Cập nhật cài đặt thành công',
        settings 
    });
});
