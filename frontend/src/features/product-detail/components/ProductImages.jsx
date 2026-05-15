import React from 'react';

/**
 * ProductImages — gallery ảnh sản phẩm với thumbnail switcher.
 */
function ProductImages({ images, selectedImage, onSelectImage, productName }) {
  return (
    <div className="product-gallery">
      <div className="main-image-container">
        <img
          src={images[selectedImage]}
          alt={productName}
          className="main-image"
        />
      </div>
      <div className="thumbnail-grid">
        {images.map((img, index) => (
          <div
            key={index}
            className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
            onClick={() => onSelectImage(index)}
          >
            <img src={img} alt={`${productName} ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductImages;
