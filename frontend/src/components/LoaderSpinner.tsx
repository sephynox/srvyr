import React from 'react';
import PulseLoader from 'react-spinners/PulseLoader';
import MoonLoader from 'react-spinners/MoonLoader';
import BarLoader from 'react-spinners/BarLoader';

type Props = {
    type?: 'Pulse' | 'Circle' | 'Bar';
    height?: number;
    width?: number | string;
    size?: number;
    color?: string;
};

const LoaderSpinner: React.FunctionComponent<Props> = ({
    type = 'Bar',
    size = 80,
    height = 80,
    width = 80,
    color = '#004085'
}: Props): JSX.Element => {
    const styles = { height: size + 40, lineHeight: `${size + 40}px` };
    const getSpinner = (): JSX.Element => {
        switch (type) {
            case 'Pulse':
                return <PulseLoader color={color} size={size} />;
            case 'Circle':
                return <MoonLoader color={color} size={size} />;
            case 'Bar':
            default:
                return <BarLoader css="display: inline-block" color={color} width={width} height={height} />;
        }
    };

    return (
        <div className="loader-center" style={styles}>{getSpinner()}</div>
    );
};

export default LoaderSpinner;
