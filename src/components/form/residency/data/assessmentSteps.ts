
import { AssessmentStep } from '../types/assessmentTypes';

const assessmentSteps: Record<string, AssessmentStep> = {
  start: {
    id: 'start',
    question: 'Are you registered for residency in Italy?',
    description: 'This means you are officially registered with the local "Comune" (municipality) in Italy.',
    options: [
      { 
        id: 'yes', 
        label: 'Yes',
        nextStep: 'when-registered' 
      },
      { 
        id: 'no', 
        label: 'No',
        nextStep: 'spent-183-days' 
      },
      { 
        id: 'dont-know', 
        label: 'I don\'t know',
        nextStep: 'info-registry-office'
      }
    ]
  },
  'info-registry-office': {
    id: 'info-registry-office',
    question: 'Information about Registry Office Registration',
    description: 'Being registered at the Italian Registry Office (Anagrafe) means you have officially established your residency in an Italian municipality (Comune). This is a formal procedure where you declare that you permanently live at an address in Italy. When you register, you receive a certificate of residency, which is an official document that confirms your status as a resident.',
    options: [
      {
        id: 'yes-registered',
        label: 'Yes, I am registered',
        nextStep: 'when-registered',
      },
      {
        id: 'no-not-registered',
        label: 'No, I am not registered',
        nextStep: 'spent-183-days',
      },
      {
        id: 'still-not-sure',
        label: 'I\'m still not sure',
        nextStep: 'spent-183-days',
      }
    ]
  },
  'when-registered': {
    id: 'when-registered',
    question: 'When did you apply?',
    description: 'Your registration date affects your tax residency status.',
    options: [
      {
        id: 'registered-over-183',
        label: 'I\'ve been registered for the majority of the tax period (over 183 days this year)',
        resultStrength: 1,
        resultStatus: 'likely-resident',
      },
      {
        id: 'registered-less-183',
        label: 'I\'ve been registered for less than 183 days this year',
        nextStep: 'civil-union',
      }
    ]
  },
  'spent-183-days': {
    id: 'spent-183-days',
    question: 'Have you spent more than 183 days in Italy?',
    description: 'The 183-day rule is one of the key criteria used to determine tax residency in Italy.',
    options: [
      {
        id: 'yes-over-183',
        label: 'Yes',
        nextStep: 'civil-union',
      },
      {
        id: 'no-under-183',
        label: 'No',
        nextStep: 'civil-union-2',
      }
    ]
  },
  'civil-union': {
    id: 'civil-union',
    question: 'Are you married or in a civil union and/or do you have children?',
    options: [
      {
        id: 'yes-family',
        label: 'Yes',
        nextStep: 'spouse-children-italy',
      },
      {
        id: 'no-no-family',
        label: 'No',
        resultStrength: 2,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'civil-union-2': {
    id: 'civil-union-2',
    question: 'Are you married or in a civil union and/or do you have children?',
    options: [
      {
        id: 'yes-family-2',
        label: 'Yes',
        nextStep: 'spouse-children-italy-2',
      },
      {
        id: 'no-no-family-2',
        label: 'No',
        resultStrength: 5,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'spouse-children-italy': {
    id: 'spouse-children-italy',
    question: 'Have you had a spouse and/or children in Italy for the majority of the tax year?',
    options: [
      {
        id: 'yes-family-italy',
        label: 'Yes',
        resultStrength: 1,
        resultStatus: 'likely-resident',
      },
      {
        id: 'no-family-not-italy',
        label: 'No',
        resultStrength: 2,
        resultStatus: 'likely-non-resident',
      }
    ]
  },
  'spouse-children-italy-2': {
    id: 'spouse-children-italy-2',
    question: 'Have you had a spouse and/or children in Italy for the majority of the tax year?',
    options: [
      {
        id: 'yes-family-italy-2',
        label: 'Yes',
        resultStrength: 3,
        resultStatus: 'continue-assess',
      },
      {
        id: 'no-family-not-italy-2',
        label: 'No',
        resultStrength: 4,
        resultStatus: 'continue-assess',
      }
    ]
  },
};

export default assessmentSteps;
