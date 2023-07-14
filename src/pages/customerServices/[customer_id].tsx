import { useRouter } from 'next/router';
import CustomerServices from '../CustomerServices';

const CustomerServicesPage = () => {
  const router = useRouter();
  const { customer_id } = router.query;

  if (!customer_id) {
    return <div className="text-center">Error: Customer ID not provided</div>;
  }

  const customerIdNumber = parseInt(customer_id as string, 10);

  return <CustomerServices customer_id={customerIdNumber} />;
};

export default CustomerServicesPage;
