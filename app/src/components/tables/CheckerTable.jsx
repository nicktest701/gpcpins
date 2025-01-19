import { useContext } from 'react';
import { CustomContext } from '../../context/providers/CustomProvider';
import { tableIcons } from '../../config/tableIcons';
import _ from 'lodash';
import CustomizedMaterialTable from '../tables/CustomizedMaterialTable';
import { IMAGES } from '../../constants';
import { Refresh } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
const CheckerTable = ({ title }) => {
  const { category } = useParams();

  const { customState } = useContext(CustomContext);

  const col = _.uniq(customState?.newCheckers?.flatMap(Object.keys));

  const ifColumnExist = (column) =>
    col.some((item) => item === column) ? false : true;
  return (
    <CustomizedMaterialTable
      emptyIcon={IMAGES.empty_ticket}
      emptyMessage='No Tickets / Vouchers available !'
      title='Vouchers/Tickets'
      autocompleteComponent={title}
      icons={tableIcons}
      actions={[]}
      columns={[
        {
          title: '#',
          field: 'id',
          hidden: true,
        },
        {
          title: 'Serial',
          field: 'serial',
          hidden: ifColumnExist('serial'),
        },
        {
          title: 'Pin',
          field: 'pin',
          hidden: ifColumnExist('pin'),
        },
        {
          title: 'Seat',
          field: 'type',
          hidden: category !== 'bus',
        },
        {
          title: 'Type',
          field: 'type',
          hidden: !['stadium', 'cinema'].includes(category),
        },
        {
          title: 'Voucher',
          field: 'voucherType',
        },
      ]}
      data={
        customState.newCheckers === undefined ? [] : customState.newCheckers
      }
    />
  );
};

export default CheckerTable;
