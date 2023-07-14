import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TopService from '../components/TopServices';
import GenderGraphics from '../components/GenderCustomers';
import AgeGraphics from '../components/AgeGraphics';
import ServiceGraphics from '../components/ServicesCustomer';

const Graphics: React.FC = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-md d-md-block" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-md-10">
          <Navbar />
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <TopService />
              </div>
              <div className="col-md-16 col-md">
                <AgeGraphics />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <GenderGraphics />
                <br />
              </div>
              <div className="col-md-16 col-md">
                <br />
              <ServiceGraphics />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graphics;
