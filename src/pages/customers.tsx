import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const url = "http://localhost:5000";

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  contact_number: string;
  email: string;
  address: string;
  services_purchased: number;
}

interface CustomerResponse {
  customers: Customer[];
}

const Customer: React.FC = () => {
  const [cachedCustomers, setCachedCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dataLoaded) {
          return;
        }

        const response = await fetch(`${url}/getCustomers`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error getting customers');
        }

        const data: CustomerResponse = await response.json();
        setCachedCustomers(data.customers);
        setFilteredCustomers(data.customers);
        setDataLoaded(true);
        console.log(data.customers);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filteredCustomers = cachedCustomers.filter(
      (customer) =>
        customer.first_name.toLowerCase().includes(searchTerm) ||
        customer.last_name.toLowerCase().includes(searchTerm)
    );
    setFilteredCustomers(filteredCustomers);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleViewServices = (customer_id: number) => {
    router.push(`/customerServices/${customer_id}`);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  return (
    <div className='container-fluid h-100'>
      <div className='row h-100'>
        <div className='col-12 col-md-2' style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className='col-12 col-md-10'>
          <Navbar />
          <div className='container-fluid pt-3 pl-3'>
            <h1>Customers</h1>
            <div className='mb-3' style={{ width: '100%', maxWidth: '400px' }}>
              <input
                type='text'
                className='form-control'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className='table-responsive'>
              <table className='table table-striped table-bordered'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Contact Number</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Services Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.first_name} {customer.last_name}</td>
                      <td>{customer.age} Years old</td>
                      <td>{customer.gender}</td>
                      <td>{customer.contact_number}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address}</td>
                      <td>
                        {customer.services_purchased}{' '}
                        <button
                          className='btn btn-link'
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
            <div className='pagination'>
              <span className='page-info'>
                Page {currentPage} of {totalPages}
              </span>
              <button className='btn btn-link' onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <button className='btn btn-link' onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
