import React from 'react';
import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';
import Link from 'next/link';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ServiceModal from '../components/ServiceModal';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

const url = "http://localhost:5000";

type Sale = {
  sale_id: number;
  customer: string;
  service: string;
  service_type: string;
  user: string;
};

type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  email: string;
  contact_number: string;
  address: string;
  services_purchased: number;
};

type Service = {
  service_id: number;
  service_name: string;
  service_type: string;
  price: number;
  availability: number;
};

type NewService = {
  service_name: string;
  service_type: string;
  price: number;
  availability: number;
};

type CustomerResponse = {
  customers: Customer[];
};

type SalesResponse = {
  sales: Sale[];
};

type ServicesResponse = {
  services: Service[];
};

interface TokenPayload{
  sub:{
    username: string,
    role: string
  }
}

const DashboardPage = () => {
  const router = useRouter();
  const [latestSales, setLatestSales] = useState<Sale[]>([]);
  const [latestCustomers, setLatestCustomers] = useState<Customer[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [newServiceAvailability, setNewServiceAvailability] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(0);
  const[name, setName] = useState('')

  const token = Cookies.get('access_token_cookie');

  useEffect(() => {
    if (!token) {
      // No valid session cookie, redirect to login page
      router.push('/');
    } else {

      const role = getUserRole();
      const decodedToken = jwt_decode<TokenPayload>(token);
      const user = decodedToken.sub.username;
       setName(user)
      
      fetchLatestSales();
      fetchLatestCustomers();
      fetchAvailableServices();
    }
  }, []);

  const getUserRole = () => {

    if(token){
      const decodeToke = jwt_decode<TokenPayload>(token)
      const role = decodeToke.sub.role;
      setUserRole(role);
      return role;
     
    }
  };

  const fetchLatestSales = async () => {
    try {
      const response = await fetch(`${url}/getLatestSales`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest sales');
      }

      const data: SalesResponse = await response.json();
      setLatestSales(data.sales);
    } catch (error) {
      console.error(error);
    }
  };


  const [dataService, setDataService] = useState<NewService>({
    service_name: '',
    service_type:'', // or product?
    price:0,
    availability:0,
  
  })
  
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDataService((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditService = (serviceId:number) => {
    setSelectedServiceId(serviceId);
    setShowServiceModal(true);
    console.log(serviceId)
  };

  const fetchLatestCustomers = async () => {
    try {
      const response = await fetch(`${url}/getTopCustomers`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch latest customers');
      }

      const data: CustomerResponse = await response.json();
      setLatestCustomers(data.customers);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch(`${url}/getAllServices`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available services');
      }

      const data: ServicesResponse = await response.json();
      setAvailableServices(data.services);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewServices = (customer_id: number) => {
    router.push(`/customerServices/${customer_id}`);
  };

  const handleNewServiceModalShow = () => {
    setShowNewServiceModal(true);
  };

  const handleNewServiceModalClose = () => {
    setShowNewServiceModal(false);
    setNewServiceName('');
    setNewServiceType('');
    setNewServicePrice(0);
    setNewServiceAvailability(false);
  };


  const handleCreateService = async () => {
    try {
      

      // Send request to create the new service
      const response = await fetch(`${url}/newServices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataService),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }
        console.log(dataService)
        Swal.fire({
          icon: 'success',
          title: 'Service created successfully',
          text: 'The service has been created successfully',
        }).then(() => {
          
        });
      // Fetch the updated list of available services
      await fetchAvailableServices();

      handleNewServiceModalClose();
      window.location.reload()
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error creating service',
        text: 'Could not create service',
      });
    }
  };


  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
      <div className="col-12 col-md-2" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <NavBar />
          <div className="container-fluid pt-3 pl-3">
            <h1 className='text-center'>Welcome {name}</h1>
            <div className="row">
              <div className="col-md-16 col-md">
                <div className="card mb-4">
                  <div className="card-header">
                  <Link href='/newSale' className='btn btn-primary mb-3'>
                        New Sale
                  </Link>
                    <h2 className="card-title">Latest Sales</h2>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Sale ID</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Service Type</th>
                            <th>User</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestSales.map((sale, index) => (
                            <tr key={index}>
                              <td>{sale.sale_id}</td>
                              <td>{sale.customer}</td>
                              <td>{sale.service}</td>
                              <td>{sale.service_type}</td>
                              <td>{sale.user}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-16 col-md">
                <div className="card mb-4">
                  <div className="card-header">
                    {userRole === 'admin' && (
                      <button className="btn btn-primary" onClick={handleNewServiceModalShow}>
                        New Service
                      </button>
                    )}
                    <h2 className="card-title">Available Services</h2>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Service ID</th>
                            <th>Service Name</th>
                            <th>Service Type</th>
                            <th>Price</th>
                            <th>Availability</th>
                            {userRole === 'admin' && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {availableServices.map((service, index) => (
                            <tr key={index}>
                              <td>{service.service_id}</td>
                              <td>{service.service_name}</td>
                              <td>{service.service_type}</td>
                              <td>${service.price}</td>
                              <td>{service.availability ? 'Yes' : 'No'}</td>
                              {userRole === 'admin' && (
                                <td>
                                  <button className="btn btn-primary" onClick={() => handleEditService(service.service_id)}>Edit</button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Customers with Most Purchased Services</h2>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Customer ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Email</th>
                        <th>Contact Number</th>
                        <th>Address</th>
                        <th>Services Purchased</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestCustomers.map((customer, index) => (
                        <tr key={index}>
                          <td>{customer.customer_id}</td>
                          <td>
                            {customer.first_name} {customer.last_name}
                          </td>
                          <td>{customer.age}</td>
                          <td>{customer.gender}</td>
                          <td>{customer.email}</td>
                          <td>{customer.contact_number}</td>
                          <td>{customer.address}</td>
                          <td>
                            {customer.services_purchased}
                            <button
                              className="btn btn-link"
                              onClick={() => handleViewServices(customer.customer_id)}
                            >
                              View Services
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Update Service Modal */}
      <ServiceModal
        show={showServiceModal}
        handleClose={() => setShowServiceModal(false)} service={{
          name: '',
          type: '',
          price: 0,
          availability: false
        }} serviceId={selectedServiceId}          />

  
        <Modal show={showNewServiceModal} onHide={handleNewServiceModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create new service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Form for updating the selected service */}
            <div className="card col-12 mx-auto">
            <div className="card-header">
              <h1>Create New Service</h1>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="service_name" className="form-label">
                    Service Name:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="service_name"
                    name="service_name"
                    value={dataService.service_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="service_type" className="form-label">
                    Service Type:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="service_type"
                    name="service_type"
                    value={dataService.service_type}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="price" className="form-label">
                    Price:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    placeholder=''
                    value={dataService.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="availability" className="form-label">
                    Availability:
                  </label>
                  <select
                    className="form-control"
                    id="availability"
                    name="availability"
                    value={dataService.availability}
                    onChange={handleInputChange}
                  >
                    <option value="">--Select availability--</option>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </form>
            </div>
          </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleNewServiceModalClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateService}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
    </div>
  );
};

export default DashboardPage;
