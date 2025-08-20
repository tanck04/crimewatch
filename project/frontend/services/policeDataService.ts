export interface PoliceStation {
  geometry: {
    coordinates: [number, number, number]; // [longitude, latitude, elevation]
  };
  properties: {
    Name: string;
    Description: string;
  };
}

export interface ExtractedPoliceData {
  name: string;
  type: string;
  tel: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export function extractPoliceStationInfo(station: PoliceStation): ExtractedPoliceData {
  // Extract BLDG from Description
  const bldgMatch = station.properties.Description.match(/<th>BLDG<\/th>\s*<td>(.*?)<\/td>/);
  const name = bldgMatch ? bldgMatch[1] : "Police Station";
  
  // Extract TYPE from Description
  const typeMatch = station.properties.Description.match(/<th>TYPE<\/th>\s*<td>(.*?)<\/td>/);
  const type = typeMatch ? typeMatch[1] : "Police Station";
  
  // Extract TEL from Description
  const telMatch = station.properties.Description.match(/<th>TEL<\/th>\s*<td>(.*?)<\/td>/);
  const tel = telMatch ? telMatch[1] : "N/A";
  
  return {
    name,
    type,
    tel,
    coordinates: {
      latitude: station.geometry.coordinates[1],
      longitude: station.geometry.coordinates[0]
    }
  };
}