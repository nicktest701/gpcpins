import { useContext, useState } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MaterialTable, { MTableToolbar } from 'material-table';
import Swal from 'sweetalert2';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tableIcons } from '../../config/tableIcons';
import { Add, DeleteRounded, Refresh } from '@mui/icons-material';
import { CustomContext } from '../../context/providers/CustomProvider';
import { getColumns } from '../../config/getColumns';
import {
  deleteCategory,
  deleteMoreCategory,
  disableCategory,
} from '../../api/categoryAPI';
import { globalAlertType } from '../alert/alertType';
import { Navigate, useParams } from 'react-router-dom';
import ActionMenu from '../menu/ActionMenu';
import { Card, MenuItem } from '@mui/material';

const ViewCategory = ({ categories, pageInfo, refetch }) => {
  const { category } = useParams();

  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectionChange = (data) => {
    const ids = data?.map(({ id }) => id);
    setSelectedItems(ids);
  };

  const { mutateAsync } = useMutation({
    mutationFn: deleteCategory,
  });
  function removeCategory(id) {
    Swal.fire({
      title: 'Removing',
      text: 'Do you want to remove ?',
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(['category']);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType('info', data));
          },
          onError: (error) => {
            customDispatch(globalAlertType('error', error));
          },
        });
      }
    });
  }

  const { mutateAsync: deleteMoreAsync } = useMutation({
    mutationFn: deleteMoreCategory,
  });
  function removeAllCategory() {
    Swal.fire({
      title: 'Removing',
      text: 'Do you want to remove all selected categories?',
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMoreAsync(selectedItems, {
          onSettled: () => {
            queryClient.invalidateQueries(['category']);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType('info', data));
          },
          onError: (error) => {
            customDispatch(globalAlertType('error', error));
          },
        });
      }
    });
  }

  const handleEditCategory = (id) => {
    const openEdit = `openEdit${_.capitalize(category)}Category`;
    customDispatch({
      type: openEdit,
      payload: {
        open: true,
        id,
      },
    });
  };

  const handleOpenCategory = () => {
    const openAdd = `openAdd${_.capitalize(category)}Category`;

    customDispatch({
      type: openAdd,
      payload: {
        open: true,
      },
    });
  };

  const { mutateAsync: disableCategoryMutateAsync } = useMutation({
    mutationFn: disableCategory,
  });

  const handleActivateCategory = (id, active) => {
    Swal.fire({
      title: active ? 'Disabling Category' : 'Activating Category',
      text: `Do you want to ${active ? 'disable' : 'activate'} category?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        disableCategoryMutateAsync(
          {
            id,
            active: !active,
          },
          {
            onSettled: () => {
              queryClient.invalidateQueries(['category']);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType('info', data));
            },
            onError: (error) => {
              customDispatch(globalAlertType('error', error));
            },
          }
        );
      }
    });
  };

  const modifiedColumns = [
    ...getColumns(category),
    {
      field: null,
      title: 'Status',
      render: ({ id, active }) => {
        return (
          <Button
            color={active ? 'success' : 'error'}
            sx={{
              bgcolor: active ? 'success.lighter' : 'error.lighter',
              color: active ? 'success.darker' : 'error.darker',
            }}
            onClick={() => handleActivateCategory(id, active)}
          >
            {active ? 'Active' : 'Disabled'}
          </Button>
        );
      },
    },
    {
      field: '',
      title: 'Action',
      export: false,
      render: ({ id }) => {
        return (
          <ActionMenu>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => handleEditCategory(id)}
            >
              Edit
            </MenuItem>
            <MenuItem sx={{ fontSize: 13 }} onClick={() => removeCategory(id)}>
              Remove
            </MenuItem>
          </ActionMenu>
        );
      },
    },
  ];

  const columns = modifiedColumns.map((column) => {
    return { ...column };
  });

  if (!category) {
    return <Navigate to='/' />;
  }

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 0,
        py: 4,
        border: '1px solid lightgray',
      }}
    >
      <MaterialTable
        title={pageInfo.category}
        icons={tableIcons}
        components={{
          Toolbar: (params) => {
            return (
              <>
                <MTableToolbar {...params} />
                <Box
                  display='flex'
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  justifyContent='space-between'
                  alignItems='center'
                  gap={2}
                  padding={2}
                >
                  <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={handleOpenCategory}
                  >
                    New {pageInfo.category}
                  </Button>
                </Box>
              </>
            );
          },
        }}
        columns={columns}
        // isLoading={categories.isLoading}
        data={categories.data}
        options={{
          paginationType: 'stepped',
          searchFieldVariant: 'outlined',
          searchFieldStyle: {
            borderRadius: '20px',
            fontSize: '13px',
            marginTop: '10px',
            marginRight: '20px',
            height: '40px',
            width: '300px',
          },
          exportAllData: true,
          exportButton: true,
          selection: true,
          showSelectAllCheckbox: true,
          columnsButton: true,
        }}
        style={{
          padding: '12px',
          boxShadow: 'none',
        }}
        actions={[
          {
            icon: () => <DeleteRounded />,
            position: 'toolbarOnSelect',
            tooltip: 'Delete all',
            onClick: removeAllCategory,
          },
          {
            icon: () => <Refresh />,
            position: 'toolbar',
            tooltip: 'Refresh',
            onClick: () => refetch(),
          },
        ]}
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default ViewCategory;
