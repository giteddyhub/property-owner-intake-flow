
import React from 'react';
import { CardRadioGroupItem } from '@/components/ui/radio-group';
import { ActivityType } from '@/types/form';

interface ActivityTypeOptionProps {
  value: ActivityType;
  title: string;
  explanation: string;
  isChecked: boolean;
  children?: React.ReactNode;
}

const ActivityTypeOption: React.FC<ActivityTypeOptionProps> = ({
  value,
  title,
  explanation,
  isChecked,
  children
}) => {
  return (
    <CardRadioGroupItem 
      value={value} 
      id={value} 
      checked={isChecked}
      title={title}
      explanation={explanation}
    >
      {children}
    </CardRadioGroupItem>
  );
};

export default ActivityTypeOption;
