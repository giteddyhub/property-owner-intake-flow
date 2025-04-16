
import React from 'react';

interface FormHeaderProps {
  title: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title }) => {
  return (
    <h3 className="text-lg font-semibold mb-4">
      {title}
    </h3>
  );
};

export default FormHeader;
