import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';

const url = "http://localhost:5000";

interface CustomerService {
  sale_date: string;
  service_name: string;
  service_type: string;
  price: number;
};

interface CustomerServiceResponse {
  services: CustomerService[];
};

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
};

interface CustomerResponse {
  customer: Customer;
};

interface CustomerServicesProps {
  customer_id: number;
};

const CustomerServices = ({ customer_id }: CustomerServicesProps) => {
  const [customerServices, setCustomerServices] = useState<CustomerService[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomerServices = async () => {
      try {
        if (!customer_id) {
          return;
        }

        const customerResponse = await fetch(`${url}/getCustomer/${customer_id}`, {
          credentials: 'include',
        });

        if (!customerResponse.ok) {
          throw new Error('Error getting customer data');
        }

        const customerData: CustomerResponse = await customerResponse.json();
        setCustomer(customerData.customer);

        const servicesResponse = await fetch(`${url}/getCustomerServices/${customer_id}`, {
          credentials: 'include',
        });

        if (!servicesResponse.ok) {
          throw new Error('Failed to get client services');
        }

        const servicesData: CustomerServiceResponse = await servicesResponse.json();
        setCustomerServices(servicesData.services);

        // Calculate the total of the prices
        const total = servicesData.services.reduce((sum, service) => sum + service.price, 0);
        setTotalPrice(total);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCustomerServices();
  }, [customer_id]);

  return (
    <div className='container-fluid h-100'>
      <div className='row h-100'>
        <Sidebar />
        <div className="col-10">
          <div className="container">
            <NavBar />
            {customer && (
              <div className="card mb-4">
                <div className="card-header">
                  <h2 className="card-title">
                    Customer: {customer.first_name} {customer.last_name}
                  </h2>
                </div>
                <div className="card-body">
                  <h1>Customer Services</h1>
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Sale Date</th>
                        <th>Service Name</th>
                        <th>Service Type</th>
                        <th>Service Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerServices.map((service, index) => (
                        <tr key={index}>
                          <td>{service.sale_date}</td>
                          <td>{service.service_name}</td>
                          <td>{service.service_type}</td>
                          <td>${service.price}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3}></td>
                        <td><strong>Total:</strong></td>
                        <td>${totalPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServices;
