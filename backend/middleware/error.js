import HandleError from "../utils/handleError.js";

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "May chu gap su co, vui long thu lai sau";

    if (err.name === "CastError") {
        const message = `Khong tim thay: ${err.path}`;
        err = new HandleError(message, 404);
    }

    if (err.code === 11000) {
        const message = `${Object.keys(err.keyValue)} da ton tai, vui long dang nhap`;
        err = new HandleError(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        statusCode: err.statusCode
    });
};
