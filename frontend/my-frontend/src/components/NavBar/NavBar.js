import React from 'react';
import '../../pages/HaremAltin/HaremAltin.css';

const NavBar = ({ onMenuClick }) => {
  return (
    <div className="navbar">
      <div className="brand">Kavaklı Kuyumculuk</div>
      <button className="menu-button" onClick={onMenuClick}>
        &#9776;
      </button>
    </div>
  );
};

export default NavBar;
