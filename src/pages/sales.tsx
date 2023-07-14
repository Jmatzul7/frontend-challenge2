import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';

type Sale = {
  sale_id: number;
  customer: string;
  service: string;
  service_type: string;
  user: string;
  sale_date: string;
};

type SalesResponse = {
  sales: Sale[];
};

const url = "http://localhost:5000";
const Sales = () => {
  const [cachedSales, setCachedSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dataLoaded) {
          return dataLoaded;
        }

        const response = await fetch(`${url}/sales`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error getting sales');
        }

        const data: SalesResponse = await response.json();
        setCachedSales(data.sales);
        setFilteredSales(data.sales);
        setDataLoaded(true);
        console.log(data.sales);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filteredSales = cachedSales.filter(
      (sale) =>
        sale.customer.toLowerCase().includes(searchTerm) ||
        sale.service.toLowerCase().includes(searchTerm) ||
        sale.service_type.toLowerCase().includes(searchTerm) ||
        sale.user.toLowerCase().includes(searchTerm)
    );
    setFilteredSales(filteredSales);
  };

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortSales = () => {
    const sortedSales = [...filteredSales].sort((a, b) => {
      if (sortColumn === 'sale_id') {
        return sortDirection === 'asc' ? a.sale_id - b.sale_id : b.sale_id - a.sale_id;
      } else if (sortColumn === 'customer') {
        return sortDirection === 'asc' ? a.customer.localeCompare(b.customer) : b.customer.localeCompare(a.customer);
      } else if (sortColumn === 'service') {
        return sortDirection === 'asc' ? a.service.localeCompare(b.service) : b.service.localeCompare(a.service);
      } else if (sortColumn === 'service_type') {
        return sortDirection === 'asc'
          ? a.service_type.localeCompare(b.service_type)
          : b.service_type.localeCompare(a.service_type);
      } else if (sortColumn === 'user') {
        return sortDirection === 'asc' ? a.user.localeCompare(b.user) : b.user.localeCompare(a.user);
      }
      return 0;
    });

    setFilteredSales(sortedSales);
  };

  useEffect(() => {
    sortSales();
  }, [sortColumn, sortDirection]);

  // Calcular los índices de inicio y fin de los elementos que se muestran en la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className='container-fluid h-100'>
      <div className='row h-100'>
      <div className="col-12 col-md-2" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <NavBar />
          <h1>Sales</h1>
          <div className='mb-3' style={{ width: '40%' }}>
            <input
              type='text'
              className='form-control'
              placeholder='Search by customer, service, type, or user...'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Link href='/newSale' className='btn btn-primary mb-3'>
            New Sale
          </Link>
          <table className='table table-striped table-bordered'>
            <thead>
              <tr>
                <th>
                  <button className='btn btn-link' onClick={() => handleSort('sale_id')}>
                   <strong>No. Venta</strong> 
                  </button>
                </th>
                <th>
                  <button className='btn btn-link' onClick={() => handleSort('customer')}>
                   <strong>Customer</strong> 
                  </button>
                </th>
                <th>
                  <button className='btn btn-link' onClick={() => handleSort('service')}>
                   <strong>Service</strong> 
                  </button>
                </th>
                <th>
                  <button className='btn btn-link' onClick={() => handleSort('service_type')}>
                   <strong>Service Type</strong> 
                  </button>
                </th>
                <th>
                  <button className='btn btn-link' onClick={() => handleSort('user')}>
                   <strong>User</strong> 
                  </button>
                </th>

                <th><strong>Sale Date</strong></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((sale) => (
                <tr key={sale.sale_id}>
                  <td>{sale.sale_id}</td>
                  <td>{sale.customer}</td>
                  <td>{sale.service}</td>
                  <td>{sale.service_type}</td>
                  <td>{sale.user}</td>
                  <td>{sale.sale_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='pagination'>
            <button className='btn  btn-link' onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span className='page-info'>
              Page {currentPage} of {totalPages}
            </span>
            <button className='btn btn-link' onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
