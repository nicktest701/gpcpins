import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HomeMap = () => {
  return (
    <MapContainer
      center={[6.70675631287526, -1.6189752122036272]}
      zoom={13}
      style={{ width: '100%', height: '400px', flex: 0.6 }}
      scrollWheelZoom={false}
      fadeAnimation
      className='map-container'
    >
      <TileLayer
        // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={[6.70675631287526, -1.6189752122036272]}>
        <Popup>Gab Powerful Consult</Popup>
      </Marker>
    </MapContainer>
  );
};

export default HomeMap;
