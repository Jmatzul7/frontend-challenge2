import { useState, useEffect, ChangeEvent } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';

const url = "http://localhost:5000";

interface Service {
  service_id: number;
  service_name: string;
  service_type: string;
  price: number;
  availability: number;
};

interface ServiceModalProps {
  show: boolean;
  serviceId: number;
  handleClose: () => void;
  service: {
    name: string;
    type: string;
    price: number;
    availability: boolean;
  };
};

interface UpdatedService  {
  service_name: string;
  service_type: string;
  price: number;
  availability: number;
};

const ServiceModal = ({ show, serviceId, handleClose }: ServiceModalProps) => {
  const [service, setService] = useState<Service | null>(null);
  const [updatedService, setUpdatedService] = useState<UpdatedService>({
    service_name: '',
    service_type: '',
    price: 0,
    availability: 0,
  });

  useEffect(() => {
    fetchService(serviceId);
  }, [serviceId]);

  const fetchService = async (serviceId: number) => {
    try {
      const response = await fetch(`${url}/getServices/${serviceId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service');
        
      }
      const data: Service = await response.json();
      setService(data);
      
      setUpdatedService({
        service_name: data.service_name,
        service_type: data.service_type,
        price: data.price,
        availability: data.availability,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateService = async () => {
    try {
      const response = await fetch(`${url}/updateServices/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedService),
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      
      Swal.fire({
        icon: 'success',
        title: 'Service successfully updated',
        text: 'The service has been successfully updated',
      }).then(() => {
        handleClose();
        window.location.reload();
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error updating service',
        text: 'Could not update service',
      });
    }
  };

  const handleServiceChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedService((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {service ? (
          <form>
            <div className="form-group">
              <label>Service Name</label>
              <input
              className="form-control"
                type="text"
                name="service_name"
                value={updatedService.service_name}
                onChange={handleServiceChange}
              />
            </div>
            <div className="form-group">
              <label>Service Type</label>
              <input
              className="form-control"
                type="text"
                name="service_type"
                value={updatedService.service_type}
                onChange={handleServiceChange}
              />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
              className="form-control"
                type="number"
                name="price"
                value={updatedService.price}
                onChange={handleServiceChange}
              />
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select
                className="form-control"
                name="availability"
                value={updatedService.availability}
                onChange={handleServiceChange}
              >
                <option value="">--Select availability--</option>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
            </div>
            
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateService}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceModal;
