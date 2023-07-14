import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  services_purchased: number;
}

interface CustomersResponse {
  customers: Customer[];
}
const url = "http://localhost:5000";
const ServiceGraphics: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const chartInstance = useRef<Chart | null>(null);
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${url}/getCustomers`, {
          credentials: 'include',
        });
        const data: CustomersResponse = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (customers.length === 0) {
          return;
        }

        const labels = customers.map(customer => `${customer.first_name} ${customer.last_name}`);
        const data = customers.map(customer => customer.services_purchased);

        const getBarColors = (index: number) => {
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '##00437f','#500000','#000066','#9966FF'];
            return colors[index % colors.length];
          };

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Amount of Services Purchased',
                data: data,
                backgroundColor: labels.map((_, index)=>getBarColors(index)),
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true, 
              },
            },
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'end',
                color: 'black',
                font: {
                  weight: 'bold',
                  size: 12,
                },
                formatter: (value: number, context: any) => {
                  return value.toString();
                },
                offset: 4,
              },
            },
            barThickness: 20,
          }as any,
        });
      }
    }
  }, [customers]);

  if (!customers) {
    return <div>Loading data...</div>;
  }
  
  if (customers.length === 0) {
    return <div>No customer data available</div>;
  }
  
  const totalPages = Math.ceil(customers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCustomers = customers.slice(startIndex, endIndex);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-10">
          <div className="card" style={{ width: '500px' }}>
            <div className="card-body">
              <h2 className="card-title">Services purchased by the user.</h2>
              <div className="chart-container">
              <canvas ref={chartRef} style={{ width: '300px', height: '400px' }}></canvas>
              </div>
            </div>
            <div className="mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Users</th>
                    <th>Amount of Services Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map(customer => (
                    <tr key={customer.customer_id}>
                      <td>{`${customer.first_name} ${customer.last_name}`}</td>
                      <td>{customer.services_purchased}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center">
              <nav aria-label="Page navigation example">
                <ul className="pagination">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      <span className="page-link">{index + 1}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default ServiceGraphics;
