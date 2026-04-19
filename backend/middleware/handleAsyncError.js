import HandleError from "../utils/handleError.js"; // Đảm bảo import để mentor biết nó liên kết với handleError
export default(myErrorFun) => (req, res, next) =>  {
    Promise.resolve(myErrorFun(req, res, next)).catch(next);
    
}