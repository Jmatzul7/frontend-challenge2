import { useEffect, useRef, useState } from 'react';
import Chart, { ChartTypeRegistry, ChartConfiguration, DoughnutControllerChartOptions } from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

interface Customer {
  customer_id: number;
  gender: string;
}

interface CustomersResponse {
  customers: Customer[];
}
const url = "http://localhost:5000";
const GenderGraphics: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const chartInstance = useRef<Chart<"pie", number[], string> | null>(null);

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
      
        const maleCustomers = customers.filter(customer => customer.gender === 'Male').length;
        const femaleCustomers = customers.filter(customer => customer.gender === 'Female').length;

        chartInstance.current = new Chart<"pie", number[], string>(ctx, {
          type: 'pie',
          data: {
            labels: [ 'Males', 'Females'],
            datasets: [
              {
                label: 'Users quantity',
                data: [ maleCustomers, femaleCustomers],
                backgroundColor: [
                  'rgba(54, 162, 235, 0.5)', // Color for 'Males'
                  'rgba(255, 206, 86, 0.5)', // Color fro 'Females'
                ],
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
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
                  const dataset = context.chart.data.datasets[context.datasetIndex];
                  const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${percentage}% (${value})`;
                },
                offset: 4, // Ajusta el espaciado entre la etiqueta y la barra
              },
            },
          }as any,
        });
      }
    }
  }, [customers]);

  const totalCustomers = customers.length;
  const maleCustomers = customers.filter(customer => customer.gender === 'Male').length;
  const femaleCustomers = customers.filter(customer => customer.gender === 'Female').length;

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-10">
          <div className="card mt-3" style={{ width: '500px' }}>
            <div className="card-body">
              <h2 className="card-title">Users by Gender</h2>
              <canvas ref={chartRef} style={{ width: '100px', height: '75px' }}></canvas>
            </div>
            <div className="mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Gender</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total</td>
                    <td>{totalCustomers} ({Math.round((totalCustomers / totalCustomers) * 100)}%)</td>
                  </tr>
                  <tr>
                    <td>Males</td>
                    <td>{maleCustomers} ({Math.round((maleCustomers / totalCustomers) * 100)}%)</td>
                  </tr>
                  <tr>
                    <td>Females</td>
                    <td>{femaleCustomers} ({Math.round((femaleCustomers / totalCustomers) * 100)}%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderGraphics;
