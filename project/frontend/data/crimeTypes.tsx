import React from 'react';
import TheftIcon from '../assets/crime_icons/theft';
import OutrageOFModestyIcon from '../assets/crime_icons/outrage_of_modesty';
import RobberyIcon from '../assets/crime_icons/robbery';
import OthersIcon from '../assets/crime_icons/others';
import TheftOfMotorVehicleIcon from '../assets/crime_icons/theft_of_motor_vehicle';
import HousebreakingIcon from '../assets/crime_icons/housebreaking';

export interface CrimeType {
  id: string;
  title: string;
  icon: JSX.Element;
  color: string;
}

export const crimeTypes: CrimeType[] = [
  { id: '1', title: 'Outrage of Modesty', icon: <OutrageOFModestyIcon size={70} color="#fff" />, color: '#F44336' },
  { id: '2', title: 'Snatch Theft', icon: <TheftIcon size={60} color="#fff" />, color: '#4CAF50' },
  { id: '3', title: 'Robbery', icon: <RobberyIcon size={60} color="#fff" />, color: '#2196F3' },
  { id: '4', title: 'Others', icon: <OthersIcon size={60} color="#fff" />, color: '#00BCD4' },
  { id: '5', title: 'Theft of Motor Vehicle', icon: <TheftOfMotorVehicleIcon size={70} color="#fff" />, color: '#AC54B4' },
  { id: '6', title: 'Housebreaking', icon: <HousebreakingIcon size={85} color="#fff" />, color: '#F26B38' },
];

export const getCrimeTypeByTitle = (title: string): CrimeType | undefined => {
  return crimeTypes.find(crime => crime.title.trim().toLowerCase() === title.trim().toLowerCase());
};

export const normalizeTitle = (title: string): string => title.trim().toLowerCase();

export const getDefaultCrimeTypes = (): CrimeType[] => {
  return [
    crimeTypes.find(btn => btn.title === "Outrage of Modesty")!,
    crimeTypes.find(btn => btn.title === "Housebreaking")!,
    crimeTypes.find(btn => btn.title === "Theft of Motor Vehicle")!,
    crimeTypes.find(btn => btn.title === "Others")!
  ];
};