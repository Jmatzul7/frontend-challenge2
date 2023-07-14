import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

interface Customer {
  customer_id: number;
  age: number;
}

interface CustomersResponse {
  customers: Customer[];
}

const getAgeRange = (age: number) => {
  if (age >= 18 && age <= 30) {
    return '18-30';
  } else if (age >= 31 && age <= 40) {
    return '31-40';
  } else if (age >= 41 && age <= 50) {
    return '41-50';
  } else {
    return '51+';
  }
};
const url = "http://localhost:5000";
const AgeGraphics: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const chartInstance = useRef<Chart | null>(null);

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
        setCustomers([]);
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
        const ageCounts: Record<string, number> = {};

        if (customers && customers.length > 0) {
        customers.forEach(customer => {
          const { age } = customer;
          const ageRange = getAgeRange(age);
          if (ageRange in ageCounts) {
            ageCounts[ageRange]++;
          } else {
            ageCounts[ageRange] = 1;
          }
        
        });
      }else{
        console.log('No customer data available');
      }
        const labels = Object.keys(ageCounts);
        const data = Object.values(ageCounts);

        const getBarColors = (index: number) => {
          const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
          return colors[index % colors.length];
        };

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Users quantity',
                data: data,
                backgroundColor: labels.map((_, index) => getBarColors(index)),
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
                offset: 4,
              },
            },
            barThickness: 20,
          } as any,
        });
      }
    }
  }, [customers]);

  if (customers && customers.length === 0) {
    // No hay datos de clientes disponibles
    return (
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-10">
            <div className="card mt-3" style={{ width: '475px' }}>
              <div className="card-body">
                <h2 className="card-title">Users by Age</h2>
                <div>No hay datos de clientes disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ageCounts: Record<string, number> = {};

  //to display the data on the card
  customers.forEach(customer => {
    const { age } = customer;
    const ageRange = getAgeRange(age);
    if (ageRange in ageCounts) {
      ageCounts[ageRange]++;
    } else {
      ageCounts[ageRange] = 1;
    }
  });

  const ageRangeData = Object.entries(ageCounts);

  const calculateRangePercentage = (rangeCount: number, total: number) => {
    return ((rangeCount / total) * 100).toFixed(2);
  };
  
  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-10">
          <div className="card mt-3" style={{ width: '475px' }}>
            <div className="card-body">
              <h2 className="card-title">Users by Age</h2>
              {customers.length === 0 ? (
                <div>No customer data available</div>
              ) : (
                <>
                  <canvas ref={chartRef} style={{ width: '200px', height: '150px' }}></canvas>
                  <div className="mt-4">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Age</th>
                          <th>Quantity</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ageRangeData.map(([ageRange, count]) => (
                          <tr key={ageRange}>
                            <td>{ageRange}</td>
                            <td>{count}</td>
                            <td>{calculateRangePercentage(count, customers.length)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  
 }

export default AgeGraphics