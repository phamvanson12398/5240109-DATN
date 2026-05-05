import React, { useState } from 'react'
import '@/shared/components/styles/Rating.css'

function Rating({value,onRatingChange, disabled }) {
    
    const [hoveredRating, setHoveredRating] = useState(0)

    const [selectedRating, setSelectedRating] = useState(value || 0) 
    
    {/*xử lý di chuột vào một ngôi sao */}

    const handleMouseEnter = (rating) => {
        if(!disabled) {
            setHoveredRating(rating)
        }
    }

    // ko hover
    const handleMouseLeave=() => {
        if(!disabled) {
            setHoveredRating(0)
        }
    }

    // xử lý nhấn chuột 
    const handleClick  = (rating) => {
        if(!disabled) {
            setSelectedRating(rating)
            if(onRatingChange)  {
                onRatingChange(rating) 
            }
        }
    }
    // Tạo các sao đánh giá dựa trên các lượt đáng giá đã chọn 
   const generateStars = () => {
    const stars =[]
    for(let i = 1; i <= 5 ;i++) {
        const isFilled = i <= (hoveredRating || selectedRating)
        stars.push(
            <span className={`star ${isFilled? 'filled' : 'empty'}`}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave()}
            onClick={() => handleClick(i)}
            style = {{pointerEvents : disabled?'none':'auto'}}
            key={i}
            >★</span>
        )
    }
    return stars
   } 
  return (
    <div className="rating">{generateStars()}</div>
  )

}

export default Rating