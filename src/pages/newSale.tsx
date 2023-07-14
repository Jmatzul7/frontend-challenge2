import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
  service_id: number;
};

interface NewSaleData {
  customer: Customer;
  service_id: number;
  additional_info: string;
};

interface Service{
  service_id: number
  service_name: string;
  service_type: string;
}

interface ServiceResponse{
  services: Service[]
}
const NewSale = () => {
  const router = useRouter();

  const [customerData, setCustomerData] = useState<Customer>({
    customer_id: 0,
    first_name: '',
    last_name: '',
    age: 0,
    gender: '',
    contact_number: '',
    email: '',
    address: '',
    service_id: 0
  });


  const [serviceId, setServiceId] = useState<number>(0);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [saleData, setSaleData] = useState(null);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleServiceIdChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceId = Number(event.target.value);
    setServiceId(selectedServiceId);
  };

  const handleAdditionalInfoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setAdditionalInfo(value);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const errors: Partial<Record<keyof Customer, string>> = {};

    if (customerData.customer_id === 0 && !customerData.first_name) {
      errors.first_name = 'First name is required';
      isValid = false;
    }

    if (customerData.customer_id === 0 && !customerData.last_name) {
      errors.last_name = 'Last name is required';
      isValid = false;
    }

    if (customerData.customer_id === 0 && (customerData.age === undefined || customerData.age <= 0)) {
      errors.age = 'Age is required and must be a positive number';
      isValid = false;
    }

    if (customerData.customer_id === 0 && !customerData.gender) {
      errors.gender = 'Gender is required';
      isValid = false;
    }

    if (serviceId === 0) {
      errors.service_id = 'A service must be selected';
      isValid = false;
    }

    if (customerData.customer_id === 0 && !customerData.contact_number) {
      errors.contact_number = 'Contact number is required';
      isValid = false;
    }

    if (customerData.customer_id === 0 && !customerData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (customerData.customer_id === 0 && !emailRegex.test(customerData.email)) {
        errors.email = 'Invalid email format';
        isValid = false;
      }
    }

    if (customerData.customer_id === 0 && !customerData.address) {
      errors.address = 'Address is required';
      isValid = false;
    }

    // Set the errors object
    setErrors(errors);

    return isValid;
  };

  
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [dataService, setDataService] = useState<Service[]>([])

  useEffect(() => {
    // Obtener la lista de clientes existentes al cargar el componente
    const fetchExistingCustomers = async () => {
      try {
        const response = await fetch(`${url}/getCustomerSale`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Agregar esta opción para incluir las cookies
        });

        if (response.ok) {
          const data = await response.json();
          setExistingCustomers(data.customers);
          
        } else {
          console.error('Error al obtener la lista de clientes');
        }
      } catch (error) {
        console.error('Error en la solicitud HTTP', error);
      }
    };

    fetchExistingCustomers();

    const getServices = async()=>{
      try{
        const response = await fetch(`${url}/getAllServices`,{
          credentials: 'include'
        });

        if(!response.ok){
          throw new Error('Failed to fetch available services');
        }
        const data: ServiceResponse = await response.json();
        setDataService(data.services)
          console.log(data)

      }catch(error){
        console.error(error)
      }
    }

    getServices();
  }, []);

  const handleCustomerSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomerId = Number(event.target.value);
    const selectedCustomer = existingCustomers.find(customer => customer.customer_id === selectedCustomerId);
    if (selectedCustomer) {
      setCustomerData(selectedCustomer);
    }
    
  };
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newSaleData: NewSaleData = {
      customer: customerData,
      additional_info: additionalInfo,
      service_id: serviceId,
    };

    try {
      const response = await fetch(`${url}/salesTest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSaleData),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const MySwal = withReactContent(Swal);
        MySwal.fire({
          icon: 'success',
          title: 'Sale created successfully',
          text: 'Sale details:\nCustomer: ' + data.cliente + '\nDate: ' + data.fecha + '\nService: ' + data.servicio + '\nUser: ' + data.usuario,
          showCancelButton: true,
          cancelButtonText: 'Close',
          confirmButtonText: 'Sales',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/sales');
          }
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error creating sale',
          text: errorData.error,
        });
      }
    } catch (error) {
      console.error('HTTP request failed', error);
    }

     setCustomerData({
      customer_id: 0,
      first_name: '',
      last_name: '',
      age: 0,
      gender: '',
      contact_number: '',
      email: '',
      address: '',
      service_id: 0
    });
    setServiceId(0);
    setAdditionalInfo('');
  };


  return (
    <div className="container-fluid h-100">
      <div className='row h-100'>
      <div className="col-12 col-md-2" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <NavBar></NavBar>

          <div className="card col-6 mx-auto">
            <div className="card-header">
              <h1>Create New Sale</h1>
            </div>
            <div className="card-body">

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6">
                    <label htmlFor="customer_select" className="form-label">
                      Select Customer:
                    </label>
                    <select
                        className="form-select"
                        name="customer"
                        id="customer_select"
                        onChange={handleCustomerSelect}
                      >
                        <option value="">-- Select Customer --</option>
                        {Array.isArray(existingCustomers) && existingCustomers.map((customer) => (
                          <option key={customer.customer_id} value={String(customer.customer_id)}>
                            {customer.first_name} {customer.last_name}
                          </option>
                        ))}
                      </select>
                  </div>
                </div>

                {customerData.customer_id === 0 && (
                  <>
                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="first_name" className="form-label">
                            First Name:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="first_name"
                            name="first_name"
                            value={customerData.first_name}
                            onChange={handleInputChange}
                          />
                          {errors.first_name && (
                            <div className="text-danger">{errors.first_name}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="last_name" className="form-label">
                            Last Name:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="last_name"
                            name="last_name"
                            value={customerData.last_name}
                            onChange={handleInputChange}
                          />
                          {errors.last_name && (
                            <div className="text-danger">{errors.last_name}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="age" className="form-label">
                            Age:
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="age"
                            name="age"
                            value={customerData.age}
                            onChange={handleInputChange}
                          />
                          {errors.age && (
                            <div className="text-danger">{errors.age}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="gender" className="form-label">
                            Gender:
                          </label>
                          <select
                            className="form-select"
                            name="gender"
                            id="gender"
                            value={customerData.gender}
                            onChange={handleSelectChange}
                          >
                            <option value="">-- Select Gender --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          {errors.gender && (
                            <div className="text-danger">{errors.gender}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="contact_number" className="form-label">
                            Contact Number:
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            id="contact_number"
                            name="contact_number"
                            value={customerData.contact_number}
                            onChange={handleInputChange}
                          />
                          {errors.contact_number && (
                            <div className="text-danger">{errors.contact_number}</div>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email:
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="email"
                            name="email"
                            value={customerData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <div className="text-danger">{errors.email}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <div className="mb-3">
                          <label htmlFor="address" className="form-label">
                            Address:
                          </label>
                          <textarea
                            className="form-control"
                            id="address"
                            name="address"
                            value={customerData.address}
                            onChange={handleInputChange}
                          />
                          {errors.address && (
                            <div className="text-danger">{errors.address}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="service" className="form-label">
                        Service:
                      </label>


                      <select
                        className="form-select"
                        id="service"
                        name="service_id"
                        value={serviceId}
                        onChange={handleServiceIdChange}
                      >
                        <option value="">-- Select Service --</option>
                        {Array.isArray(dataService)&& dataService.map((services)=>(
                          <option key={services.service_id} value={String(services.service_id)}>{services.service_name}/{services.service_type}</option>
                        ))}
                      </select>
                      {errors.service_id && (
                        <div className="text-danger">{errors.service_id}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="additional_info" className="form-label">
                        Additional Information:
                      </label>
                      <textarea
                        className="form-control"
                        id="additional_info"
                        name="additional_info"
                        value={additionalInfo}
                        onChange={handleAdditionalInfoChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  

    </div>
  );
};

export default NewSale;
