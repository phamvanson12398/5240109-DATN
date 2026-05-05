import React from 'react'
import '@/shared/components/styles/Pagination.css'
import { useSelector } from 'react-redux'
function Pagination({
  currentPage,
  onPageChange,
  loading = false
}) {
  const {totalPages, products} = useSelector((state) => state.product)

  if(products.length === 0 || totalPages <= 1) return null;

  // hàm tạo số trang 
  const getPageNumbers=() => {
    const pageNumbers = [];
    const pageWindow = 2;
    for(let i = Math.max(1, currentPage-pageWindow);
            i <= Math.min(totalPages, currentPage+pageWindow);
            i++
    ){
      pageNumbers.push(i)
    }
    return pageNumbers;
  }

  return (
    <div className="flex items-center gap-1.5 justify-center py-4">
        <button 
            disabled={currentPage === 1 || loading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
            <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        
        {getPageNumbers().map(page => (
            <button 
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-[#004ac6] text-white shadow-lg shadow-blue-500/30' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#004ac6] hover:text-[#004ac6]'}`}
            >
                {page}
            </button>
        ))}

        <button 
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
            <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
    </div>
  )
}

export default Pagination