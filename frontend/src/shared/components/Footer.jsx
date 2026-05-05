import React from 'react'
import '@/shared/components/styles/Footer.css'
import {Phone, Mail,GitHub, Facebook, Instagram } from '@mui/icons-material'


function Footer() {
  return (
        <footer className="footer"> 
          <div className="footer-container">
          {/* SECTION 1*/}
          <div className="footer-section contact">
            <h3>Kết nối với chúng tôi</h3>
            <p><Phone fontSize='small'/>Phone : +84123456789</p>
            <p><Mail fontSize='small'/>Mail : phamvanson2303@gmail.com</p>
          </div>
          {/* SECTION 2*/}
          <div className="footer-section social">
            <h3>Theo dõi chúng tôi</h3>
            <div className="social-">
              <a href="" target='_blank' className="hover-scale-up">
                  <GitHub  className='social-icon hover-icon-btn' />
              </a>
              <a href="" target='_blank' className="hover-scale-up">
                <Facebook className='social-icon hover-icon-btn'/>
              </a>
              <a href="" target='_blank' className="hover-scale-up">
                <Instagram className='socail-icon hover-icon-btn'/>
              </a>
            </div>
          </div>
          {/* SECTION 3*/}
          <div className="footer-section about">
          <h3>Về chúng tôi</h3>
          <p></p>
          </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 SonPham </p>
          </div>
          
        </footer>

  )
}

export default Footer