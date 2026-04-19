// quản lý lỗi , có status chuẩn REST API , dễ dàng đồng bộ middleware để xử lý lỗi 
class HandleError extends Error { 
    constructor (message, statusCode) { 
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor); // 
    }
}

export default HandleError;
