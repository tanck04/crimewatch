import * as React from "react";
import Svg, { Path, G, Polygon } from "react-native-svg";

interface OutrageOFModestyIconProps {
  size?: number;
  color?: string;
  [key: string]: any; // Allow additional props
}

const OutrageOFModestyIcon = (props: OutrageOFModestyIconProps) => {
  const { size = 70, color = "#ffffff", ...otherProps } = props; // Default size is 70x70
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 432 540" // Maintain original aspect ratio
      preserveAspectRatio="xMidYMid meet" // Maintain aspect ratio while centering in the square container
      width={size} // Dynamically set width
      height={size} // Dynamically set height
      {...otherProps}
    >
      <Path
        d="M106.119,75.25c0-18.399,14.916-33.315,33.315-33.315s33.319,14.916,33.319,33.315s-14.92,33.319-33.319,33.319  S106.119,93.649,106.119,75.25z"
        fill={color}
      />
      <Path
        d="M249.619,121.591c-17.274-3.453-28.513-20.464-25.02-37.945c3.506-17.499,20.416-28.821,37.708-25.363  c17.31,3.475,28.504,20.416,24.994,37.928C283.813,113.666,266.934,125.062,249.619,121.591"
        fill={color}
      />
      <G>
        <Path
          d="M173.619,263.484c-7.201-10.426-4.587-24.717,5.838-31.918l3.923-2.711l0.022-68.022h11.001v60.409l27.046-18.685v-44.36   c0-23.241-18.9-41.852-41.729-41.852h-77.147c-22.828,0-41.733,18.61-41.733,41.852v107.928c0,19.242,27.042,19.242,27.042,0   V160.833h11.01l0.079,250.066c0,9.978,8.093,18.074,18.061,18.074c10,0,18.087-8.097,18.087-18.074l-0.057-141.242h12.166   l-0.053,141.242c0,9.978,8.084,18.074,18.083,18.074c9.973,0,18.065-8.097,18.065-18.074l0.044-139.445   C179.567,269.807,176.149,267.144,173.619,263.484z"
          fill={color}
        />
      </G>
      <Path
        d="M365.657,213.444l-48.547-86.053c-6.555-9.534-24.678-17.068-41.236-4.099c-4.06,3.181-8.58,9.055-10.236,12.723  l-31.355,66.169l-50.854,35.129c-7.253,5.014-9.072,14.951-4.063,22.2c3.097,4.485,8.079,6.894,13.145,6.894  c3.128,0,6.287-0.919,9.055-2.83l54.376-37.562c2.307-1.596,4.152-3.766,5.352-6.301l18.931-32.067l42.014,70.325l-0.132,143.782  c0.22,21.707,16.805,27.335,23.681,27.502c11.312,0.277,24.559-7.451,24.655-25.666l0.009-171.017  C370.262,223.931,369.159,219.516,365.657,213.444z"
        fill={color}
      />
      <Polygon
        points="151.445,31.312 144.697,31.312 144.697,3.194 151.445,3.194 151.445,31.312 "
        fill={color}
      />
      <Polygon
        points="171.949,39.194 166.932,34.677 187.176,12.183 192.194,16.7 171.949,39.194 "
        fill={color}
      />
      <Polygon
        points="182.243,58.718 180.257,52.269 209.499,43.271 211.485,49.72 182.243,58.718 "
        fill={color}
      />
    </Svg>
  );
};

export default OutrageOFModestyIcon;
