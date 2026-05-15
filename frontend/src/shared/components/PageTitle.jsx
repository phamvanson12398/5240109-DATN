// /**
//  * 1. FILE NÀY LÀ GÌ: 
//  *    Đây là Thành Phần Quản Lý Tiêu Đề Trang (Dynamic Page Title Manager).
//  * 

import React, {useEffect}from 'react'

function PageTitle({title}) {
    useEffect(() => {
        document.title = title
    }
    , [title])
    return (
    <>
    </>
    )
}

export default PageTitle