import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../components/axiosCongif';

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const activateUser = async () => {
    try {
      const res = await api.get(`/activation/${activation_token}`);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(true);
    }
  };

  useEffect(() => {
    activateUser();
  }, [activation_token]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">

      {error ? (
        <p className="text-red-500 text-lg font-semibold">
          Activation failed. Token may have expired.
        </p>
      ) : success ? (
        <p className="text-green-500 text-lg font-semibold">
          Your account has been activated successfully!
        </p>
      ) : (
        <p>Activating your account...</p>
      )}
    </div>
  );
};

export default ActivationPage;
