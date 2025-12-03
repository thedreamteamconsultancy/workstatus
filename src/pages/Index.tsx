import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/gem-dashboard');
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  return <LoadingSpinner fullScreen text="Loading..." />;
};

export default Index;
