import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

interface Service {
  service_id: number;
  service_name: string;
  service_type: string;
  sales_count: number;
}

interface ServicesResponse {
  services: Service[];
}
const url = "http://localhost:5000";
const TopService: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [services, setServices] = useState<Service[]>([]);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${url}/getAllServices`, {
          credentials: 'include',
        });
        const data: ServicesResponse = await response.json();
        setServices(data.services);
      } catch (error) {
        console.error('Error fetching data:', error);
        setServices([]);
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
        let topServices: Service[] = [];
        if ( services && services.length > 0) {
        const sortedServices = services.sort((a, b) => b.sales_count - a.sales_count);
        topServices = sortedServices.slice(0, 5);
      }

        const getRandomColor = (index: number) => {
          const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
          return colors[index % colors.length];
        };
        
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: topServices.map(service => service.service_name),
            datasets: [
              {
                label: 'Total sales',
                data: topServices.map(service => service.sales_count),
                backgroundColor: topServices.map((_, index) => getRandomColor(index)),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'end',
                color: 'black',
                font: {
                  weight: 'bold',
                  size: 12
                },
                formatter: (value: number, context: any) => {
                  const dataset = context.chart.data.datasets[context.datasetIndex];
                  const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return percentage + '%';
                },
                offset: 4 
              }
            },
            barThickness: 20
          } as any          
        });
      }
    }
  }, [services]);

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-10">
          <div className="card mt-3" style={{ width: '475px' }}>
            <div className="card-body">
              <h2 className="card-title">Best selling services</h2>
              <canvas ref={chartRef} style={{ width: '200px', height: '150px' }}></canvas>
              <div className="mt-4">
                {services && services.length === 0 ? (
                  <div>No data available</div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Services</th>
                        <th>Type</th>
                        <th>Sales</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                        {services && services.length > 0 ? (
                          services.map((service, index) => (
                            <tr key={index}>
                              <td>{service.service_name}</td>
                              <td>{service.service_type}</td>
                              <td>{service.sales_count}</td>
                              <td>
                                {(() => {
                                  const total = services.reduce((acc, curr) => acc + curr.sales_count, 0);
                                  const percentage = Math.round((service.sales_count / total) * 100);
                                  return `${percentage}%`;
                                })()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4}>No data available</td>
                          </tr>
                        )}
                      </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopService;
